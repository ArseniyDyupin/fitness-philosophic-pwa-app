import Dexie from 'dexie'
import type { Table } from 'dexie'
import type { Profile, Workout, FoodLog, WeeklyCheckin, AIPlan } from '@/types/models'

export class AITrainerDB extends Dexie {
  profiles!: Table<Profile>
  workouts!: Table<Workout>
  foodLogs!: Table<FoodLog>
  checkins!: Table<WeeklyCheckin>
  aiPlans!: Table<AIPlan>

  constructor() {
    super('AITrainerDB')
    this.version(1).stores({
      profiles: 'id, createdAt',
      workouts: 'id, date, type, createdAt',
      foodLogs: 'id, date, createdAt',
      checkins: 'id, weekStart, createdAt',
      aiPlans: 'id, workoutId, createdAt'
    })
  }
}

export const db = new AITrainerDB()

// Helper functions for common operations
export const dbHelpers = {
  async getProfile(): Promise<Profile | undefined> {
    return await db.profiles.orderBy('createdAt').reverse().first()
  },

  async saveProfile(profile: Profile): Promise<void> {
    await db.profiles.put(profile)
  },

  async getWorkouts(limit?: number): Promise<Workout[]> {
    let query = db.workouts.orderBy('date').reverse()
    if (limit) {
      query = query.limit(limit)
    }
    return await query.toArray()
  },

  async getWorkoutsByDateRange(startDate: Date, endDate: Date): Promise<Workout[]> {
    return await db.workouts
      .where('date')
      .between(startDate, endDate)
      .toArray()
  },

  async getFoodLogsByDateRange(startDate: Date, endDate: Date): Promise<FoodLog[]> {
    return await db.foodLogs
      .where('date')
      .between(startDate, endDate)
      .toArray()
  },

  async getCheckinByWeek(weekStart: Date): Promise<WeeklyCheckin | undefined> {
    return await db.checkins
      .where('weekStart')
      .equals(weekStart)
      .first()
  },

  async getAIPlanByWorkout(workoutId: string): Promise<AIPlan | undefined> {
    return await db.aiPlans
      .where('workoutId')
      .equals(workoutId)
      .first()
  },

  async clearAllData(): Promise<void> {
    await db.transaction('rw', [db.profiles, db.workouts, db.foodLogs, db.checkins, db.aiPlans], async () => {
      await db.profiles.clear()
      await db.workouts.clear()
      await db.foodLogs.clear()
      await db.checkins.clear()
      await db.aiPlans.clear()
    })
  }
}
