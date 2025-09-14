import { useMemo } from 'react'
import { useWorkoutStore } from '@stores/workout.store'
import { isSameDay } from 'date-fns'
import { sumWorkoutKcal, sumWorkoutMinutes } from '@services/fitness'

export interface TodayStats {
  calories: number
  minutes: number
  exercises: number
  rpeAvg?: number
  workouts: number
}

export function useTodayStats(date = new Date()) {
  const workouts = useWorkoutStore(s => s.workouts)

  const stats = useMemo((): TodayStats => {
    const todayWorkouts = workouts.filter(w => 
      isSameDay(new Date(w.date), date) && !w.isPlan
    )

    const calories = sumWorkoutKcal(todayWorkouts, 70)

    const minutes = sumWorkoutMinutes(todayWorkouts)

    const exercises = todayWorkouts.reduce((sum, workout) => 
      sum + (workout.exercises?.length ?? 0), 0
    )

    const rpeSum = todayWorkouts.reduce((sum, workout) => 
      sum + (workout.rpe ?? 0), 0
    )
    const rpeAvg = todayWorkouts.length > 0 
      ? Math.round((rpeSum / todayWorkouts.length) * 10) / 10 
      : undefined

    return {
      calories,
      minutes,
      exercises,
      rpeAvg,
      workouts: todayWorkouts.length
    }
  }, [workouts, date])

  return stats
}
