export interface Profile {
  id: string
  name: string
  age: number
  gender: 'male' | 'female' | 'other'
  height: number // cm
  weight: number // kg
  goal: Goal
  constraints: string[]
  equipment: string[]
  frequency: number // workouts per week
  duration: number // minutes per workout
  language: 'en' | 'ru'
  goalsDetailed: string
  createdAt: Date
  updatedAt: Date
}

export interface Goal {
  types: ('weight_loss' | 'muscle_gain' | 'endurance' | 'strength' | 'general_fitness')[]
  targetWeight?: number
  targetEvent?: string
  description: string
}

export interface WorkoutExercise {
  type: WorkoutType
  details: {
    distanceKm?: number // km for running
    durationMin?: number // minutes for this exercise
    sets?: number // for strength exercises
    repsPerSet?: number[] // array of reps for each set
    seconds?: number[] // array of seconds for plank repetitions
    notes?: string // exercise-specific notes
    customExercise?: string // name for custom exercises
  }
  kcalEstimated?: number // estimated calories for this exercise
}

export interface Workout {
  id: string
  date: Date
  exercises: WorkoutExercise[]
  rpe?: number // Rate of Perceived Exertion (1-10 scale)
  aiReviewId?: string // ID of AI review if available
  createdAt: Date
  updatedAt: Date
}

export type WorkoutType = 'run' | 'pullups' | 'pushups' | 'plank' | 'custom'

export interface FoodLog {
  id: string
  calories: number
  protein?: number // g
  carbs?: number // g
  fat?: number // g
  date: Date
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface WeeklyCheckin {
  id: string
  weekStart: Date // Monday of the week
  weight: number
  waist?: number // cm
  notes?: string
  photo?: string // base64
  allowPhotoInAI: boolean
  createdAt: Date
  updatedAt: Date
}

export interface AIPlan {
  id: string
  workoutId: string
  analysis: string
  nextWorkout: {
    exercises: WorkoutExercise[]
    description: string
    tips: string[]
  }
  createdAt: Date
}

export interface ExportData {
  schemaVersion: number
  profile: Profile
  workouts: Workout[]
  foodLogs: FoodLog[]
  checkins: WeeklyCheckin[]
  aiPlans: AIPlan[]
  exportedAt: Date
}

export interface Toast {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  duration?: number
}
