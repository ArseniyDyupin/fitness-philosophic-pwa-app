import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import { db, dbHelpers } from '@/services/db'
import { calculateDailyCalorieBalance } from '@/services/kcal'
import type { FoodLog } from '@/types/models'

export const useFoodStore = defineStore('food', () => {
  const foodLogs = ref<FoodLog[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed properties
  const todayFoodLogs = computed(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    return foodLogs.value.filter(log => {
      const logDate = new Date(log.date)
      return logDate >= today && logDate < tomorrow
    })
  })

  const todayCalories = computed(() => {
    return todayFoodLogs.value.reduce((total, log) => total + log.calories, 0)
  })

  const todayProtein = computed(() => {
    return todayFoodLogs.value.reduce((total, log) => total + (log.protein || 0), 0)
  })

  const todayCarbs = computed(() => {
    return todayFoodLogs.value.reduce((total, log) => total + (log.carbs || 0), 0)
  })

  const todayFat = computed(() => {
    return todayFoodLogs.value.reduce((total, log) => total + (log.fat || 0), 0)
  })

  const groupedByDate = computed(() => {
    const groups: Record<string, FoodLog[]> = {}
    
    foodLogs.value.forEach(log => {
      const dateKey = new Date(log.date).toISOString().split('T')[0]
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(log)
    })
    
    return Object.entries(groups)
      .map(([date, logs]) => ({
        date: new Date(date),
        logs,
        totalCalories: logs.reduce((sum, log) => sum + log.calories, 0),
        totalProtein: logs.reduce((sum, log) => sum + (log.protein || 0), 0),
        totalCarbs: logs.reduce((sum, log) => sum + (log.carbs || 0), 0),
        totalFat: logs.reduce((sum, log) => sum + (log.fat || 0), 0)
      }))
      .sort((a, b) => b.date.getTime() - a.date.getTime())
  })

  // Actions
  async function loadFoodLogs() {
    isLoading.value = true
    error.value = null
    
    try {
      foodLogs.value = await db.foodLogs.orderBy('date').reverse().toArray()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load food logs'
    } finally {
      isLoading.value = false
    }
  }

  async function addFoodLog(foodData: Omit<FoodLog, 'id' | 'createdAt' | 'updatedAt'>) {
    isLoading.value = true
    error.value = null
    
    try {
      const newFoodLog: FoodLog = {
        id: crypto.randomUUID(),
        ...foodData,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      await db.foodLogs.add(newFoodLog)
      foodLogs.value.unshift(newFoodLog)
      
      return newFoodLog
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to add food log'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function updateFoodLog(id: string, updates: Partial<FoodLog>) {
    isLoading.value = true
    error.value = null
    
    try {
      const existingLog = foodLogs.value.find(log => log.id === id)
      if (!existingLog) {
        throw new Error('Food log not found')
      }

      const updatedLog: FoodLog = {
        ...existingLog,
        ...updates,
        updatedAt: new Date()
      }

      await db.foodLogs.put(updatedLog)
      const index = foodLogs.value.findIndex(log => log.id === id)
      if (index !== -1) {
        foodLogs.value[index] = updatedLog
      }
      
      return updatedLog
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update food log'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function deleteFoodLog(id: string) {
    isLoading.value = true
    error.value = null
    
    try {
      await db.foodLogs.delete(id)
      foodLogs.value = foodLogs.value.filter(log => log.id !== id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete food log'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function getFoodLogsByDateRange(startDate: Date, endDate: Date): Promise<FoodLog[]> {
    return await dbHelpers.getFoodLogsByDateRange(startDate, endDate)
  }

  function calculateDailyBalance(workoutCalories: number): number {
    return calculateDailyCalorieBalance(todayCalories.value, workoutCalories)
  }

  function clearError() {
    error.value = null
  }

  return {
    // State
    foodLogs: readonly(foodLogs),
    isLoading: readonly(isLoading),
    error: readonly(error),
    
    // Computed
    todayFoodLogs,
    todayCalories,
    todayProtein,
    todayCarbs,
    todayFat,
    groupedByDate,
    
    // Actions
    loadFoodLogs,
    addFoodLog,
    updateFoodLog,
    deleteFoodLog,
    getFoodLogsByDateRange,
    calculateDailyBalance,
    clearError
  }
})
