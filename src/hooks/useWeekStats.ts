import { useMemo } from 'react'
import { useWorkoutStore } from '@stores/workout.store'
import { useProfileStore } from '@stores/profile.store'
import { endOfWeek, isWithinInterval } from 'date-fns'
import { sumWorkoutKcal, sumWorkoutMinutes } from '@services/fitness'
import { localDateToDate, toLocalDate } from '@/domain/date/localDate'

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
  const userWeight = useProfileStore(s => s.profile?.weight ?? 70)

  const stats = useMemo((): WeekStats => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
    
    const weekWorkouts = workouts.filter(w => 
      isWithinInterval(localDateToDate(toLocalDate(w.date)), { start: weekStart, end: weekEnd }) && !w.isPlan
    )

    const calories = sumWorkoutKcal(weekWorkouts, userWeight)

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
      weekWorkouts.map(w => toLocalDate(w.date))
    ).size

    return {
      calories,
      minutes,
      exercises,
      workouts: weekWorkouts.length,
      rpeAvg,
      daysWithWorkouts: uniqueDays
    }
  }, [workouts, weekStart, userWeight])

  return stats
}
