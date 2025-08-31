export interface AIWorkoutReview {
  analysis: string
  nextWorkout: {
    type: string
    durationMin: number
    description: string
    tips: string[]
  }
}

export interface AIWorkoutPayload {
  workout: {
    type: string
    durationMin: number
    calories: number
    date: string
    notes?: string
    distance?: number
    reps?: number
    sets?: number
    weight?: number
    customExercise?: string
  }
  profile: {
    age: number
    gender: string
    weight: number
    goal: {
      type: string
      description: string
    }
    constraints: string[]
  }
  recentWorkouts: Array<{
    type: string
    durationMin: number
    calories: number
    date: string
  }>
}

export interface AIWeeklyAdvicePayload {
  weekStart: string
  workouts: Array<{
    type: string
    durationMin: number
    calories: number
    date: string
  }>
  foodLogs: Array<{
    calories: number
    date: string
  }>
  checkin: {
    weight: number
    waist?: number
    notes?: string
  }
  profile: {
    goal: {
      type: string
      description: string
    }
  }
}
