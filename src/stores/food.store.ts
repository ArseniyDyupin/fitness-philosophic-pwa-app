import { create } from 'zustand'
import { db } from '../services/db'
import type { FoodLog } from '../types/models'

interface FoodState {
  foodLogs: FoodLog[]
  isLoading: boolean
  error: string | null
  
  // Actions
  loadFoodLogs: () => Promise<void>
  addFoodLog: (foodLog: Omit<FoodLog, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateFoodLog: (id: string, foodLog: Partial<FoodLog>) => Promise<void>
  deleteFoodLog: (id: string) => Promise<void>
  getFoodLogsByDateRange: (startDate: string, endDate: string) => FoodLog[]
  getDailyCalories: (date: string) => number
  getDailyMacros: (date: string) => { protein: number; carbs: number; fat: number }
  clearFoodLogs: () => void
}

export const useFoodStore = create<FoodState>((set, get) => ({
  foodLogs: [],
  isLoading: false,
  error: null,

  loadFoodLogs: async () => {
    set({ isLoading: true, error: null })
    try {
      const foodLogs = await db.food.orderBy('date').reverse().toArray()
      set({ foodLogs })
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to load food logs' })
    } finally {
      set({ isLoading: false })
    }
  },

  addFoodLog: async (foodLogData) => {
    set({ isLoading: true, error: null })
    try {
      const newFoodLog: FoodLog = {
        ...foodLogData,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      await db.food.add(newFoodLog)
      set(state => ({
        foodLogs: [newFoodLog, ...state.foodLogs]
      }))
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to add food log' })
      throw err
    } finally {
      set({ isLoading: false })
    }
  },

  updateFoodLog: async (id, foodLogData) => {
    set({ isLoading: true, error: null })
    try {
      const updatedFoodLog: FoodLog = {
        ...get().foodLogs.find(f => f.id === id)!,
        ...foodLogData,
        updatedAt: new Date().toISOString()
      }
      
      await db.food.update(id, updatedFoodLog)
      set(state => ({
        foodLogs: state.foodLogs.map(f => 
          f.id === id ? updatedFoodLog : f
        )
      }))
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to update food log' })
      throw err
    } finally {
      set({ isLoading: false })
    }
  },

  deleteFoodLog: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await db.food.delete(id)
      set(state => ({
        foodLogs: state.foodLogs.filter(f => f.id !== id)
      }))
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to delete food log' })
      throw err
    } finally {
      set({ isLoading: false })
    }
  },

  getFoodLogsByDateRange: (startDate: string, endDate: string) => {
    return get().foodLogs.filter(f => 
      f.date >= startDate && f.date <= endDate
    )
  },

  getDailyCalories: (date: string) => {
    const dayStart = new Date(date)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(date)
    dayEnd.setHours(23, 59, 59, 999)
    
    return get().foodLogs
      .filter(f => f.date >= dayStart.toISOString() && f.date <= dayEnd.toISOString())
      .reduce((total, log) => total + log.calories, 0)
  },

  getDailyMacros: (date: string) => {
    const dayStart = new Date(date)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(date)
    dayEnd.setHours(23, 59, 59, 999)
    
    const dailyLogs = get().foodLogs.filter(f => 
      f.date >= dayStart.toISOString() && f.date <= dayEnd.toISOString()
    )
    
    return dailyLogs.reduce((macros, log) => ({
      protein: macros.protein + (log.protein || 0),
      carbs: macros.carbs + (log.carbs || 0),
      fat: macros.fat + (log.fat || 0)
    }), { protein: 0, carbs: 0, fat: 0 })
  },

  clearFoodLogs: () => {
    set({ foodLogs: [] })
  }
}))
