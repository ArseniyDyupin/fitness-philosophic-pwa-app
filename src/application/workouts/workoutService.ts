import type { Workout } from '@/types/models'
import type { WorkoutRepository } from '@/domain/workout/WorkoutRepository'
import { toLocalDate } from '@/domain/date/localDate'
import { dexieWorkoutRepository } from '@/infrastructure/repositories/dexieWorkoutRepository'

export type NewWorkout = Omit<Workout, 'id' | 'createdAt' | 'updatedAt'>

export class WorkoutService {
  constructor(
    private readonly repository: WorkoutRepository,
    private readonly now: () => Date = () => new Date(),
    private readonly createId: () => string = () => crypto.randomUUID()
  ) {}

  list(): Promise<Workout[]> {
    return this.repository.list()
  }

  getById(id: string): Promise<Workout | undefined> {
    return this.repository.getById(id)
  }

  async create(data: NewWorkout): Promise<Workout> {
    const timestamp = this.now().toISOString()
    const workout: Workout = this.normalize({
      ...data,
      id: this.createId(),
      createdAt: timestamp,
      updatedAt: timestamp
    })

    await this.repository.add(workout)
    return workout
  }

  async update(id: string, updates: Partial<Workout>): Promise<Workout> {
    const current = await this.repository.getById(id)
    if (!current) {
      throw new Error('Workout not found')
    }

    const workout = this.normalize({
      ...current,
      ...updates,
      id: current.id,
      createdAt: current.createdAt,
      updatedAt: this.now().toISOString()
    })

    await this.repository.put(workout)
    return workout
  }

  delete(id: string): Promise<void> {
    return this.repository.delete(id)
  }

  private normalize(workout: Workout): Workout {
    const status = workout.status ?? (workout.isPlan ? 'planned' : 'completed')
    return {
      ...workout,
      date: toLocalDate(workout.date),
      status,
      isPlan: status === 'planned'
    }
  }
}

export const workoutService = new WorkoutService(dexieWorkoutRepository)
