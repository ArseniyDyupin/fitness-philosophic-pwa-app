import { z } from 'zod'
import { db } from './db'
import { calculateWorkoutCalories } from './kcal'
import type { ExportBundle, ImportStats, ImportPreview } from '../../types/export'
import type { Workout, WorkoutExercise, Profile } from '../../types/models'

// Zod schema for validation
const ExportBundleSchema = z.object({
  schemaVersion: z.literal(1),
  exportedAt: z.string(),
  profile: z.any().optional(),
  workouts: z.array(z.any()).default([]),
  food: z.array(z.any()).default([]),
  checkins: z.array(z.any()).default([]),
  ai: z.array(z.any()).default([]),
  plans: z.array(z.any()).default([])
})

export class ImportError extends Error {
  constructor(message: string, public code: 'FILE_TOO_LARGE' | 'INVALID_FORMAT' | 'PARSE_ERROR' | 'VALIDATION_ERROR' | 'IMPORT_ERROR') {
    super(message)
    this.name = 'ImportError'
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
    
    // Validate with Zod
    const bundle = ExportBundleSchema.parse(data)
    
    return bundle as ExportBundle
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ImportError('Invalid file format', 'VALIDATION_ERROR')
    }
    throw new ImportError('Failed to parse file', 'PARSE_ERROR')
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
      migratedExercise.kcalEstimated = calculateWorkoutCalories([exercise], profile.weight, workout.rpe || 5)
    }
    
    return migratedExercise
  })
  
  // Ensure dates are ISO strings
  if (migratedWorkout.date && typeof migratedWorkout.date !== 'string') {
    migratedWorkout.date = new Date(migratedWorkout.date).toISOString()
  }
  
  return migratedWorkout
}

function ensureISODates(obj: any): any {
  if (!obj) return obj
  
  const result = { ...obj }
  
  // Common date fields to convert
  const dateFields = ['date', 'createdAt', 'updatedAt', 'exportedAt']
  
  for (const field of dateFields) {
    if (result[field] && typeof result[field] !== 'string') {
      result[field] = new Date(result[field]).toISOString()
    }
  }
  
  return result
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
    await db.transaction('rw', [db.profiles, db.workouts, db.food, db.checkins, db.ai, db.plans], async () => {
      if (mode === 'replace') {
        // Clear all tables
        await Promise.all([
          db.profiles.clear(),
          db.workouts.clear(),
          db.food.clear(),
          db.checkins.clear(),
          db.ai.clear(),
          db.plans.clear()
        ])
      }

      // Import profile
      if (bundle.profile) {
        const migratedProfile = ensureISODates(bundle.profile)
        if (mode === 'replace') {
          await db.profiles.put(migratedProfile)
          stats.profileReplaced = true
        } else {
          // In merge mode, always replace profile (there should be only one)
          await db.profiles.clear()
          await db.profiles.put(migratedProfile)
          stats.profileReplaced = true
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
            if (!existing || 
                (workout.updatedAt && existing.updatedAt && workout.updatedAt > existing.updatedAt) ||
                !existing.updatedAt) {
              await db.workouts.put(workout)
              stats.workoutsUpserted++
            }
          }
        }
      }

      // Import food logs
      if (bundle.food?.length) {
        const migratedFood = bundle.food.map(ensureISODates)
        
        if (mode === 'replace') {
          await db.food.bulkPut(migratedFood)
          stats.foodUpserted = migratedFood.length
        } else {
          for (const food of migratedFood) {
            const existing = await db.food.get(food.id)
            if (!existing || 
                (food.updatedAt && existing.updatedAt && food.updatedAt > existing.updatedAt) ||
                !existing.updatedAt) {
              await db.food.put(food)
              stats.foodUpserted++
            }
          }
        }
      }

      // Import checkins
      if (bundle.checkins?.length) {
        const migratedCheckins = bundle.checkins.map(ensureISODates)
        
        if (mode === 'replace') {
          await db.checkins.bulkPut(migratedCheckins)
          stats.checkinsUpserted = migratedCheckins.length
        } else {
          for (const checkin of migratedCheckins) {
            const existing = await db.checkins.get(checkin.id)
            if (!existing || 
                (checkin.createdAt && existing.createdAt && checkin.createdAt > existing.createdAt)) {
              await db.checkins.put(checkin)
              stats.checkinsUpserted++
            }
          }
        }
      }

      // Import AI messages
      if (bundle.ai?.length) {
        const migratedAi = bundle.ai.map(ensureISODates)
        
        if (mode === 'replace') {
          await db.ai.bulkPut(migratedAi)
          stats.aiUpserted = migratedAi.length
        } else {
          for (const ai of migratedAi) {
            const existing = await db.ai.get(ai.id)
            if (!existing || 
                (ai.createdAt && existing.createdAt && ai.createdAt > existing.createdAt)) {
              await db.ai.put(ai)
              stats.aiUpserted++
            }
          }
        }
      }

      // Import plans
      if (bundle.plans?.length) {
        const migratedPlans = bundle.plans.map(ensureISODates)
        
        if (mode === 'replace') {
          await db.plans.bulkPut(migratedPlans)
          stats.plansUpserted = migratedPlans.length
        } else {
          for (const plan of migratedPlans) {
            const existing = await db.plans.get(plan.id)
            if (!existing || 
                (plan.createdAt && existing.createdAt && plan.createdAt > existing.createdAt)) {
              await db.plans.put(plan)
              stats.plansUpserted++
            }
          }
        }
      }
    })

    return stats
  } catch (error) {
    console.error('Failed to import data:', error)
    throw new ImportError('Failed to import data', 'IMPORT_ERROR')
  }
}
