import { create } from 'zustand'
import { db } from '../services/db'
import type { Workout } from '../types/models'

interface WorkoutState {
  workouts: Workout[]
  isLoading: boolean
  error: string | null
  
  // Actions
  loadWorkouts: () => Promise<void>
  addWorkout: (workout: Omit<Workout, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateWorkout: (id: string, workout: Partial<Workout>) => Promise<void>
  deleteWorkout: (id: string) => Promise<void>
  getWorkoutById: (id: string) => Workout | undefined
  getWorkoutsByDateRange: (startDate: string, endDate: string) => Workout[]
  clearWorkouts: () => void
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  workouts: [],
  isLoading: false,
  error: null,

  loadWorkouts: async () => {
    set({ isLoading: true, error: null })
    try {
      const workouts = await db.workouts.orderBy('date').reverse().toArray()
      set({ workouts })
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to load workouts' })
    } finally {
      set({ isLoading: false })
    }
  },

  addWorkout: async (workoutData) => {
    set({ isLoading: true, error: null })
    try {
      const newWorkout: Workout = {
        ...workoutData,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      await db.workouts.add(newWorkout)
      set(state => ({
        workouts: [newWorkout, ...state.workouts]
      }))
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to add workout' })
      throw err
    } finally {
      set({ isLoading: false })
    }
  },

  updateWorkout: async (id, workoutData) => {
    set({ isLoading: true, error: null })
    try {
      const updatedWorkout: Workout = {
        ...get().workouts.find(w => w.id === id)!,
        ...workoutData,
        updatedAt: new Date().toISOString()
      }
      
      await db.workouts.update(id, updatedWorkout)
      set(state => ({
        workouts: state.workouts.map(w => 
          w.id === id ? updatedWorkout : w
        )
      }))
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to update workout' })
      throw err
    } finally {
      set({ isLoading: false })
    }
  },

  deleteWorkout: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await db.workouts.delete(id)
      set(state => ({
        workouts: state.workouts.filter(w => w.id !== id)
      }))
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to delete workout' })
      throw err
    } finally {
      set({ isLoading: false })
    }
  },

  getWorkoutById: (id) => {
    return get().workouts.find(w => w.id === id)
  },

  getWorkoutsByDateRange: (startDate: string, endDate: string) => {
    return get().workouts.filter(w => 
      w.date >= startDate && w.date <= endDate
    )
  },

  clearWorkouts: () => {
    set({ workouts: [] })
  }
}))
