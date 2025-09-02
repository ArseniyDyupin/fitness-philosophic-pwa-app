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
  type: 'weight_loss' | 'muscle_gain' | 'endurance' | 'strength' | 'general_fitness'
  targetWeight?: number
  targetEvent?: string
  description: string
}

export interface Workout {
  id: string
  type: WorkoutType
  durationMin: number
  calories: number
  date: Date
  notes?: string
  // Type-specific fields
  distance?: number // km for running
  reps?: number // for strength exercises
  sets?: number // for strength exercises
  weight?: number // kg for strength exercises
  customExercise?: string // for custom type
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
    type: WorkoutType
    durationMin: number
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
