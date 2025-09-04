import type { WorkoutExercise } from './models'

export interface AIWorkoutPayload {
  profile: {
    gender: string
    age: number
    heightCm: number
    weightKg: number
    goal: {
      types: string[]
      description: string
    }
    goalsDetailed: string
    language: string
  }
  workout: {
    exercises: WorkoutExercise[]
    rpe?: number
  }
  recentWorkouts: {
    exercises: WorkoutExercise[]
  }[]
}

export interface AIWorkoutReview {
  review: string
  nextWorkout: {
    exercises: WorkoutExercise[]
    description: string
    tips: string[]
  }
}

export interface AIWeeklyAdvicePayload {
  profile: {
    gender: string
    age: number
    heightCm: number
    weightKg: number
    goal: {
      types: string[]
      description: string
    }
    goalsDetailed: string
    language: string
  }
  workouts: {
    exercises: WorkoutExercise[]
    date: string
    rpe?: number
  }[]
  currentWeek: {
    startDate: string
    endDate: string
  }
}

export interface AIWeeklyAdvice {
  summary: string
  recommendations: string[]
  nextWeekPlan: string
}
