import { create } from 'zustand'
import { db } from '@services/data'
import { startOfWeek, endOfWeek, isWithinInterval } from 'date-fns'
import { getWorkoutTotalDuration, getWorkoutTotalCalories } from '@services/fitness'
import type { Workout } from '@/types/models'

interface WorkoutState {
  workouts: Workout[]
  isLoading: boolean
  error: string | null
  
  // Actions
  loadWorkouts: () => Promise<void>
  addWorkout: (workout: Omit<Workout, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Workout>
  createWorkout: (workout: Omit<Workout, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Workout>
  updateWorkout: (id: string, workout: Partial<Workout>) => Promise<void>
  deleteWorkout: (id: string) => Promise<void>
  getWorkoutById: (id: string) => Workout | undefined
  getWorkoutsByDateRange: (startDate: string, endDate: string) => Workout[]
  getWorkoutsByWeek: (weekStart: Date) => Workout[]
  getSortedByDate: () => Workout[]
  getPrevNext: (id: string) => { prev?: Workout; next?: Workout }
  getWorkoutsByDate: (dateISO: string) => Workout[]
  getLastN: (n: number) => Workout[]
  getDayStats: (dateISO: string) => { calories: number; minutes: number; exercises: number; rpeAvg?: number }
  getWeekStats: (weekStartISO: string, userWeight?: number) => { calories: number; minutes: number; exercises: number; rpeAvg?: number; workouts: number; goalPerWeek?: number }
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
      
      return newWorkout
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to add workout' })
      throw err
    } finally {
      set({ isLoading: false })
    }
  },

  createWorkout: async (workoutData) => {
    return get().addWorkout(workoutData)
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

  getWorkoutsByWeek: (weekStart: Date) => {
    const weekStartDate = startOfWeek(weekStart, { weekStartsOn: 1 })
    const weekEndDate = endOfWeek(weekStart, { weekStartsOn: 1 })
    
    return get().workouts.filter(workout => {
      const workoutDate = new Date(workout.date)
      return isWithinInterval(workoutDate, {
        start: weekStartDate,
        end: weekEndDate
      })
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  },

  getSortedByDate: () => {
    return [...get().workouts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  },

  getPrevNext: (id: string) => {
    const sortedWorkouts = get().getSortedByDate()
    const currentIndex = sortedWorkouts.findIndex(w => w.id === id)
    
    if (currentIndex === -1) {
      return { prev: undefined, next: undefined }
    }
    
    return {
      prev: currentIndex < sortedWorkouts.length - 1 ? sortedWorkouts[currentIndex + 1] : undefined,
      next: currentIndex > 0 ? sortedWorkouts[currentIndex - 1] : undefined
    }
  },

  getWorkoutsByDate: (dateISO: string) => {
    const { workouts } = get()
    return workouts.filter(workout => workout.date.split('T')[0] === dateISO)
  },

  getLastN: (n: number) => {
    const { workouts } = get()
    return workouts.slice(0, n)
  },

  getDayStats: (dateISO: string) => {
    const { workouts } = get()
    const dayWorkouts = workouts.filter(workout => 
      workout.date.split('T')[0] === dateISO &&
      workout.status === 'completed'
    )
    
    let calories = 0
    let minutes = 0
    let exercises = 0
    let totalRPE = 0
    let rpeCount = 0

    dayWorkouts.forEach(workout => {
      if (workout.exercises) {
        calories += getWorkoutTotalCalories(workout, 70)
        minutes += getWorkoutTotalDuration(workout)
        exercises += workout.exercises.length
      }
      if (workout.rpe && workout.rpe > 0) {
        totalRPE += workout.rpe
        rpeCount += 1
      }
    })

    return {
      calories,
      minutes,
      exercises,
      rpeAvg: rpeCount > 0 ? totalRPE / rpeCount : undefined,
      workoutCount: dayWorkouts.length
    }
  },

  getWeekStats: (weekStartISO: string, userWeight?: number) => {
    const { workouts } = get()
    const weekStart = new Date(weekStartISO)
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
    
    // Filter only completed workouts (not AI plans) for the week
    const weekWorkouts = workouts.filter(workout => {
      const workoutDate = new Date(workout.date)
      return isWithinInterval(workoutDate, { start: weekStart, end: weekEnd }) &&
             workout.status === 'completed'
    })
    
    let calories = 0
    let minutes = 0
    let exercises = 0
    let totalRPE = 0
    let rpeCount = 0

    weekWorkouts.forEach(workout => {
      if (workout.exercises && workout.exercises.length > 0) {
        // Calculate calories using the proper function
        if (userWeight) {
          calories += getWorkoutTotalCalories(workout, userWeight)
        }
        
        // Calculate duration using unified function
        minutes += getWorkoutTotalDuration(workout)
        
        // Count exercises
        exercises += workout.exercises.length
      }
      
      if (workout.rpe && workout.rpe > 0) {
        totalRPE += workout.rpe
        rpeCount += 1
      }
    })

    return {
      calories,
      minutes,
      exercises,
      rpeAvg: rpeCount > 0 ? totalRPE / rpeCount : undefined,
      workouts: weekWorkouts.length,
      goalPerWeek: 3 // Default goal, will be overridden by profile.frequency in component
    }
  },

  clearWorkouts: () => {
    set({ workouts: [] })
  }
}))
