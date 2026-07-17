import type { WeeklyReview } from '@/domain/weekly-review/types'

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
    weightKg?: number // additional weight for exercises
  }
  kcalEstimated?: number // estimated calories for this exercise
  estimateMeta?: { 
    source?: "ai" | "local"
    cacheId?: string
    updatedAt?: string
  }
}

export interface Workout {
  id: string
  name?: string                 // Workout name
  description?: string          // Workout description
  date: string                  // Local calendar date (YYYY-MM-DD)
  exercises: WorkoutExercise[]
  rpe?: number // Rate of Perceived Exertion (1-10 scale) - will be filled by AI when analysis is enabled
  rpeSource?: "ai" | "manual"  // NEW: source of RPE value
  durationMin?: number // Total workout duration in minutes (user-specified)
  durationOverrideMin?: number // NEW: manual override for total duration
  aiReviewId?: string // ID of AI review if available
  status?: WorkoutStatus // NEW: default "completed" for old data
  isPlan?: boolean             // Whether this is a plan or completed workout
  notes?: string               // General workout notes
  createdAt: string            // ISO string
  updatedAt: string            // ISO string
}

export type WorkoutType = 'run' | 'pullups' | 'pushups' | 'plank' | 'custom'
export type WorkoutStatus = 'planned' | 'completed' | 'skipped'

export interface FoodLog {
  id: string
  calories: number
  protein?: number // g
  carbs?: number // g
  fat?: number // g
  date: string                   // Local calendar date (YYYY-MM-DD)
  notes?: string
  createdAt: string             // ISO string
  updatedAt: string             // ISO string
}

export interface WeeklyCheckin {
  id: string
  weekStart: string             // Local calendar date (Monday, YYYY-MM-DD)
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
  weekly_reviews?: WeeklyReview[]
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
  forDate: string              // Local calendar date (YYYY-MM-DD)
  exercises?: WorkoutExercise[]
  workoutTemplate?: Workout    // заготовка "следующая тренировка"
  notes?: string
  kcalTargetDay?: number
  createdAt: string            // ISO string
}

export interface Toast {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  duration?: number
}

// Plan realization types (UI-only, not persisted to DB)
export type ExerciseStatus = 'as_planned' | 'skipped' | 'less' | 'more' | 'edited'

export interface ExerciseEdit {
  index: number               // индекс упражнения в шаблоне
  status: ExerciseStatus
  edited?: Partial<WorkoutExercise['details']> // изменённые поля
  comment?: string            // комментарий к упражнению
}

export interface PlanRealizationDraft {
  planId: string
  date: string                // Local calendar date (YYYY-MM-DD)
  rpe?: number
  exerciseEdits: ExerciseEdit[]
  workoutComment?: string     // общий комментарий к тренировке
}

export interface ExerciseEstimate {
  id: string                 // hash(signature) — см. ниже
  signature: string          // канонизированная строка описания упражнения
  type: WorkoutType | "custom"
  model: "gpt-4o-mini"
  kcal: number               // оценка ккал за указанную единицу объёма
  durationMin?: number       // оценка длительности (мин) за указанный объём
  unit: "per-session" | "per-set" | "per-rep" | "per-km" | "per-minute" // что именно оценено
  meta?: { source: "ai" | "manual"; notes?: string }
  createdAt: string
  updatedAt: string
}

export interface AIWorkoutFeedback {
  id: string
  workoutId: string
  language: "ru" | "en"
  rpe: number               // 1..10
  review: string            // текстовый анализ тренировки
  model: "gpt-4o-mini"
  createdAt: string
}
