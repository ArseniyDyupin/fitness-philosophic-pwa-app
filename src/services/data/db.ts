import Dexie from 'dexie'
import type { Profile, Workout, FoodLog, WeeklyCheckin, AiMessage, PlanSuggestion, ExerciseEstimate, AIWorkoutFeedback } from '@/types/models'
import type { MetricDef, MetricEntry, PhotoAsset, AiBodyEval } from '@/types/body-metrics'

export class AITrainerDB extends Dexie {
  profiles!: Dexie.Table<Profile, string>
  workouts!: Dexie.Table<Workout, string>
  food!: Dexie.Table<FoodLog, string>
  checkins!: Dexie.Table<WeeklyCheckin, string>
  ai!: Dexie.Table<AiMessage, string>
  plans!: Dexie.Table<PlanSuggestion, string>
  exercise_estimates!: Dexie.Table<ExerciseEstimate, string>
  ai_feedback!: Dexie.Table<AIWorkoutFeedback, string>
  metric_defs!: Dexie.Table<MetricDef, string>
  metric_entries!: Dexie.Table<MetricEntry, string>
  photo_assets!: Dexie.Table<PhotoAsset, string>
  ai_body_evals!: Dexie.Table<AiBodyEval, string>

  constructor() {
    super('AITrainerDB')
    
    // Version 1 - Initial schema
    this.version(1).stores({
      profiles: 'id',
      workouts: 'id,date,createdAt',
      food: 'id,date',
      checkins: 'id,weekStart',
      ai: 'id,createdAt',
      plans: 'id,createdAt,forDate',
      exercise_estimates: 'id,signature,type,createdAt'
    })
    
    // Version 2 - Add ai_feedback table
    this.version(2).stores({
      profiles: 'id',
      workouts: 'id,date,createdAt',
      food: 'id,date',
      checkins: 'id,weekStart',
      ai: 'id,createdAt',
      plans: 'id,createdAt,forDate',
      exercise_estimates: 'id,signature,type,createdAt',
      ai_feedback: 'id,workoutId,createdAt'
    }).upgrade(async () => {
      // Migration logic if needed
    })

    // Version 3 - Add body metrics tables
    this.version(3).stores({
      profiles: 'id',
      workouts: 'id,date,createdAt',
      food: 'id,date',
      checkins: 'id,weekStart',
      ai: 'id,createdAt',
      plans: 'id,createdAt,forDate',
      exercise_estimates: 'id,signature,type,createdAt',
      ai_feedback: 'id,workoutId,createdAt',
      metric_defs: 'id,key,isActive,createdAt',
      metric_entries: 'id,defId,date',
      photo_assets: 'id,date',
      ai_body_evals: 'id,weekStart,createdAt'
    }).upgrade(async (tx) => {
      
      // Initialize default metrics
      const defaultMetrics = [
        {
          id: 'weight',
          key: 'weight',
          label: 'metrics.default.weight',
          unit: 'kg',
          precision: 1,
          min: 30,
          max: 200,
          color: '#3B82F6',
          isActive: true,
          isRequired: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'waist',
          key: 'waist',
          label: 'metrics.default.waist',
          unit: 'cm',
          precision: 1,
          min: 50,
          max: 150,
          color: '#10B981',
          isActive: false,
          isRequired: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'chest',
          key: 'chest',
          label: 'metrics.default.chest',
          unit: 'cm',
          precision: 1,
          min: 70,
          max: 150,
          color: '#F59E0B',
          isActive: false,
          isRequired: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'bicep',
          key: 'bicep',
          label: 'metrics.default.bicep',
          unit: 'cm',
          precision: 1,
          min: 20,
          max: 60,
          color: '#8B5CF6',
          isActive: false,
          isRequired: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'thigh',
          key: 'thigh',
          label: 'metrics.default.thigh',
          unit: 'cm',
          precision: 1,
          min: 40,
          max: 100,
          color: '#EF4444',
          isActive: false,
          isRequired: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'bodyFat',
          key: 'bodyFat',
          label: 'metrics.default.bodyFat',
          unit: '%',
          precision: 1,
          min: 3,
          max: 50,
          color: '#6B7280',
          isActive: false,
          isRequired: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]

      await tx.table('metric_defs').bulkAdd(defaultMetrics)
    })
  }
}

export const db = new AITrainerDB()

// Helper functions for common operations
export const dbHelpers = {
  async getProfile(): Promise<Profile | undefined> {
    return await db.profiles.get('me')
  },

  async saveProfile(profile: Profile): Promise<void> {
    // Ensure profile has the correct ID
    const profileWithId = { ...profile, id: 'me' }
    await db.profiles.put(profileWithId)
  },

  async getWorkouts(limit?: number): Promise<Workout[]> {
    let query = db.workouts.orderBy('date').reverse()
    if (limit) {
      query = query.limit(limit)
    }
    return await query.toArray()
  },

  async getWorkoutsByDateRange(startDate: string, endDate: string): Promise<Workout[]> {
    return await db.workouts
      .where('date')
      .between(startDate, endDate)
      .toArray()
  },

  async getFoodLogsByDateRange(startDate: string, endDate: Date): Promise<FoodLog[]> {
    return await db.food
      .where('date')
      .between(startDate, endDate)
      .toArray()
  },

  async getCheckinByWeek(weekStart: string): Promise<WeeklyCheckin | undefined> {
    return await db.checkins
      .where('weekStart')
      .equals(weekStart)
      .first()
  },

  async getAIPlanByWorkout(workoutId: string): Promise<AiMessage | undefined> {
    return await db.ai
      .where('workoutId')
      .equals(workoutId)
      .first()
  },

  async getAIFeedbackByWorkout(workoutId: string): Promise<AIWorkoutFeedback | undefined> {
    try {
      if (!db.isOpen()) {
        await db.open()
      }
      
      const tableExists = db.tables.some(table => table.name === 'ai_feedback')
      
      if (!tableExists) {
        return undefined
      }
      
      const feedback = await db.ai_feedback
        .where('workoutId')
        .equals(workoutId)
        .first()
      return feedback
    } catch (error) {
      console.error('Error searching for AI feedback:', error)
      throw error
    }
  },

  async saveAIFeedback(feedback: AIWorkoutFeedback): Promise<void> {
    await db.ai_feedback.put(feedback)
  },

  async getAllAIFeedback(): Promise<AIWorkoutFeedback[]> {
    try {
      if (!db.isOpen()) {
        await db.open()
      }
      
      const tableExists = db.tables.some(table => table.name === 'ai_feedback')
      
      if (!tableExists) {
        return []
      }
      
      const allFeedback = await db.ai_feedback.toArray()
      return allFeedback
    } catch (error) {
      console.error('Error getting all AI feedback:', error)
      throw error
    }
  },

  async clearAllData(): Promise<void> {
    await db.transaction('rw', [db.profiles, db.workouts, db.food, db.checkins, db.ai, db.plans, db.exercise_estimates, db.ai_feedback], async () => {
      await db.profiles.clear()
      await db.workouts.clear()
      await db.food.clear()
      await db.checkins.clear()
      await db.ai.clear()
      await db.plans.clear()
      await db.exercise_estimates.clear()
      await db.ai_feedback.clear()
    })
  },

  async forceUpgrade(): Promise<void> {
    try {
      // Force database upgrade by closing and reopening
      await db.close()
      // The database will automatically upgrade when reopened
    } catch (error) {
      console.error('Failed to force database upgrade:', error)
    }
  },

  async debugDatabase(): Promise<void> {
    try {
      if (!db.isOpen()) {
        await db.open()
      }
      
      // Check if ai_feedback table exists
      const tableExists = db.tables.some(table => table.name === 'ai_feedback')
      
      if (tableExists) {
        try {
          const count = await db.ai_feedback.count()
          
          if (count > 0) {
            await db.ai_feedback.limit(1).first()
            // Debug info available if needed
          }
        } catch (error) {
          console.error('Error accessing ai_feedback table:', error)
        }
      }
    } catch (error) {
      console.error('Error in debugDatabase:', error)
    }
  }
}
