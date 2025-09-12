import { useMemo } from 'react'
import { useWorkoutStore } from '@stores/workout.store'
import { endOfWeek, isWithinInterval } from 'date-fns'
import { sumWorkoutKcal, sumWorkoutMinutes } from '@services/fitness'
import type { StatsPeriod, UseStatsOptions } from '@/types/hooks'

export interface StatsResult {
  calories: number
  minutes: number
  exercises: number
  workouts: number
  rpeAvg?: number
  daysWithWorkouts?: number // Only for week/month periods
  period: StatsPeriod
}

// Cache for stats calculations
const statsCache = new Map<string, { data: StatsResult; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

function getCacheKey(period: StatsPeriod, includeIncomplete: boolean): string {
  return `${period.type}-${period.start.getTime()}-${period.end.getTime()}-${includeIncomplete}`
}

function isCacheValid(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_TTL
}

function calculateStats(
  workouts: any[],
  period: StatsPeriod,
  includeIncomplete: boolean = false,
  userWeight: number = 70
): StatsResult {
  const cacheKey = getCacheKey(period, includeIncomplete)
  const cached = statsCache.get(cacheKey)
  
  if (cached && isCacheValid(cached.timestamp)) {
    return cached.data
  }

  // Filter workouts by period
  const filteredWorkouts = workouts.filter(w => {
    const workoutDate = new Date(w.date)
    const isInPeriod = isWithinInterval(workoutDate, { start: period.start, end: period.end })
    const isComplete = !w.isPlan
    return isInPeriod && (includeIncomplete || isComplete)
  })

  // Calculate basic stats
  const calories = sumWorkoutKcal(filteredWorkouts, userWeight)
  const minutes = sumWorkoutMinutes(filteredWorkouts)
  const exercises = filteredWorkouts.reduce((sum, workout) => 
    sum + (workout.exercises?.length ?? 0), 0
  )

  // Calculate RPE average
  const rpeSum = filteredWorkouts.reduce((sum, workout) => 
    sum + (workout.rpe ?? 0), 0
  )
  const rpeAvg = filteredWorkouts.length > 0 
    ? Math.round((rpeSum / filteredWorkouts.length) * 10) / 10 
    : undefined

  // Calculate days with workouts (for week/month periods)
  let daysWithWorkouts: number | undefined
  if (period.type === 'week' || period.type === 'month') {
    const uniqueDays = new Set(
      filteredWorkouts.map(w => new Date(w.date).toDateString())
    ).size
    daysWithWorkouts = uniqueDays
  }

  const result: StatsResult = {
    calories,
    minutes,
    exercises,
    workouts: filteredWorkouts.length,
    rpeAvg,
    daysWithWorkouts,
    period
  }

  // Cache the result
  statsCache.set(cacheKey, { data: result, timestamp: Date.now() })

  return result
}

// Main hook
export function useStats(options: UseStatsOptions = {}) {
  const workouts = useWorkoutStore(s => s.workouts)
  const { 
    period, 
    includeIncomplete = false
  } = options

  // Default to today if no period specified
  const defaultPeriod: StatsPeriod = {
    start: new Date(),
    end: new Date(),
    type: 'day'
  }

  const currentPeriod = period || defaultPeriod

  const stats = useMemo(() => {
    return calculateStats(workouts, currentPeriod, includeIncomplete)
  }, [workouts, currentPeriod, includeIncomplete])

  // Helper functions for common periods
  const getTodayStats = () => {
    const today = new Date()
    return calculateStats(workouts, {
      start: today,
      end: today,
      type: 'day'
    }, includeIncomplete)
  }

  const getWeekStats = (weekStart: Date) => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
    return calculateStats(workouts, {
      start: weekStart,
      end: weekEnd,
      type: 'week'
    }, includeIncomplete)
  }

  const getMonthStats = (monthStart: Date) => {
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0)
    return calculateStats(workouts, {
      start: monthStart,
      end: monthEnd,
      type: 'month'
    }, includeIncomplete)
  }

  const getYearStats = (yearStart: Date) => {
    const yearEnd = new Date(yearStart.getFullYear() + 1, 0, 0)
    return calculateStats(workouts, {
      start: yearStart,
      end: yearEnd,
      type: 'year'
    }, includeIncomplete)
  }

  // Clear cache function
  const clearCache = () => {
    statsCache.clear()
  }

  return {
    stats,
    getTodayStats,
    getWeekStats,
    getMonthStats,
    getYearStats,
    clearCache
  }
}

// Convenience hooks for backward compatibility
export function useTodayStats(_date = new Date()) {
  const { getTodayStats } = useStats()
  return getTodayStats()
}

export function useWeekStats(weekStart: Date) {
  const { getWeekStats } = useStats()
  return getWeekStats(weekStart)
}

// Export types for backward compatibility
export type { StatsResult as TodayStats, StatsResult as WeekStats }
