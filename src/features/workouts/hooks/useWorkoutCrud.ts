import { useState } from 'react'
import { useWorkoutStore } from '@stores/workout.store'
import { toastSuccess, toastError } from '@lib/toast'
import { useTranslations } from '@stores/i18n.store'
import type { Workout } from '../../types/models'

export interface CreateWorkoutData {
  name: string
  description?: string
  date: string
  exercises: any[]
  rpe?: number
  notes?: string
}

export interface UpdateWorkoutData extends Partial<CreateWorkoutData> {
  id: string
}

export function useWorkoutCrud() {
  const t = useTranslations()
  const { createWorkout, updateWorkout, deleteWorkout, loadWorkouts } = useWorkoutStore()
  const [isLoading, setIsLoading] = useState(false)

  const create = async (data: CreateWorkoutData) => {
    setIsLoading(true)
    try {
      // Validation
      if (!data.name.trim()) {
        throw new Error(t.workoutForm?.nameRequired || 'Workout name is required')
      }
      if (!data.date) {
        throw new Error(t.workoutForm?.dateRequired || 'Workout date is required')
      }
      if (!data.exercises || data.exercises.length === 0) {
        throw new Error(t.workoutForm?.addAtLeastOneExercise || 'Please add at least one exercise')
      }

      // Prepare workout data
      const workoutData: Omit<Workout, 'id' | 'createdAt' | 'updatedAt'> = {
        name: data.name.trim(),
        description: data.description?.trim() || '',
        date: data.date,
        exercises: data.exercises,
        rpe: data.rpe || 0,
        notes: data.notes?.trim() || '',
        isPlan: false
      }

      const workoutId = await createWorkout(workoutData)
      toastSuccess(t.workoutForm?.saveSuccess || 'Workout saved successfully')
      
      return { success: true, workoutId }
    } catch (error) {
      const message = error instanceof Error ? error.message : (t.error || 'Failed to save workout')
      toastError(message)
      return { success: false, error: message }
    } finally {
      setIsLoading(false)
    }
  }

  const update = async (data: UpdateWorkoutData) => {
    setIsLoading(true)
    try {
      if (!data.id) {
        throw new Error('Workout ID is required')
      }

      const updateData: Partial<Workout> = {}
      if (data.name !== undefined) updateData.name = data.name.trim()
      if (data.description !== undefined) updateData.description = data.description.trim()
      if (data.date !== undefined) updateData.date = data.date
      if (data.exercises !== undefined) updateData.exercises = data.exercises
      if (data.rpe !== undefined) updateData.rpe = data.rpe
      if (data.notes !== undefined) updateData.notes = data.notes.trim()

      await updateWorkout(data.id, updateData)
      toastSuccess(t.workoutForm?.updateSuccess || 'Workout updated successfully')
      
      return { success: true }
    } catch (error) {
      const message = error instanceof Error ? error.message : (t.error || 'Failed to update workout')
      toastError(message)
      return { success: false, error: message }
    } finally {
      setIsLoading(false)
    }
  }

  const remove = async (workoutId: string) => {
    setIsLoading(true)
    try {
      if (!workoutId) {
        throw new Error('Workout ID is required')
      }

      await deleteWorkout(workoutId)
      toastSuccess(t.workoutForm?.deleteSuccess || 'Workout deleted successfully')
      
      return { success: true }
    } catch (error) {
      const message = error instanceof Error ? error.message : (t.error || 'Failed to delete workout')
      toastError(message)
      return { success: false, error: message }
    } finally {
      setIsLoading(false)
    }
  }

  const refresh = async () => {
    setIsLoading(true)
    try {
      await loadWorkouts()
      return { success: true }
    } catch (error) {
      const message = error instanceof Error ? error.message : (t.error || 'Failed to load workouts')
      toastError(message)
      return { success: false, error: message }
    } finally {
      setIsLoading(false)
    }
  }

  return {
    create,
    update,
    remove,
    refresh,
    isLoading
  }
}
