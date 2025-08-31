import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import { db, dbHelpers } from '@/services/db'
import { calculateWorkoutCalories } from '@/services/kcal'
import { useProfileStore } from './profile.store'
import type { Workout, WorkoutType } from '@/types/models'

export const useWorkoutsStore = defineStore('workouts', () => {
  const workouts = ref<Workout[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  
  const profileStore = useProfileStore()

  // Computed properties
  const todayWorkouts = computed(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    return workouts.value.filter(workout => {
      const workoutDate = new Date(workout.date)
      return workoutDate >= today && workoutDate < tomorrow
    })
  })

  const todayCalories = computed(() => {
    return todayWorkouts.value.reduce((total, workout) => total + workout.calories, 0)
  })

  const recentWorkouts = computed(() => {
    return workouts.value.slice(0, 10) // Last 10 workouts
  })

  // Actions
  async function loadWorkouts() {
    isLoading.value = true
    error.value = null
    
    try {
      workouts.value = await dbHelpers.getWorkouts()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load workouts'
    } finally {
      isLoading.value = false
    }
  }

  async function addWorkout(workoutData: Omit<Workout, 'id' | 'calories' | 'createdAt' | 'updatedAt'>) {
    isLoading.value = true
    error.value = null
    
    try {
      // Calculate calories based on profile weight
      const weight = profileStore.currentWeight
      const calorieCalculation = calculateWorkoutCalories(
        workoutData.type,
        weight,
        workoutData.durationMin,
        {
          distance: workoutData.distance,
          reps: workoutData.reps,
          sets: workoutData.sets
        }
      )

      const newWorkout: Workout = {
        id: crypto.randomUUID(),
        ...workoutData,
        calories: calorieCalculation.calories,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      await db.workouts.add(newWorkout)
      workouts.value.unshift(newWorkout)
      
      return newWorkout
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to add workout'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function updateWorkout(id: string, updates: Partial<Workout>) {
    isLoading.value = true
    error.value = null
    
    try {
      const existingWorkout = workouts.value.find(w => w.id === id)
      if (!existingWorkout) {
        throw new Error('Workout not found')
      }

      // Recalculate calories if duration or type changed
      let calories = existingWorkout.calories
      if (updates.durationMin || updates.type) {
        const weight = profileStore.currentWeight
        const calorieCalculation = calculateWorkoutCalories(
          updates.type || existingWorkout.type,
          weight,
          updates.durationMin || existingWorkout.durationMin,
          {
            distance: updates.distance || existingWorkout.distance,
            reps: updates.reps || existingWorkout.reps,
            sets: updates.sets || existingWorkout.sets
          }
        )
        calories = calorieCalculation.calories
      }

      const updatedWorkout: Workout = {
        ...existingWorkout,
        ...updates,
        calories,
        updatedAt: new Date()
      }

      await db.workouts.put(updatedWorkout)
      const index = workouts.value.findIndex(w => w.id === id)
      if (index !== -1) {
        workouts.value[index] = updatedWorkout
      }
      
      return updatedWorkout
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update workout'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function deleteWorkout(id: string) {
    isLoading.value = true
    error.value = null
    
    try {
      await db.workouts.delete(id)
      workouts.value = workouts.value.filter(w => w.id !== id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete workout'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function getWorkoutById(id: string): Promise<Workout | undefined> {
    return await db.workouts.get(id)
  }

  async function getWorkoutsByDateRange(startDate: Date, endDate: Date): Promise<Workout[]> {
    return await dbHelpers.getWorkoutsByDateRange(startDate, endDate)
  }

  function clearError() {
    error.value = null
  }

  return {
    // State
    workouts: readonly(workouts),
    isLoading: readonly(isLoading),
    error: readonly(error),
    
    // Computed
    todayWorkouts,
    todayCalories,
    recentWorkouts,
    
    // Actions
    loadWorkouts,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    getWorkoutById,
    getWorkoutsByDateRange,
    clearError
  }
})
