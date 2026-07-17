import { create } from 'zustand'
import { startOfWeek, endOfWeek, isWithinInterval } from 'date-fns'
import { getWorkoutTotalDuration, getWorkoutTotalCalories } from '@services/fitness'
import type { Workout } from '@/types/models'
import { localDateToDate, toLocalDate } from '@/domain/date/localDate'
import { workoutService } from '@/application/workouts/workoutService'

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
  getWorkoutByIdAsync: (id: string) => Promise<Workout | undefined>
  getWorkoutsByDateRange: (startDate: string, endDate: string) => Workout[]
  getWorkoutsByWeek: (weekStart: Date) => Workout[]
  getSortedByDate: () => Workout[]
  getPrevNext: (id: string) => { prev?: Workout; next?: Workout }
  getWorkoutsByDate: (dateISO: string) => Workout[]
  getLastN: (n: number) => Workout[]
  getDayStats: (dateISO: string, userWeight?: number) => { calories: number; minutes: number; exercises: number; rpeAvg?: number }
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
      const workouts = await workoutService.list()
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
      const newWorkout = await workoutService.create(workoutData)
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
      const updatedWorkout = await workoutService.update(id, workoutData)
      set(state => ({
        workouts: state.workouts.some(workout => workout.id === id)
          ? state.workouts.map(workout => workout.id === id ? updatedWorkout : workout)
          : [updatedWorkout, ...state.workouts]
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
      await workoutService.delete(id)
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

  getWorkoutByIdAsync: async (id) => {
    const cachedWorkout = get().workouts.find(workout => workout.id === id)
    if (cachedWorkout) {
      return cachedWorkout
    }

    const workout = await workoutService.getById(id)
    if (workout) {
      set(state => ({
        workouts: state.workouts.some(item => item.id === workout.id)
          ? state.workouts.map(item => item.id === workout.id ? workout : item)
          : [workout, ...state.workouts]
      }))
    }
    return workout
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
      const workoutDate = localDateToDate(toLocalDate(workout.date))
      return isWithinInterval(workoutDate, {
        start: weekStartDate,
        end: weekEndDate
      })
    }).sort((a, b) => toLocalDate(b.date).localeCompare(toLocalDate(a.date)))
  },

  getSortedByDate: () => {
    return [...get().workouts].sort((a, b) =>
      toLocalDate(b.date).localeCompare(toLocalDate(a.date))
    )
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
    const localDate = toLocalDate(dateISO)
    return workouts.filter(workout => toLocalDate(workout.date) === localDate)
  },

  getLastN: (n: number) => {
    const { workouts } = get()
    return workouts.slice(0, n)
  },

  getDayStats: (dateISO: string, userWeight = 70) => {
    const { workouts } = get()
    const localDate = toLocalDate(dateISO)
    const dayWorkouts = workouts.filter(workout => 
      toLocalDate(workout.date) === localDate &&
      workout.status === 'completed'
    )
    
    let calories = 0
    let minutes = 0
    let exercises = 0
    let totalRPE = 0
    let rpeCount = 0

    dayWorkouts.forEach(workout => {
      if (workout.exercises) {
        calories += getWorkoutTotalCalories(workout, userWeight)
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
    const weekStart = localDateToDate(toLocalDate(weekStartISO))
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
    
    // Filter only completed workouts (not AI plans) for the week
    const weekWorkouts = workouts.filter(workout => {
      const workoutDate = localDateToDate(toLocalDate(workout.date))
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
