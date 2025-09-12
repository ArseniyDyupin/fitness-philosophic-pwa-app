import { create } from 'zustand'
import { db } from '@services/db'
import { calculateWorkoutCalories, calculateWorkoutDuration } from '@services/kcal'
import { startOfYear, subDays, format, eachDayOfInterval } from 'date-fns'
import type { Workout } from '@/types/models'
import type { StatsData, StatsRange, StatsKPI, DisciplineStats, TrendData, PersonalRecords, ConsistencyData, BodyMetricsData } from '@/types/stats'

interface StatsState {
  data: StatsData | null
  isLoading: boolean
  error: string | null
  
  // Actions
  loadStats: (range: StatsRange, startDate?: string, endDate?: string) => Promise<void>
  clearStats: () => void
}

// Utility functions
const getDateRange = (range: StatsRange, startDate?: string, endDate?: string) => {
  const now = new Date()
  
  switch (range) {
    case 'all':
      return { start: null, end: null }
    case 'ytd':
      return { start: startOfYear(now), end: now }
    case 'last30':
      return { start: subDays(now, 30), end: now }
    case 'last90':
      return { start: subDays(now, 90), end: now }
    case 'custom':
      return { 
        start: startDate ? new Date(startDate) : null, 
        end: endDate ? new Date(endDate) : null 
      }
    default:
      return { start: subDays(now, 30), end: now }
  }
}

const calculateKPI = (workouts: Workout[], userWeight: number): StatsKPI => {
  const totalWorkouts = workouts.length
  const totalCalories = workouts.reduce((sum, workout) => 
    sum + calculateWorkoutCalories(workout.exercises, userWeight, workout.rpe), 0)
  const totalMinutes = workouts.reduce((sum, workout) => 
    sum + (workout.durationOverrideMin || calculateWorkoutDuration(workout.exercises)), 0)
  
  const avgRpe = workouts.length > 0 
    ? workouts.reduce((sum, workout) => sum + (workout.rpe || 0), 0) / workouts.length 
    : undefined
  
  const lastWorkout = workouts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
  const lastWorkoutDate = lastWorkout?.date
  
  const activeDays = new Set(workouts.map(w => w.date.split('T')[0])).size
  
  // Calculate workouts per week (rough estimate)
  const workoutsPerWeek = totalWorkouts > 0 && lastWorkout && workouts[workouts.length - 1]
    ? totalWorkouts / Math.max(1, Math.ceil((new Date(lastWorkout.date).getTime() - new Date(workouts[workouts.length - 1].date).getTime()) / (7 * 24 * 60 * 60 * 1000)))
    : undefined

  return {
    totalWorkouts,
    totalCalories: Math.round(totalCalories),
    totalMinutes: Math.round(totalMinutes),
    avgRpe: avgRpe ? Math.round(avgRpe * 10) / 10 : undefined,
    workoutsPerWeek: workoutsPerWeek ? Math.round(workoutsPerWeek * 10) / 10 : undefined,
    lastWorkoutDate,
    activeDays
  }
}

const calculateDisciplineStats = (workouts: Workout[], userWeight: number): DisciplineStats => {
  const stats: DisciplineStats = {
    run: { calories: 0, minutes: 0, distance: 0, sessions: 0 },
    pullups: { calories: 0, minutes: 0, reps: 0, sessions: 0 },
    pushups: { calories: 0, minutes: 0, reps: 0, sessions: 0 },
    plank: { calories: 0, minutes: 0, seconds: 0, sessions: 0 },
    custom: { calories: 0, minutes: 0, sessions: 0, exercises: [] }
  }

  workouts.forEach(workout => {
    workout.exercises.forEach(exercise => {
      const calories = calculateWorkoutCalories([exercise], userWeight, workout.rpe)
      const minutes = exercise.details.durationMin || 0
      
      switch (exercise.type) {
        case 'run':
          stats.run.calories += calories
          stats.run.minutes += minutes
          stats.run.distance += exercise.details.distanceKm || 0
          stats.run.sessions += 1
          break
        case 'pullups':
          stats.pullups.calories += calories
          stats.pullups.minutes += minutes
          stats.pullups.reps += exercise.details.repsPerSet?.reduce((a, b) => a + b, 0) || 0
          stats.pullups.sessions += 1
          break
        case 'pushups':
          stats.pushups.calories += calories
          stats.pushups.minutes += minutes
          stats.pushups.reps += exercise.details.repsPerSet?.reduce((a, b) => a + b, 0) || 0
          stats.pushups.sessions += 1
          break
        case 'plank':
          stats.plank.calories += calories
          stats.plank.minutes += minutes
          stats.plank.seconds += exercise.details.seconds?.reduce((a, b) => a + b, 0) || 0
          stats.plank.sessions += 1
          break
        case 'custom':
          stats.custom.calories += calories
          stats.custom.minutes += minutes
          stats.custom.sessions += 1
          
          const existingExercise = stats.custom.exercises.find(e => e.name === exercise.details.customExercise)
          if (existingExercise) {
            existingExercise.calories += calories
            existingExercise.minutes += minutes
          } else {
            stats.custom.exercises.push({
              name: exercise.details.customExercise || 'Custom Exercise',
              calories,
              minutes
            })
          }
          break
      }
    })
  })

  return stats
}

const calculateTrends = (workouts: Workout[], userWeight: number): TrendData[] => {
  const dailyData = new Map<string, { calories: number; minutes: number; distance: number }>()
  
  workouts.forEach(workout => {
    const date = workout.date.split('T')[0]
    const calories = calculateWorkoutCalories(workout.exercises, userWeight, workout.rpe)
    const minutes = workout.durationOverrideMin || calculateWorkoutDuration(workout.exercises)
    const distance = workout.exercises
      .filter(ex => ex.type === 'run')
      .reduce((sum, ex) => sum + (ex.details.distanceKm || 0), 0)
    
    const existing = dailyData.get(date) || { calories: 0, minutes: 0, distance: 0 }
    dailyData.set(date, {
      calories: existing.calories + calories,
      minutes: existing.minutes + minutes,
      distance: existing.distance + distance
    })
  })
  
  return Array.from(dailyData.entries())
    .map(([date, data]) => ({
      date,
      calories: Math.round(data.calories),
      minutes: Math.round(data.minutes),
      distance: Math.round(data.distance * 100) / 100,
      pace: data.distance > 0 ? Math.round((data.minutes / data.distance) * 100) / 100 : undefined
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

const calculateRecords = (workouts: Workout[]): PersonalRecords => {
  const records: PersonalRecords = {
    dates: {
      longestRunKm: [],
      bestPaceMinPerKm: [],
      maxPullups: [],
      maxPushups: [],
      longestPlankSec: []
    }
  }
  
  workouts.forEach(workout => {
    workout.exercises.forEach(exercise => {
      switch (exercise.type) {
        case 'run':
          const distance = exercise.details.distanceKm || 0
          if (distance > 0) {
            records.dates.longestRunKm.push({
              date: workout.date,
              value: distance
            })
            if (!records.longestRunKm || distance > records.longestRunKm) {
              records.longestRunKm = distance
            }
          }
          
          const pace = exercise.details.durationMin && distance > 0 
            ? exercise.details.durationMin / distance 
            : undefined
          if (pace) {
            records.dates.bestPaceMinPerKm.push({
              date: workout.date,
              value: pace
            })
            if (!records.bestPaceMinPerKm || pace < records.bestPaceMinPerKm) {
              records.bestPaceMinPerKm = pace
            }
          }
          break
        case 'pullups':
          const pullupReps = exercise.details.repsPerSet?.reduce((a, b) => a + b, 0) || 0
          if (pullupReps > 0) {
            records.dates.maxPullups.push({
              date: workout.date,
              value: pullupReps
            })
            if (!records.maxPullups || pullupReps > records.maxPullups) {
              records.maxPullups = pullupReps
            }
          }
          break
        case 'pushups':
          const pushupReps = exercise.details.repsPerSet?.reduce((a, b) => a + b, 0) || 0
          if (pushupReps > 0) {
            records.dates.maxPushups.push({
              date: workout.date,
              value: pushupReps
            })
            if (!records.maxPushups || pushupReps > records.maxPushups) {
              records.maxPushups = pushupReps
            }
          }
          break
        case 'plank':
          const plankSeconds = exercise.details.seconds?.reduce((a, b) => a + b, 0) || 0
          if (plankSeconds > 0) {
            records.dates.longestPlankSec.push({
              date: workout.date,
              value: plankSeconds
            })
            if (!records.longestPlankSec || plankSeconds > records.longestPlankSec) {
              records.longestPlankSec = plankSeconds
            }
          }
          break
      }
    })
  })
  
  // Sort all arrays by date
  Object.keys(records.dates).forEach(key => {
    records.dates[key].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  })
  
  return records
}

const calculateConsistency = (workouts: Workout[], startDate: Date | null, endDate: Date | null): ConsistencyData[] => {
  if (!startDate || !endDate) return []
  
  const dailyData = new Map<string, { calories: number; minutes: number; workouts: number }>()
  
  workouts.forEach(workout => {
    const date = workout.date.split('T')[0]
    const calories = calculateWorkoutCalories(workout.exercises, 70, workout.rpe) // Default weight
    const minutes = workout.durationOverrideMin || calculateWorkoutDuration(workout.exercises)
    
    const existing = dailyData.get(date) || { calories: 0, minutes: 0, workouts: 0 }
    dailyData.set(date, {
      calories: existing.calories + calories,
      minutes: existing.minutes + minutes,
      workouts: existing.workouts + 1
    })
  })
  
  const days = eachDayOfInterval({ start: startDate, end: endDate })
  return days.map(day => {
    const dateStr = format(day, 'yyyy-MM-dd')
    const data = dailyData.get(dateStr) || { calories: 0, minutes: 0, workouts: 0 }
    return {
      date: dateStr,
      calories: Math.round(data.calories),
      minutes: Math.round(data.minutes),
      workouts: data.workouts
    }
  })
}

export const useStatsStore = create<StatsState>((set) => ({
  data: null,
  isLoading: false,
  error: null,

  loadStats: async (range: StatsRange, startDate?: string, endDate?: string) => {
    set({ isLoading: true, error: null })
    
    try {
      const { start, end } = getDateRange(range, startDate, endDate)
      
      // Load workouts
      let workouts: Workout[] = []
      if (start && end) {
        workouts = await db.workouts
          .where('date')
          .between(start.toISOString(), end.toISOString())
          .toArray()
      } else {
        workouts = await db.workouts.orderBy('date').toArray()
      }
      
      // Load body metrics (placeholder for now)
      const bodyMetrics: BodyMetricsData = {
        metrics: [],
        entries: [],
        lastValues: {},
        trends: {}
      }
      
      // Calculate stats
      const userWeight = 70 // TODO: Get from profile
      const kpi = calculateKPI(workouts, userWeight)
      const discipline = calculateDisciplineStats(workouts, userWeight)
      const trends = calculateTrends(workouts, userWeight)
      const records = calculateRecords(workouts)
      const consistency = calculateConsistency(workouts, start, end)
      
      const statsData: StatsData = {
        range,
        startDate: start?.toISOString(),
        endDate: end?.toISOString(),
        kpi,
        discipline,
        trends,
        records,
        consistency,
        bodyMetrics
      }
      
      set({ data: statsData, isLoading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load stats',
        isLoading: false 
      })
    }
  },

  clearStats: () => {
    set({ data: null, error: null })
  }
}))
