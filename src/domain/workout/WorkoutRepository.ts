import type { Workout } from '@/types/models'

export interface WorkoutRepository {
  list(): Promise<Workout[]>
  getById(id: string): Promise<Workout | undefined>
  add(workout: Workout): Promise<void>
  put(workout: Workout): Promise<void>
  delete(id: string): Promise<void>
}
