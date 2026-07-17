import { db } from '@services/data'
import type { Workout } from '@/types/models'
import type { WorkoutRepository } from '@/domain/workout/WorkoutRepository'

export const dexieWorkoutRepository: WorkoutRepository = {
  async list(): Promise<Workout[]> {
    return db.workouts.orderBy('date').reverse().toArray()
  },

  async getById(id: string): Promise<Workout | undefined> {
    return db.workouts.get(id)
  },

  async add(workout: Workout): Promise<void> {
    await db.workouts.add(workout)
  },

  async put(workout: Workout): Promise<void> {
    await db.workouts.update(workout.id, workout)
  },

  async delete(id: string): Promise<void> {
    await db.workouts.delete(id)
  }
}
