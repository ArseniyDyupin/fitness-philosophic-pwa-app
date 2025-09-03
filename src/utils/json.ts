import { z } from 'zod'
import type { ExportData } from '@/types/models'

// Schema for validating export data
const ExportDataSchema = z.object({
  schemaVersion: z.number(),
  profile: z.object({
    id: z.string(),
    name: z.string(),
    age: z.number().min(12).max(90),
    gender: z.enum(['male', 'female', 'other']),
    height: z.number().min(100).max(250),
    weight: z.number().min(30).max(250),
    goal: z.object({
      types: z.array(z.enum(['weight_loss', 'muscle_gain', 'endurance', 'strength', 'general_fitness'])),
      targetWeight: z.number().optional(),
      targetEvent: z.string().optional(),
      description: z.string()
    }),
    constraints: z.array(z.string()),
    equipment: z.array(z.string()),
    frequency: z.number().min(1).max(7),
    duration: z.number().min(10).max(300),
    language: z.enum(['en', 'ru']),
    goalsDetailed: z.string(),
    createdAt: z.string().or(z.date()),
    updatedAt: z.string().or(z.date())
  }),
  workouts: z.array(z.object({
    id: z.string(),
    date: z.string().or(z.date()),
    exercises: z.array(z.object({
      type: z.enum(['run', 'pullups', 'pushups', 'plank', 'custom']),
      details: z.object({
        distanceKm: z.number().optional(),
        durationMin: z.number().optional(),
        sets: z.number().optional(),
        repsPerSet: z.array(z.number()).optional(),
        seconds: z.array(z.number()).optional(),
        notes: z.string().optional(),
        customExercise: z.string().optional()
      }),
      kcalEstimated: z.number().optional()
    })),
    rpe: z.number().optional(),
    aiReviewId: z.string().optional(),
    createdAt: z.string().or(z.date()),
    updatedAt: z.string().or(z.date())
  })),
  foodLogs: z.array(z.object({
    id: z.string(),
    calories: z.number().min(0).max(10000),
    protein: z.number().optional(),
    carbs: z.number().optional(),
    fat: z.number().optional(),
    date: z.string().or(z.date()),
    notes: z.string().optional(),
    createdAt: z.string().or(z.date()),
    updatedAt: z.string().or(z.date())
  })),
  checkins: z.array(z.object({
    id: z.string(),
    weekStart: z.string().or(z.date()),
    weight: z.number().min(30).max(250),
    waist: z.number().optional(),
    notes: z.string().optional(),
    photo: z.string().optional(),
    allowPhotoInAI: z.boolean(),
    createdAt: z.string().or(z.date()),
    updatedAt: z.string().or(z.date())
  })),
  aiPlans: z.array(z.object({
    id: z.string(),
    workoutId: z.string(),
    analysis: z.string(),
    nextWorkout: z.object({
      exercises: z.array(z.object({
        type: z.enum(['run', 'pullups', 'pushups', 'plank', 'custom']),
        details: z.object({
          distanceKm: z.number().optional(),
          durationMin: z.number().optional(),
          sets: z.number().optional(),
          repsPerSet: z.array(z.number()).optional(),
          seconds: z.array(z.number()).optional(),
          notes: z.string().optional(),
          customExercise: z.string().optional()
        }),
        kcalEstimated: z.number().optional()
      })),
      description: z.string(),
      tips: z.array(z.string())
    }),
    createdAt: z.string().or(z.date())
  })),
  exportedAt: z.string().or(z.date())
})

export function validateExportData(data: unknown): ExportData {
  try {
    const validated = ExportDataSchema.parse(data)
    
    // Convert date strings to Date objects
    return {
      ...validated,
      profile: {
        ...validated.profile,
        createdAt: new Date(validated.profile.createdAt),
        updatedAt: new Date(validated.profile.updatedAt)
      },
      workouts: validated.workouts.map(w => ({
        ...w,
        date: new Date(w.date),
        createdAt: new Date(w.createdAt),
        updatedAt: new Date(w.updatedAt)
      })),
      foodLogs: validated.foodLogs.map(f => ({
        ...f,
        date: new Date(f.date),
        createdAt: new Date(f.createdAt),
        updatedAt: new Date(f.updatedAt)
      })),
      checkins: validated.checkins.map(c => ({
        ...c,
        weekStart: new Date(c.weekStart),
        createdAt: new Date(c.createdAt),
        updatedAt: new Date(c.updatedAt)
      })),
      aiPlans: validated.aiPlans.map(p => ({
        ...p,
        createdAt: new Date(p.createdAt)
      })),
      exportedAt: new Date(validated.exportedAt)
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation failed: ${error.errors.map(e => e.message).join(', ')}`)
    }
    throw error
  }
}

export function safeJsonParse<T>(jsonString: string, validator?: (data: unknown) => T): T {
  try {
    const parsed = JSON.parse(jsonString)
    if (validator) {
      return validator(parsed)
    }
    return parsed as T
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Invalid JSON format')
    }
    throw error
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
