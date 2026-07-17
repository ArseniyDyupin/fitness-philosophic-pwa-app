import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Workout } from '@/types/models'

vi.mock('@services/data', () => ({
  db: {
    workouts: {
      add: vi.fn(async () => undefined),
      update: vi.fn(async () => 1),
      delete: vi.fn(async () => undefined),
      get: vi.fn(async () => undefined),
      orderBy: vi.fn(() => ({
        reverse: () => ({
          toArray: async () => []
        })
      }))
    }
  }
}))

vi.mock('@services/fitness', () => ({
  getWorkoutTotalCalories: vi.fn((_workout: Workout, weight: number) => weight),
  getWorkoutTotalDuration: vi.fn(() => 20)
}))

import { db } from '@services/data'
import { useWorkoutStore } from './workout.store'

function createWorkout(overrides: Partial<Workout> = {}): Workout {
  return {
    id: 'workout-1',
    date: '2026-07-17',
    exercises: [{ type: 'run', details: { durationMin: 20 } }],
    status: 'completed',
    createdAt: '2026-07-17T08:00:00.000Z',
    updatedAt: '2026-07-17T08:00:00.000Z',
    ...overrides
  }
}

describe('workout store persistence', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useWorkoutStore.setState({ workouts: [], isLoading: false, error: null })
  })

  it('loads a cold workout by id and mirrors it in memory', async () => {
    const workout = createWorkout()
    vi.mocked(db.workouts.get).mockResolvedValueOnce(workout)

    await expect(useWorkoutStore.getState().getWorkoutByIdAsync(workout.id)).resolves.toEqual(workout)
    expect(useWorkoutStore.getState().getWorkoutById(workout.id)).toEqual(workout)
  })

  it('updates a cold workout while preserving its stable identity', async () => {
    const workout = createWorkout()
    vi.mocked(db.workouts.get).mockResolvedValueOnce(workout)

    await useWorkoutStore.getState().updateWorkout(workout.id, { rpe: 7 })

    expect(db.workouts.update).toHaveBeenCalledWith(
      workout.id,
      expect.objectContaining({ id: workout.id, createdAt: workout.createdAt, rpe: 7 })
    )
    expect(useWorkoutStore.getState().getWorkoutById(workout.id)?.rpe).toBe(7)
  })

  it('uses the provided profile weight for daily calories', () => {
    useWorkoutStore.setState({ workouts: [createWorkout()] })

    expect(useWorkoutStore.getState().getDayStats('2026-07-17', 84).calories).toBe(84)
  })
})
