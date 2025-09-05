import { db } from './db'
import { Workout, WorkoutExercise, FoodLog, WorkoutStatus } from '../types/models'

export interface WeekRange {
  startISO: string
  endISO: string
}

export interface WeekStats {
  range: WeekRange
  workoutsCount: number
  workoutKcalTotal: number
  foodKcalTotal: number
  weeklyBalance: number // food - workout
  avgRPE: number | null
  days: Array<{
    date: string
    workoutKcal: number       // completed only
    plannedKcal: number       // planned only
    foodKcal: number
    workouts: number          // completed count
    planned: number           // planned count
    items: Array<{            // для tooltip-а
      id: string
      status: WorkoutStatus
      kcal: number
      rpe?: number
      exercisesShort: string  // 1-2 строки summary
    }>
  }>
  volume: {
    run: { distanceKm: number; durationMin: number; sessions: number }
    pullups: { reps: number; sets: number; sessions: number }
    pushups: { reps: number; sets: number; sessions: number }
    plank: { seconds: number; holds: number; sessions: number }
    custom: { sessions: number }
  }
  prs: {
    longestRunKm?: number
    fastestRunPaceMinPerKm?: number
    maxPullupsTotalReps?: number
    maxPushupsTotalReps?: number
    longestPlankSec?: number
  }
  deltasVsPrevWeek: Partial<Record<keyof WeekStats['volume'], any>>
}

export async function getWeekStats(
  weekStart: Date,
  weekEnd: Date,
  _profileWeight?: number
): Promise<WeekStats> {
  const startISO = weekStart.toISOString().split('T')[0]
  const endISO = weekEnd.toISOString().split('T')[0]

  // Get workouts for the week
  const workouts = await db.workouts
    .where('date')
    .between(startISO, endISO, true, true)
    .toArray()

  // Get food logs for the week
  const foodLogs = await db.food
    .where('date')
    .between(startISO, endISO, true, true)
    .toArray()

  // Helper function to get workout status (default to 'completed' for old data)
  const getWorkoutStatus = (workout: Workout): WorkoutStatus => {
    return workout.status || 'completed'
  }

  // Helper function to create exercise summary
  const createExerciseSummary = (exercises: WorkoutExercise[]): string => {
    const summaries = exercises.map(ex => {
      switch (ex.type) {
        case 'run':
          return ex.details.distanceKm ? `${ex.details.distanceKm}км бег` : 'Бег'
        case 'pullups':
          return ex.details.repsPerSet ? `${ex.details.repsPerSet.reduce((a, b) => a + b, 0)} подтягиваний` : 'Подтягивания'
        case 'pushups':
          return ex.details.repsPerSet ? `${ex.details.repsPerSet.reduce((a, b) => a + b, 0)} отжиманий` : 'Отжимания'
        case 'plank':
          return ex.details.seconds ? `${Math.round(Array.isArray(ex.details.seconds) ? ex.details.seconds.reduce((a, b) => a + b, 0) / 60 : ex.details.seconds / 60)}мин планка` : 'Планка'
        case 'custom':
          return ex.details.customExercise || 'Свое упражнение'
        default:
          return 'Упражнение'
      }
    })
    return summaries.slice(0, 2).join(', ') + (summaries.length > 2 ? '...' : '')
  }

  // Calculate daily breakdown
  const days = []
  const currentDate = new Date(weekStart)
  while (currentDate <= weekEnd) {
    const dateStr = currentDate.toISOString().split('T')[0]
    const dayWorkouts = workouts.filter((w: Workout) => w.date === dateStr)
    const dayFoodLogs = foodLogs.filter((f: FoodLog) => f.date === dateStr)
    
    // Separate completed and planned workouts
    const completedWorkouts = dayWorkouts.filter(w => getWorkoutStatus(w) === 'completed')
    const plannedWorkouts = dayWorkouts.filter(w => getWorkoutStatus(w) === 'planned')
    
    const dayWorkoutKcal = completedWorkouts.reduce((total: number, workout: Workout) => {
      return total + workout.exercises.reduce((sum: number, exercise: WorkoutExercise) => {
        return sum + (exercise.kcalEstimated || 0)
      }, 0)
    }, 0)
    
    const dayPlannedKcal = plannedWorkouts.reduce((total: number, workout: Workout) => {
      return total + workout.exercises.reduce((sum: number, exercise: WorkoutExercise) => {
        return sum + (exercise.kcalEstimated || 0)
      }, 0)
    }, 0)
    
    const dayFoodKcal = dayFoodLogs.reduce((total: number, log: FoodLog) => total + log.calories, 0)
    
    // Create items for tooltip
    const items = dayWorkouts.map(workout => ({
      id: workout.id,
      status: getWorkoutStatus(workout),
      kcal: workout.exercises.reduce((sum: number, exercise: WorkoutExercise) => sum + (exercise.kcalEstimated || 0), 0),
      rpe: workout.rpe,
      exercisesShort: createExerciseSummary(workout.exercises)
    }))
    
    days.push({
      date: dateStr,
      workoutKcal: dayWorkoutKcal,
      plannedKcal: dayPlannedKcal,
      foodKcal: dayFoodKcal,
      workouts: completedWorkouts.length,
      planned: plannedWorkouts.length,
      items
    })
    
    currentDate.setDate(currentDate.getDate() + 1)
  }

  // Calculate totals (only completed workouts)
  const completedWorkouts = workouts.filter(w => getWorkoutStatus(w) === 'completed')
  const workoutKcalTotal = completedWorkouts.reduce((total: number, workout: Workout) => {
    return total + workout.exercises.reduce((sum: number, exercise: WorkoutExercise) => {
      return sum + (exercise.kcalEstimated || 0)
    }, 0)
  }, 0)

  const foodKcalTotal = foodLogs.reduce((total: number, log: FoodLog) => total + log.calories, 0)
  const weeklyBalance = foodKcalTotal - workoutKcalTotal

  // Calculate average RPE (only completed workouts)
  const completedWorkoutsWithRPE = completedWorkouts.filter((w: Workout) => w.rpe !== undefined)
  const avgRPE = completedWorkoutsWithRPE.length > 0 
    ? completedWorkoutsWithRPE.reduce((sum: number, w: Workout) => sum + (w.rpe || 0), 0) / completedWorkoutsWithRPE.length
    : null

  // Calculate volume by exercise type
  const volume = {
    run: { distanceKm: 0, durationMin: 0, sessions: 0 },
    pullups: { reps: 0, sets: 0, sessions: 0 },
    pushups: { reps: 0, sets: 0, sessions: 0 },
    plank: { seconds: 0, holds: 0, sessions: 0 },
    custom: { sessions: 0 }
  }

  const prs = {
    longestRunKm: undefined as number | undefined,
    fastestRunPaceMinPerKm: undefined as number | undefined,
    maxPullupsTotalReps: undefined as number | undefined,
    maxPushupsTotalReps: undefined as number | undefined,
    longestPlankSec: undefined as number | undefined
  }

  // Process each completed workout (for volume and PRs)
  completedWorkouts.forEach((workout: Workout) => {
    workout.exercises.forEach((exercise: WorkoutExercise) => {
      switch (exercise.type) {
        case 'run':
          volume.run.sessions++
          if (exercise.details.distanceKm) {
            volume.run.distanceKm += exercise.details.distanceKm
            if (exercise.details.durationMin) {
              const pace = exercise.details.durationMin / exercise.details.distanceKm
              if (!prs.fastestRunPaceMinPerKm || pace < prs.fastestRunPaceMinPerKm) {
                prs.fastestRunPaceMinPerKm = pace
              }
            }
            if (!prs.longestRunKm || exercise.details.distanceKm > prs.longestRunKm) {
              prs.longestRunKm = exercise.details.distanceKm
            }
          }
          if (exercise.details.durationMin) {
            volume.run.durationMin += exercise.details.durationMin
          }
          break

        case 'pullups':
          volume.pullups.sessions++
          if (exercise.details.sets && exercise.details.repsPerSet) {
            volume.pullups.sets += exercise.details.sets
            const totalReps = exercise.details.repsPerSet.reduce((sum: number, reps: number) => sum + reps, 0)
            volume.pullups.reps += totalReps
            if (!prs.maxPullupsTotalReps || totalReps > prs.maxPullupsTotalReps) {
              prs.maxPullupsTotalReps = totalReps
            }
          }
          break

        case 'pushups':
          volume.pushups.sessions++
          if (exercise.details.sets && exercise.details.repsPerSet) {
            volume.pushups.sets += exercise.details.sets
            const totalReps = exercise.details.repsPerSet.reduce((sum: number, reps: number) => sum + reps, 0)
            volume.pushups.reps += totalReps
            if (!prs.maxPushupsTotalReps || totalReps > prs.maxPushupsTotalReps) {
              prs.maxPushupsTotalReps = totalReps
            }
          }
          break

        case 'plank':
          volume.plank.sessions++
          if (exercise.details.seconds) {
            const totalSeconds = Array.isArray(exercise.details.seconds) 
              ? exercise.details.seconds.reduce((sum: number, sec: number) => sum + sec, 0)
              : exercise.details.seconds
            volume.plank.seconds += totalSeconds
            volume.plank.holds += Array.isArray(exercise.details.seconds) 
              ? exercise.details.seconds.length 
              : 1
            if (!prs.longestPlankSec || totalSeconds > prs.longestPlankSec) {
              prs.longestPlankSec = totalSeconds
            }
          }
          break

        case 'custom':
          volume.custom.sessions++
          break
      }
    })
  })

  // Calculate deltas vs previous week (simplified for now)
  const deltasVsPrevWeek = {}

  return {
    range: { startISO, endISO },
    workoutsCount: completedWorkouts.length,
    workoutKcalTotal,
    foodKcalTotal,
    weeklyBalance,
    avgRPE,
    days,
    volume,
    prs,
    deltasVsPrevWeek
  }
}

export async function getPreviousWeekStats(
  weekStart: Date,
  weekEnd: Date,
  _profileWeight?: number
): Promise<WeekStats | null> {
  const prevWeekStart = new Date(weekStart)
  prevWeekStart.setDate(prevWeekStart.getDate() - 7)
  
  const prevWeekEnd = new Date(weekEnd)
  prevWeekEnd.setDate(prevWeekEnd.getDate() - 7)

  try {
    return await getWeekStats(prevWeekStart, prevWeekEnd, _profileWeight)
  } catch (error) {
    console.error('Failed to get previous week stats:', error)
    return null
  }
}

export function calculateDeltas(current: WeekStats, previous: WeekStats | null): Partial<Record<keyof WeekStats['volume'], any>> {
  if (!previous) return {}

  const deltas: any = {}

  // Calculate deltas for volume metrics
  Object.keys(current.volume).forEach(key => {
    const currentKey = key as keyof WeekStats['volume']
    const currentValue = current.volume[currentKey]
    const previousValue = previous.volume[currentKey]

    if (typeof currentValue === 'object' && typeof previousValue === 'object') {
      deltas[currentKey] = {}
      Object.keys(currentValue).forEach(subKey => {
        const currentSubValue = (currentValue as any)[subKey]
        const previousSubValue = (previousValue as any)[subKey]
        if (typeof currentSubValue === 'number' && typeof previousSubValue === 'number') {
          (deltas[currentKey] as any)[subKey] = currentSubValue - previousSubValue
        }
      })
    }
  })

  return deltas
}
