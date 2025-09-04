export interface Profile {
  id: string                    // Always "me"
  name: string                  // User's name
  age: number                   // Age
  gender: 'male' | 'female' | 'other'  // Gender
  height: number                // Height in cm
  weight: number                // Weight in kg
  goal: string                  // Workout goals (simple text)
  constraints: string[]         // Physical constraints
  equipment: string[]           // Available equipment
  frequency: number             // Workout frequency per week
  duration: number              // Workout duration in minutes
  language: 'en' | 'ru'        // Interface language
  goalsDetailed: string         // Detailed description of goals
  createdAt: string            // ISO string
  updatedAt: string            // ISO string
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
  date: string                  // ISO string
  exercises: WorkoutExercise[]
  rpe?: number // Rate of Perceived Exertion (1-10 scale)
  aiReviewId?: string // ID of AI review if available
  createdAt: string            // ISO string
  updatedAt: string            // ISO string
}

export type WorkoutType = 'run' | 'pullups' | 'pushups' | 'plank' | 'custom'

export interface FoodLog {
  id: string
  calories: number
  protein?: number // g
  carbs?: number // g
  fat?: number // g
  date: string                   // ISO string
  notes?: string
  createdAt: string             // ISO string
  updatedAt: string             // ISO string
}

export interface WeeklyCheckin {
  id: string
  weekStart: string             // ISO string (Monday of the week)
  weight: number
  waist?: number // cm
  notes?: string
  photo?: string // base64
  allowPhotoInAI: boolean
  createdAt: string             // ISO string
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
  createdAt: string             // ISO string
}

export interface ExportBundle {
  schemaVersion: number
  exportedAt: string            // ISO string
  profile?: Profile
  workouts: Workout[]
  food: FoodLog[]
  checkins: WeeklyCheckin[]
  ai: AiMessage[]
  plans: PlanSuggestion[]
}

export interface AiMessage {
  id: string
  type: 'workout_review' | 'weekly_advice' | 'general'
  content: string
  metadata?: Record<string, any>
  createdAt: string            // ISO string
}

export interface PlanSuggestion {
  id: string
  type: 'workout' | 'nutrition' | 'recovery'
  title: string
  description: string
  forDate: string              // ISO string
  exercises?: WorkoutExercise[]
  createdAt: string            // ISO string
}

export interface Toast {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  duration?: number
}
