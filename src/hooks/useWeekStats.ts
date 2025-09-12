import { useMemo } from 'react'
import { useWorkoutStore } from '@stores/workout.store'
import { endOfWeek, isWithinInterval } from 'date-fns'
import { sumWorkoutKcal, sumWorkoutMinutes } from '@services/kcal'

export interface WeekStats {
  calories: number
  minutes: number
  exercises: number
  workouts: number
  rpeAvg?: number
  daysWithWorkouts: number
}

export function useWeekStats(weekStart: Date) {
  const workouts = useWorkoutStore(s => s.workouts)

  const stats = useMemo((): WeekStats => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
    
    const weekWorkouts = workouts.filter(w => 
      isWithinInterval(new Date(w.date), { start: weekStart, end: weekEnd }) && !w.isPlan
    )

    const calories = sumWorkoutKcal(weekWorkouts, 70)

    const minutes = sumWorkoutMinutes(weekWorkouts)

    const exercises = weekWorkouts.reduce((sum, workout) => 
      sum + (workout.exercises?.length ?? 0), 0
    )

    const rpeSum = weekWorkouts.reduce((sum, workout) => 
      sum + (workout.rpe ?? 0), 0
    )
    const rpeAvg = weekWorkouts.length > 0 
      ? Math.round((rpeSum / weekWorkouts.length) * 10) / 10 
      : undefined

    // Count unique days with workouts
    const uniqueDays = new Set(
      weekWorkouts.map(w => new Date(w.date).toDateString())
    ).size

    return {
      calories,
      minutes,
      exercises,
      workouts: weekWorkouts.length,
      rpeAvg,
      daysWithWorkouts: uniqueDays
    }
  }, [workouts, weekStart])

  return stats
}
