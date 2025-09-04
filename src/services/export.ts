import { db } from './db'
import type { ExportBundle } from '../types/models'
import { z } from 'zod'

// Validation schema for exported data
const ExportBundleSchema = z.object({
  schemaVersion: z.literal(1),
  exportedAt: z.string(),
  profile: z.object({
    id: z.string(),
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
    createdAt: z.string(),
    updatedAt: z.string()
  }).optional(),
  workouts: z.array(z.object({
    id: z.string(),
    date: z.string(),
    exercises: z.array(z.object({
      type: z.enum(['run', 'pullups', 'pushups', 'plank', 'custom']),
      distance: z.number().optional(),
      time: z.number().optional(),
      sets: z.number().optional(),
      reps: z.number().optional(),
      seconds: z.union([z.number(), z.array(z.number())]).optional(),
      customName: z.string().optional(),
      notes: z.string().optional(),
      kcalEstimated: z.number().optional()
    })),
    rpe: z.number().optional(),
    aiReviewId: z.string().optional(),
    createdAt: z.string(),
    updatedAt: z.string()
  })),
  food: z.array(z.object({
    id: z.string(),
    calories: z.number(),
    protein: z.number().optional(),
    carbs: z.number().optional(),
    fat: z.number().optional(),
    date: z.string(),
    notes: z.string().optional(),
    createdAt: z.string(),
    updatedAt: z.string()
  })),
  checkins: z.array(z.object({
    id: z.string(),
    weekStart: z.string(),
    weight: z.number(),
    waist: z.number().optional(),
    notes: z.string().optional(),
    photo: z.string().optional(),
    allowPhotoInAI: z.boolean(),
    createdAt: z.string()
  })),
  ai: z.array(z.object({
    id: z.string(),
    type: z.enum(['workout_review', 'weekly_advice', 'general']),
    content: z.string(),
    metadata: z.record(z.any()).optional(),
    createdAt: z.string()
  })),
  plans: z.array(z.object({
    id: z.string(),
    type: z.enum(['workout', 'nutrition', 'recovery']),
    title: z.string(),
    description: z.string(),
    forDate: z.string(),
    exercises: z.array(z.any()).optional(),
    createdAt: z.string()
  }))
})

/**
 * Export all user data to JSON
 */
export async function exportData(): Promise<ExportBundle> {
  try {
    // Get all data from the database
    const profile = await db.profiles.get('me')
    const workouts = await db.workouts.toArray()
    const food = await db.food.toArray()
    const checkins = await db.checkins.toArray()
    const ai = await db.ai.toArray()
    const plans = await db.plans.toArray()

    const exportBundle: ExportBundle = {
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      profile,
      workouts,
      food,
      checkins,
      ai,
      plans
    }

    return exportBundle
  } catch (error) {
    console.error('Export failed:', error)
    throw new Error('Failed to export data')
  }
}

/**
 * Import user data from JSON
 */
export async function importData(jsonData: any, mode: 'replace' | 'merge' = 'replace'): Promise<void> {
  try {
    // Validate the imported data
    const validatedData = ExportBundleSchema.parse(jsonData)
    
    if (validatedData.schemaVersion !== 1) {
      throw new Error('Unsupported data format version')
    }

    // Migration: Convert plank.seconds from number to array if needed
    const migrateWorkoutData = (workouts: any[]) => {
      return workouts.map(workout => ({
        ...workout,
        exercises: workout.exercises.map((exercise: any) => {
          if (exercise.type === 'plank' && typeof exercise.seconds === 'number') {
            return { ...exercise, seconds: [exercise.seconds] }
          }
          return exercise
        })
      }))
    }

    // Migration: Recalculate kcalEstimated if missing
    const recalculateCalories = (workouts: any[]) => {
      return workouts.map(workout => ({
        ...workout,
        exercises: workout.exercises.map((exercise: any) => {
          if (!exercise.kcalEstimated) {
            // Basic calorie calculation (can be enhanced)
            let calories = 0
            switch (exercise.type) {
              case 'run':
                if (exercise.distance && exercise.time) {
                  calories = Math.round((exercise.distance * 100) / (exercise.time / 60)) // Rough estimate
                }
                break
              case 'pullups':
              case 'pushups':
                if (exercise.sets && exercise.reps) {
                  calories = Math.round(exercise.sets * exercise.reps * 0.5) // Rough estimate
                }
                break
              case 'plank':
                if (exercise.seconds && Array.isArray(exercise.seconds)) {
                  const totalSeconds = exercise.seconds.reduce((sum: number, sec: number) => sum + sec, 0)
                  calories = Math.round(totalSeconds / 60 * 4) // 4 calories per minute
                }
                break
            }
            return { ...exercise, kcalEstimated: calories }
          }
          return exercise
        })
      }))
    }

    const migratedWorkouts = recalculateCalories(migrateWorkoutData(validatedData.workouts))

    if (mode === 'replace') {
      // Clear existing data and import new
      await db.transaction('rw', [db.profiles, db.workouts, db.food, db.checkins, db.ai, db.plans], async () => {
        await db.profiles.clear()
        await db.workouts.clear()
        await db.food.clear()
        await db.checkins.clear()
        await db.ai.clear()
        await db.plans.clear()

        // Import new data
        if (validatedData.profile) {
          await db.profiles.add(validatedData.profile)
        }
        
        if (migratedWorkouts.length > 0) {
          await db.workouts.bulkAdd(migratedWorkouts)
        }
        
        if (validatedData.food.length > 0) {
          await db.food.bulkAdd(validatedData.food)
        }
        
        if (validatedData.checkins.length > 0) {
          await db.checkins.bulkAdd(validatedData.checkins)
        }
        
        if (validatedData.ai.length > 0) {
          await db.ai.bulkAdd(validatedData.ai)
        }
        
        if (validatedData.plans.length > 0) {
          await db.plans.bulkAdd(validatedData.plans)
        }
      })
    } else {
      // Merge mode: update existing, create new
      await db.transaction('rw', [db.profiles, db.workouts, db.food, db.checkins, db.ai, db.plans], async () => {
        // Handle profile
        if (validatedData.profile) {
          const existingProfile = await db.profiles.get(validatedData.profile.id)
          if (existingProfile) {
            // Update if imported is newer
            if (new Date(validatedData.profile.updatedAt) > new Date(existingProfile.updatedAt)) {
              await db.profiles.put(validatedData.profile)
            }
          } else {
            await db.profiles.add(validatedData.profile)
          }
        }

        // Handle other data with conflict resolution
        const handleCollection = async (collection: any, data: any[], getKey: (item: any) => string) => {
          for (const item of data) {
            const existing = await collection.get(getKey(item))
            if (existing) {
              // Update if imported is newer
              if (new Date(item.updatedAt || item.createdAt) > new Date(existing.updatedAt || existing.createdAt)) {
                await collection.put(item)
              }
            } else {
              await collection.add(item)
            }
          }
        }

        await handleCollection(db.workouts, migratedWorkouts, (w) => w.id)
        await handleCollection(db.food, validatedData.food, (f) => f.id)
        await handleCollection(db.checkins, validatedData.checkins, (c) => c.id)
        await handleCollection(db.ai, validatedData.ai, (a) => a.id)
        await handleCollection(db.plans, validatedData.plans, (p) => p.id)
      })
    }

    console.log('Data imported successfully')
  } catch (error) {
    console.error('Import failed:', error)
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid data format: ${error.errors.map(e => e.message).join(', ')}`)
    }
    throw new Error('Failed to import data')
  }
}

/**
 * Download data as JSON file
 */
export function downloadData(data: ExportBundle, filename: string = 'ai-trainer-backup.json'): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  
  URL.revokeObjectURL(url)
}

/**
 * Read file and parse JSON data
 */
export function readFile(file: File): Promise<any> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const data = JSON.parse(content)
        resolve(data)
      } catch (error) {
        reject(new Error('Invalid JSON file'))
      }
    }
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }
    
    reader.readAsText(file)
  })
}
