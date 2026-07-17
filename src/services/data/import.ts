import { z } from 'zod'
import { db } from './db'
import { getWorkoutTotalCalories } from '../fitness/kcal'
import type { ExportBundle, ImportStats, ImportPreview } from '@/types/export'
import type { 
  Workout, 
  WorkoutExercise, 
  Profile, 
  AIWorkoutFeedback, 
  ExerciseEstimate 
} from '@/types/models'
import type { MetricDef, MetricEntry, PhotoAsset, AiBodyEval } from '@/types/body-metrics'
import { toLocalDate } from '@/domain/date/localDate'
import type { WeeklyReview } from '@/domain/weekly-review/types'

const ISOStringSchema = z.string().refine(
  value => !Number.isNaN(Date.parse(value)),
  'Expected an ISO-compatible date string'
)

const EntitySchema = z.object({
  id: z.string().min(1)
}).passthrough()

const WorkoutExerciseSchema = z.object({
  type: z.enum(['run', 'pullups', 'pushups', 'plank', 'custom']),
  details: z.record(z.unknown())
}).passthrough()

const ProfileSchema = EntitySchema.extend({
  name: z.string(),
  age: z.number(),
  gender: z.enum(['male', 'female', 'other']),
  height: z.number(),
  weight: z.number(),
  goal: z.string(),
  constraints: z.array(z.string()),
  equipment: z.array(z.string()),
  frequency: z.number(),
  duration: z.number(),
  language: z.enum(['en', 'ru']),
  goalsDetailed: z.string(),
  createdAt: ISOStringSchema,
  updatedAt: ISOStringSchema
})

const WorkoutSchema = EntitySchema.extend({
  date: ISOStringSchema,
  exercises: z.array(WorkoutExerciseSchema),
  createdAt: ISOStringSchema,
  updatedAt: ISOStringSchema
})

const FoodSchema = EntitySchema.extend({
  calories: z.number(),
  date: ISOStringSchema,
  createdAt: ISOStringSchema,
  updatedAt: ISOStringSchema
})

const CheckinSchema = EntitySchema.extend({
  weekStart: ISOStringSchema,
  weight: z.number(),
  allowPhotoInAI: z.boolean(),
  createdAt: ISOStringSchema
})

const AiMessageSchema = EntitySchema.extend({
  type: z.enum(['workout_review', 'weekly_advice', 'general']),
  content: z.string(),
  createdAt: ISOStringSchema
})

const PlanSchema = EntitySchema.extend({
  type: z.enum(['workout', 'nutrition', 'recovery']),
  title: z.string(),
  description: z.string(),
  forDate: ISOStringSchema,
  createdAt: ISOStringSchema
})

const AiFeedbackSchema = EntitySchema.extend({
  workoutId: z.string().min(1),
  language: z.enum(['en', 'ru']),
  rpe: z.number(),
  review: z.string(),
  model: z.string(),
  createdAt: ISOStringSchema
})

const MetricDefSchema = EntitySchema.extend({
  key: z.string(),
  label: z.string(),
  unit: z.enum(['kg', 'cm', '%', 'count', 'custom']),
  isActive: z.boolean(),
  createdAt: ISOStringSchema,
  updatedAt: ISOStringSchema
})

const MetricEntrySchema = EntitySchema.extend({
  defId: z.string().min(1),
  date: ISOStringSchema,
  value: z.number(),
  createdAt: ISOStringSchema,
  updatedAt: ISOStringSchema
})

const PhotoAssetSchema = EntitySchema.extend({
  date: ISOStringSchema,
  kind: z.enum(['front', 'side', 'back', 'other']),
  mime: z.string(),
  dataUrl: z.string(),
  createdAt: ISOStringSchema
})

const AiBodyEvalSchema = EntitySchema.extend({
  weekStart: ISOStringSchema,
  model: z.string(),
  language: z.enum(['en', 'ru']),
  consent: z.boolean(),
  summary: z.string(),
  createdAt: ISOStringSchema
})

const ExerciseEstimateSchema = EntitySchema.extend({
  signature: z.string(),
  type: z.enum(['run', 'pullups', 'pushups', 'plank', 'custom']),
  model: z.string(),
  kcal: z.number(),
  unit: z.enum(['per-session', 'per-set', 'per-rep', 'per-km', 'per-minute']),
  createdAt: ISOStringSchema,
  updatedAt: ISOStringSchema
})

// Structural validation shared by local import and Google Drive sync.
const ExportBundleSchema = z.object({
  schemaVersion: z.literal(1),
  exportedAt: ISOStringSchema,
  profile: ProfileSchema.optional(),
  workouts: z.array(WorkoutSchema).default([]),
  food: z.array(FoodSchema).default([]),
  checkins: z.array(CheckinSchema).default([]),
  weeklyData: z.array(z.unknown()).default([]),
  ai: z.array(AiMessageSchema).default([]),
  plans: z.array(PlanSchema).default([]),
  ai_feedback: z.array(AiFeedbackSchema).default([]),
  metric_defs: z.array(MetricDefSchema).default([]),
  metric_entries: z.array(MetricEntrySchema).default([]),
  photo_assets: z.array(PhotoAssetSchema).default([]),
  ai_body_evals: z.array(AiBodyEvalSchema).default([]),
  exercise_estimates: z.array(ExerciseEstimateSchema).default([]),
  weekly_reviews: z.array(EntitySchema.extend({
    weekStart: ISOStringSchema,
    energy: z.number().min(1).max(5),
    sleepQuality: z.number().min(1).max(5),
    soreness: z.number().min(1).max(5),
    mood: z.number().min(1).max(5),
    adherence: z.number().min(0).max(100),
    createdAt: ISOStringSchema,
    updatedAt: ISOStringSchema
  })).default([])
}).passthrough()

export class ImportError extends Error {
  constructor(message: string, public code: 'FILE_TOO_LARGE' | 'INVALID_FORMAT' | 'PARSE_ERROR' | 'VALIDATION_ERROR' | 'IMPORT_ERROR') {
    super(message)
    this.name = 'ImportError'
  }
}

export function parseExportBundle(data: unknown): ExportBundle {
  try {
    return ExportBundleSchema.parse(data) as unknown as ExportBundle
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ImportError('Invalid backup data', 'VALIDATION_ERROR')
    }
    throw error
  }
}

export async function validateFile(file: File): Promise<ExportBundle> {
  // Check file size (20MB limit)
  const MAX_SIZE = 20 * 1024 * 1024 // 20MB
  if (file.size > MAX_SIZE) {
    throw new ImportError('File too large (max 20MB)', 'FILE_TOO_LARGE')
  }

  // Check file type
  if (!file.type.includes('json') && !file.name.endsWith('.json')) {
    throw new ImportError('Invalid file format', 'INVALID_FORMAT')
  }

  try {
    const text = await file.text()
    const data = JSON.parse(text)

    return parseExportBundle(data)
  } catch (error) {
    if (error instanceof ImportError) {
      throw error
    }
    if (error instanceof SyntaxError) {
      throw new ImportError('Failed to parse file', 'PARSE_ERROR')
    }
    throw new ImportError('Invalid file format', 'VALIDATION_ERROR')
  }
}

export function getImportPreview(bundle: ExportBundle): ImportPreview {
  return {
    hasProfile: !!bundle.profile,
    workoutsCount: bundle.workouts?.length || 0,
    foodCount: bundle.food?.length || 0,
    checkinsCount: bundle.checkins?.length || 0,
    aiCount: bundle.ai?.length || 0,
    plansCount: bundle.plans?.length || 0,
    exportedAt: bundle.exportedAt,
    schemaVersion: bundle.schemaVersion
  }
}

function migrateWorkout(workout: Workout, profile?: Profile): Workout {
  const migratedWorkout = { ...workout }
  
  // Migrate exercises
  migratedWorkout.exercises = workout.exercises.map((exercise: WorkoutExercise) => {
    const migratedExercise = { ...exercise }
    
    // Migrate plank seconds: number -> number[]
    if (exercise.type === 'plank' && exercise.details.seconds) {
      if (typeof exercise.details.seconds === 'number') {
        migratedExercise.details = {
          ...exercise.details,
          seconds: [exercise.details.seconds]
        }
      }
    }
    
    // Calculate missing kcalEstimated
    if (!exercise.kcalEstimated && profile?.weight) {
      migratedExercise.kcalEstimated = getWorkoutTotalCalories({ 
        id: workout.id || 'temp',
        date: workout.date || new Date().toISOString(),
        exercises: [exercise], 
        rpe: workout.rpe || 5,
        createdAt: workout.createdAt || new Date().toISOString(),
        updatedAt: workout.updatedAt || new Date().toISOString()
      } as Workout, profile.weight)
    }
    
    return migratedExercise
  })
  
  // Calendar dates intentionally stay timezone-free.
  if (migratedWorkout.date) {
    migratedWorkout.date = toLocalDate(
      typeof migratedWorkout.date === 'string'
        ? migratedWorkout.date
        : new Date(migratedWorkout.date)
    )
  }
  
  return migratedWorkout
}

function ensureISODates<T>(obj: T, calendarFields: string[] = []): T {
  if (!obj) return obj
  
  const result = { ...(obj as Record<string, unknown>) }
  
  // Common date fields to convert
  const dateFields = ['createdAt', 'updatedAt', 'exportedAt']
  
  for (const field of dateFields) {
    if (result[field] && typeof result[field] !== 'string') {
      result[field] = new Date(result[field] as string | number | Date).toISOString()
    }
  }

  for (const field of calendarFields) {
    if (result[field]) {
      const value = result[field]
      result[field] = toLocalDate(
        typeof value === 'string' ? value : new Date(value as number | Date)
      )
    }
  }
  
  return result as T
}

function getTimestamp(
  value: Record<string, unknown>,
  fields: string[]
): number | null {
  for (const field of fields) {
    const candidate = value[field]
    if (typeof candidate !== 'string') {
      continue
    }

    const timestamp = Date.parse(candidate)
    if (!Number.isNaN(timestamp)) {
      return timestamp
    }
  }

  return null
}

export function isRemoteRecordNewer(
  remote: unknown,
  local: unknown,
  timestampFields: string[]
): boolean {
  if (
    typeof remote !== 'object' ||
    remote === null ||
    typeof local !== 'object' ||
    local === null
  ) {
    return false
  }

  const remoteTimestamp = getTimestamp(remote as Record<string, unknown>, timestampFields)
  const localTimestamp = getTimestamp(local as Record<string, unknown>, timestampFields)

  if (remoteTimestamp === null) {
    return false
  }

  return localTimestamp === null || remoteTimestamp > localTimestamp
}

export async function importData(bundle: ExportBundle, mode: 'replace' | 'merge' = 'replace'): Promise<ImportStats> {
  const stats: ImportStats = {
    profileReplaced: false,
    workoutsUpserted: 0,
    foodUpserted: 0,
    checkinsUpserted: 0,
    aiUpserted: 0,
    plansUpserted: 0,
    mode
  }

  try {
    await db.transaction('rw', [db.profiles, db.workouts, db.food, db.checkins, db.ai, db.plans, db.ai_feedback, db.metric_defs, db.metric_entries, db.photo_assets, db.ai_body_evals, db.exercise_estimates, db.weekly_reviews], async () => {
      if (mode === 'replace') {
        // Clear all tables
        await Promise.all([
          db.profiles.clear(),
          db.workouts.clear(),
          db.food.clear(),
          db.checkins.clear(),
          db.ai.clear(),
          db.plans.clear(),
          db.ai_feedback.clear(),
          db.metric_defs.clear(),
          db.metric_entries.clear(),
          db.photo_assets.clear(),
          db.ai_body_evals.clear(),
          db.exercise_estimates.clear(),
          db.weekly_reviews.clear()
        ])
      }

      // Import profile
      if (bundle.profile) {
        const migratedProfile = {
          ...ensureISODates(bundle.profile),
          id: 'me'
        }

        if (mode === 'replace') {
          await db.profiles.put(migratedProfile)
          stats.profileReplaced = true
        } else {
          const existing = await db.profiles.get('me')
          if (!existing || isRemoteRecordNewer(migratedProfile, existing, ['updatedAt', 'createdAt'])) {
            await db.profiles.put(migratedProfile)
            stats.profileReplaced = true
          }
        }
      }

      // Import workouts
      if (bundle.workouts?.length) {
        const migratedWorkouts = bundle.workouts.map(w => migrateWorkout(w, bundle.profile))
        
        if (mode === 'replace') {
          await db.workouts.bulkPut(migratedWorkouts)
          stats.workoutsUpserted = migratedWorkouts.length
        } else {
          // Merge mode: check updatedAt or just put
          for (const workout of migratedWorkouts) {
            const existing = await db.workouts.get(workout.id)
            if (!existing || isRemoteRecordNewer(workout, existing, ['updatedAt', 'createdAt', 'date'])) {
              await db.workouts.put(workout)
              stats.workoutsUpserted++
            }
          }
        }
      }

      // Import food logs
      if (bundle.food?.length) {
        const migratedFood = bundle.food.map(food => ensureISODates(food, ['date']))
        
        if (mode === 'replace') {
          await db.food.bulkPut(migratedFood)
          stats.foodUpserted = migratedFood.length
        } else {
          for (const food of migratedFood) {
            const existing = await db.food.get(food.id)
            if (!existing || isRemoteRecordNewer(food, existing, ['updatedAt', 'createdAt', 'date'])) {
              await db.food.put(food)
              stats.foodUpserted++
            }
          }
        }
      }

      // Import checkins
      if (bundle.checkins?.length) {
        const migratedCheckins = bundle.checkins.map(checkin => ensureISODates(checkin, ['weekStart']))
        
        if (mode === 'replace') {
          await db.checkins.bulkPut(migratedCheckins)
          stats.checkinsUpserted = migratedCheckins.length
        } else {
          for (const checkin of migratedCheckins) {
            const existing = await db.checkins.get(checkin.id)
            if (!existing || isRemoteRecordNewer(checkin, existing, ['createdAt', 'weekStart'])) {
              await db.checkins.put(checkin)
              stats.checkinsUpserted++
            }
          }
        }
      }

      // Import AI messages
      if (bundle.ai?.length) {
        const migratedAi = bundle.ai.map(ai => ensureISODates(ai))
        
        if (mode === 'replace') {
          await db.ai.bulkPut(migratedAi)
          stats.aiUpserted = migratedAi.length
        } else {
          for (const ai of migratedAi) {
            const existing = await db.ai.get(ai.id)
            if (!existing || isRemoteRecordNewer(ai, existing, ['createdAt'])) {
              await db.ai.put(ai)
              stats.aiUpserted++
            }
          }
        }
      }

      // Import plans
      if (bundle.plans?.length) {
        const migratedPlans = bundle.plans.map(plan => ensureISODates(plan, ['forDate']))
        
        if (mode === 'replace') {
          await db.plans.bulkPut(migratedPlans)
          stats.plansUpserted = migratedPlans.length
        } else {
          for (const plan of migratedPlans) {
            const existing = await db.plans.get(plan.id)
            if (!existing || isRemoteRecordNewer(plan, existing, ['createdAt', 'forDate'])) {
              await db.plans.put(plan)
              stats.plansUpserted++
            }
          }
        }
      }

      // Import AI feedback
      if (bundle.ai_feedback?.length) {
        const migratedAiFeedback = bundle.ai_feedback.map(feedback => ensureISODates(feedback))
        
        if (mode === 'replace') {
          await db.ai_feedback.bulkPut(migratedAiFeedback as AIWorkoutFeedback[])
        } else {
          for (const feedback of migratedAiFeedback) {
            const existing = await db.ai_feedback.get((feedback as AIWorkoutFeedback).id)
            if (!existing || isRemoteRecordNewer(feedback, existing, ['createdAt'])) {
              await db.ai_feedback.put(feedback as AIWorkoutFeedback)
            }
          }
        }
      }

      // Import metric definitions
      if (bundle.metric_defs?.length) {
        const migratedMetricDefs = bundle.metric_defs.map(def => ensureISODates(def))
        
        if (mode === 'replace') {
          await db.metric_defs.bulkPut(migratedMetricDefs as MetricDef[])
        } else {
          for (const def of migratedMetricDefs) {
            const existing = await db.metric_defs.get((def as MetricDef).id)
            if (!existing || isRemoteRecordNewer(def, existing, ['updatedAt', 'createdAt'])) {
              await db.metric_defs.put(def as MetricDef)
            }
          }
        }
      }

      // Import metric entries
      if (bundle.metric_entries?.length) {
        const migratedMetricEntries = bundle.metric_entries.map(entry => ensureISODates(entry, ['date']))
        
        if (mode === 'replace') {
          await db.metric_entries.bulkPut(migratedMetricEntries as MetricEntry[])
        } else {
          for (const entry of migratedMetricEntries) {
            const existing = await db.metric_entries.get((entry as MetricEntry).id)
            if (!existing || isRemoteRecordNewer(entry, existing, ['updatedAt', 'createdAt', 'date'])) {
              await db.metric_entries.put(entry as MetricEntry)
            }
          }
        }
      }

      // Import photo assets
      if (bundle.photo_assets?.length) {
        const migratedPhotoAssets = bundle.photo_assets.map(photo => ensureISODates(photo, ['date']))
        
        if (mode === 'replace') {
          await db.photo_assets.bulkPut(migratedPhotoAssets as PhotoAsset[])
        } else {
          for (const photo of migratedPhotoAssets) {
            const existing = await db.photo_assets.get((photo as PhotoAsset).id)
            if (!existing || isRemoteRecordNewer(photo, existing, ['createdAt', 'date'])) {
              await db.photo_assets.put(photo as PhotoAsset)
            }
          }
        }
      }

      // Import AI body evaluations
      if (bundle.ai_body_evals?.length) {
        const migratedAiBodyEvals = bundle.ai_body_evals.map(evaluation => ensureISODates(evaluation, ['weekStart']))
        
        if (mode === 'replace') {
          await db.ai_body_evals.bulkPut(migratedAiBodyEvals as AiBodyEval[])
        } else {
          for (const evaluation of migratedAiBodyEvals) {
            const existing = await db.ai_body_evals.get((evaluation as AiBodyEval).id)
            if (!existing || isRemoteRecordNewer(evaluation, existing, ['createdAt', 'weekStart'])) {
              await db.ai_body_evals.put(evaluation as AiBodyEval)
            }
          }
        }
      }

      // Import exercise estimates
      if (bundle.exercise_estimates?.length) {
        const migratedExerciseEstimates = bundle.exercise_estimates.map(estimate => ensureISODates(estimate))
        
        if (mode === 'replace') {
          await db.exercise_estimates.bulkPut(migratedExerciseEstimates as ExerciseEstimate[])
        } else {
          for (const estimate of migratedExerciseEstimates) {
            const existing = await db.exercise_estimates.get((estimate as ExerciseEstimate).id)
            if (!existing || isRemoteRecordNewer(estimate, existing, ['updatedAt', 'createdAt'])) {
              await db.exercise_estimates.put(estimate as ExerciseEstimate)
            }
          }
        }
      }

      if (bundle.weekly_reviews?.length) {
        const reviews = bundle.weekly_reviews.map(review => ensureISODates(review, ['weekStart']))
        if (mode === 'replace') {
          await db.weekly_reviews.bulkPut(reviews as WeeklyReview[])
        } else {
          for (const review of reviews) {
            const weeklyReview = review as WeeklyReview
            const existing = await db.weekly_reviews.get(weeklyReview.id)
            if (!existing || isRemoteRecordNewer(weeklyReview, existing, ['updatedAt', 'createdAt'])) {
              await db.weekly_reviews.put(weeklyReview)
            }
          }
        }
      }
    })

    return stats
  } catch (error) {
    if (error instanceof ImportError) {
      throw error
    }
    throw new ImportError('Failed to import data', 'IMPORT_ERROR')
  }
}
