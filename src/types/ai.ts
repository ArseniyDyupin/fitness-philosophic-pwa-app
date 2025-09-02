export interface AIWorkoutReview {
  analysis: string
  nextWorkout: {
    exercises: Array<{
      type: string
      details: {
        distanceKm?: number
        durationMin?: number
        sets?: number
        repsPerSet?: number[]
        seconds?: number
        notes?: string
      }
      kcalEstimated?: number
    }>
    description: string
    tips: string[]
  }
}

export interface AIWorkoutPayload {
  workout: {
    date: string
    exercises: Array<{
      type: string
      details: {
        distanceKm?: number
        durationMin?: number
        sets?: number
        repsPerSet?: number[]
        seconds?: number
        notes?: string
      }
      kcalEstimated?: number
    }>
    rpe?: number
  }
  profile: {
    age: number
    gender: string
    weight: number
    goal: {
      types: string[]
      description: string
    }
    constraints: string[]
    goalsDetailed: string
  }
  recentWorkouts: Array<{
    date: string
    exercises: Array<{
      type: string
      details: {
        distanceKm?: number
        durationMin?: number
        sets?: number
        repsPerSet?: number[]
        seconds?: number
        notes?: string
      }
      kcalEstimated?: number
    }>
    rpe?: number
  }>
}

export interface AIWeeklyAdvicePayload {
  weekStart: string
  workouts: Array<{
    date: string
    exercises: Array<{
      type: string
      details: {
        distanceKm?: number
        durationMin?: number
        sets?: number
        repsPerSet?: number[]
        seconds?: number
        notes?: string
      }
      kcalEstimated?: number
    }>
    rpe?: number
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
      types: string[]
      description: string
    }
    goalsDetailed: string
  }
}
