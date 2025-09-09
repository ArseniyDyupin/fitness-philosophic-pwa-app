import Dexie from 'dexie'
import type { Profile, Workout, FoodLog, WeeklyCheckin, AiMessage, PlanSuggestion, ExerciseEstimate, AIWorkoutFeedback } from '../types/models'

export class AITrainerDB extends Dexie {
  profiles!: Dexie.Table<Profile, string>
  workouts!: Dexie.Table<Workout, string>
  food!: Dexie.Table<FoodLog, string>
  checkins!: Dexie.Table<WeeklyCheckin, string>
  ai!: Dexie.Table<AiMessage, string>
  plans!: Dexie.Table<PlanSuggestion, string>
  exercise_estimates!: Dexie.Table<ExerciseEstimate, string>
  ai_feedback!: Dexie.Table<AIWorkoutFeedback, string>

  constructor() {
    super('AITrainerDB')
    this.version(1).stores({
      profiles: 'id',
      workouts: 'id,date,createdAt',
      food: 'id,date',
      checkins: 'id,weekStart',
      ai: 'id,createdAt',
      plans: 'id,createdAt,forDate',
      exercise_estimates: 'id,signature,type,createdAt',
      ai_feedback: 'id,workoutId,createdAt'
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
    return await db.ai_feedback
      .where('workoutId')
      .equals(workoutId)
      .first()
  },

  async saveAIFeedback(feedback: AIWorkoutFeedback): Promise<void> {
    await db.ai_feedback.put(feedback)
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
  }
}
