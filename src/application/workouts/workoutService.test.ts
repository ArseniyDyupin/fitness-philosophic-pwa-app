import { describe, expect, it, vi } from 'vitest'
import type { Workout } from '@/types/models'
import type { WorkoutRepository } from '@/domain/workout/WorkoutRepository'
import { WorkoutService } from './workoutService'

function createRepository(initial: Workout[] = []): WorkoutRepository {
  const records = new Map(initial.map(workout => [workout.id, workout]))
  return {
    list: vi.fn(async () => [...records.values()]),
    getById: vi.fn(async id => records.get(id)),
    add: vi.fn(async workout => { records.set(workout.id, workout) }),
    put: vi.fn(async workout => { records.set(workout.id, workout) }),
    delete: vi.fn(async id => { records.delete(id) })
  }
}

describe('WorkoutService', () => {
  it('creates a completed workout with a local date and stable timestamps', async () => {
    const repository = createRepository()
    const service = new WorkoutService(
      repository,
      () => new Date('2026-07-17T12:00:00.000Z'),
      () => 'workout-1'
    )

    const workout = await service.create({
      date: '2026-07-17T23:30:00.000Z',
      exercises: []
    })

    expect(workout).toMatchObject({
      id: 'workout-1',
      date: '2026-07-17',
      status: 'completed',
      isPlan: false,
      createdAt: '2026-07-17T12:00:00.000Z',
      updatedAt: '2026-07-17T12:00:00.000Z'
    })
    expect(repository.add).toHaveBeenCalledOnce()
  })

  it('preserves identity and createdAt while updating a cold record', async () => {
    const current: Workout = {
      id: 'workout-1',
      date: '2026-07-16',
      exercises: [],
      status: 'planned',
      isPlan: true,
      createdAt: '2026-07-15T10:00:00.000Z',
      updatedAt: '2026-07-15T10:00:00.000Z'
    }
    const repository = createRepository([current])
    const service = new WorkoutService(repository, () => new Date('2026-07-17T12:00:00.000Z'))

    const workout = await service.update('workout-1', {
      id: 'attempted-overwrite',
      createdAt: 'attempted-overwrite',
      status: 'completed'
    })

    expect(workout).toMatchObject({
      id: 'workout-1',
      createdAt: current.createdAt,
      updatedAt: '2026-07-17T12:00:00.000Z',
      status: 'completed',
      isPlan: false
    })
    expect(repository.put).toHaveBeenCalledWith(workout)
  })
})
