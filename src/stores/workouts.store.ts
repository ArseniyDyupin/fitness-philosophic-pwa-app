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
      const workoutDate = new Date(workout?.date)
      return workoutDate >= today && workoutDate < tomorrow
    })
  })

  const todayCalories = computed(() => {
    return todayWorkouts.value.reduce((total, workout) => {
      const workoutCalories = workout.exercises.reduce((exerciseTotal, exercise) => {
        return exerciseTotal + (exercise.kcalEstimated || 0)
      }, 0)
      return total + workoutCalories
    }, 0)
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

  async function addWorkout(workoutData: Omit<Workout, 'id' | 'createdAt' | 'updatedAt'>) {
    isLoading.value = true
    error.value = null
    try {
      // Calculate calories for each exercise
      const weight = profileStore.currentWeight
      const exercisesWithCalories = workoutData?.exercises.map(exercise => {
        const calorieCalculation = calculateWorkoutCalories(
          exercise.type,
          weight,
          exercise?.details?.durationMin || 0,
          {
            distance: exercise?.details?.distanceKm,
            reps: exercise?.details?.repsPerSet ? exercise?.details?.repsPerSet.reduce((a, b) => a + b, 0) : undefined,
            sets: exercise?.details?.sets
          }
        )
        
        return {
          ...exercise,
          kcalEstimated: calorieCalculation.calories
        }
              })
      // Create deep copy without reactivity for IndexedDB
      const exercisesForDB = exercisesWithCalories.map(exercise => ({
        type: exercise.type,
        details: {
          distanceKm: exercise.details.distanceKm,
          durationMin: exercise.details.durationMin,
          sets: exercise.details.sets,
          repsPerSet: exercise.details.repsPerSet ? [...exercise.details.repsPerSet] : undefined,
          seconds: exercise.details.seconds ? [...exercise.details.seconds] : undefined,
          notes: exercise.details.notes,
          customExercise: exercise.details.customExercise
        },
        kcalEstimated: exercise.kcalEstimated
      }))

      const newWorkout: Workout = {
        id: crypto.randomUUID(),
        date: workoutData.date,
        exercises: exercisesForDB,
        rpe: workoutData.rpe,
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

      // Recalculate calories if exercises changed
      let updatedExercises = existingWorkout.exercises
      if (updates.exercises) {
        const weight = profileStore.currentWeight
        updatedExercises = updates.exercises.map(exercise => {
          const calorieCalculation = calculateWorkoutCalories(
            exercise.type,
            weight,
            exercise.details.durationMin || 0,
            {
              distance: exercise.details.distanceKm,
              reps: exercise.details.repsPerSet ? exercise.details.repsPerSet.reduce((a, b) => a + b, 0) : undefined,
              sets: exercise.details.sets
            }
          )
          
          return {
            ...exercise,
            kcalEstimated: calorieCalculation.calories
          }
        })
      }

      // Create deep copy without reactivity for IndexedDB
      const exercisesForDB = updatedExercises.map(exercise => ({
        type: exercise.type,
        details: {
          distanceKm: exercise.details.distanceKm,
          durationMin: exercise.details.durationMin,
          sets: exercise.details.sets,
          repsPerSet: exercise.details.repsPerSet ? [...exercise.details.repsPerSet] : undefined,
          seconds: exercise.details.seconds ? [...exercise.details.seconds] : undefined,
          notes: exercise.details.notes,
          customExercise: exercise.details.customExercise
        },
        kcalEstimated: exercise.kcalEstimated
      }))

      const updatedWorkout: Workout = {
        ...existingWorkout,
        date: updates.date || existingWorkout.date,
        exercises: exercisesForDB,
        rpe: updates.rpe !== undefined ? updates.rpe : existingWorkout.rpe,
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
