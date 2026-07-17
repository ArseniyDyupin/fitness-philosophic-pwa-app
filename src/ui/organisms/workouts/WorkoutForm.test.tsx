// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { Workout } from '@/types/models'

vi.mock('@stores/workout.store', () => ({ useWorkoutStore: vi.fn() }))
vi.mock('@stores/profile.store', () => ({ useProfileStore: vi.fn() }))
vi.mock('@stores/i18n.store', () => ({
  useTranslations: vi.fn(),
  useI18nStore: vi.fn()
}))
vi.mock('@stores/ai.store', () => ({ useAIStore: vi.fn() }))
vi.mock('@services/ai', () => ({
  aiService: { parseWorkoutText: vi.fn() },
  getBatchEstimates: vi.fn(),
  needsAIEstimation: vi.fn(() => true),
  createEstimateInput: vi.fn(() => ({ type: 'run' })),
  aiReviewService: { reviewWorkout: vi.fn() }
}))
vi.mock('@services/fitness', () => ({ calculateExerciseCalories: vi.fn(() => 0) }))
vi.mock('@lib/toast', () => ({ toastError: vi.fn() }))
vi.mock('@organisms/shared/ExerciseCard', () => ({
  default: () => <div>Exercise editor</div>
}))

import { useWorkoutStore } from '@stores/workout.store'
import { useProfileStore } from '@stores/profile.store'
import { useTranslations, useI18nStore } from '@stores/i18n.store'
import { useAIStore } from '@stores/ai.store'
import { getBatchEstimates } from '@services/ai'
import WorkoutForm from './WorkoutForm'

describe('WorkoutForm save', () => {
  const addWorkout = vi.fn()
  const updateWorkout = vi.fn()
  const onSuccess = vi.fn()
  const onClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useWorkoutStore).mockReturnValue({ addWorkout, updateWorkout } as never)
    vi.mocked(useProfileStore).mockReturnValue({
      profile: { weight: 80, age: 30, gender: 'male' }
    } as never)
    vi.mocked(useTranslations).mockReturnValue({
      addWorkout: 'Add Workout',
      add: 'Add',
      save: 'Save',
      saving: 'Saving...',
      cancel: 'Cancel',
      close: 'Close'
    } as never)
    vi.mocked(useI18nStore).mockReturnValue({ currentLanguage: 'en' } as never)
    vi.mocked(useAIStore).mockReturnValue({
      isConfigured: true,
      hasKey: () => false
    } as never)
  })

  it('creates one workout and updates that same record with AI estimates', async () => {
    const savedWorkout: Workout = {
      id: 'workout-1',
      date: '2026-07-17',
      exercises: [{ type: 'run', details: {} }],
      status: 'completed',
      createdAt: '2026-07-17T08:00:00.000Z',
      updatedAt: '2026-07-17T08:00:00.000Z'
    }
    addWorkout.mockResolvedValueOnce(savedWorkout)
    updateWorkout.mockResolvedValueOnce(undefined)
    vi.mocked(getBatchEstimates).mockResolvedValueOnce([{ kcal: 123 }] as never)

    render(
      <WorkoutForm
        isOpen
        onClose={onClose}
        onSuccess={onSuccess}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Add Exercise' }))
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith(savedWorkout.id))
    expect(addWorkout).toHaveBeenCalledTimes(1)
    expect(updateWorkout).toHaveBeenCalledWith(
      savedWorkout.id,
      expect.objectContaining({
        exercises: [expect.objectContaining({ kcalEstimated: 123 })]
      })
    )
  })
})
