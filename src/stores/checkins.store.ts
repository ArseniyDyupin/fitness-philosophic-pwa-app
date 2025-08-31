import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import { db, dbHelpers } from '@/services/db'
import type { WeeklyCheckin } from '@/types/models'

export const useCheckinsStore = defineStore('checkins', () => {
  const checkins = ref<WeeklyCheckin[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed properties
  const currentWeekCheckin = computed(() => {
    const now = new Date()
    const weekStart = getWeekStart(now)
    return checkins.value.find(checkin => {
      const checkinWeekStart = new Date(checkin.weekStart)
      return checkinWeekStart.getTime() === weekStart.getTime()
    })
  })

  const sortedCheckins = computed(() => {
    return [...checkins.value].sort((a, b) => 
      new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime()
    )
  })

  const weightTrend = computed(() => {
    const recentCheckins = sortedCheckins.value.slice(0, 4) // Last 4 weeks
    if (recentCheckins.length < 2) return 'stable'
    
    const weights = recentCheckins.map(c => c.weight)
    const firstWeight = weights[weights.length - 1]
    const lastWeight = weights[0]
    const difference = lastWeight - firstWeight
    
    if (difference > 1) return 'increasing'
    if (difference < -1) return 'decreasing'
    return 'stable'
  })

  // Helper functions
  function getWeekStart(date: Date): Date {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
    return new Date(d.setDate(diff))
  }

  // Actions
  async function loadCheckins() {
    isLoading.value = true
    error.value = null
    
    try {
      checkins.value = await db.checkins.orderBy('weekStart').reverse().toArray()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load checkins'
    } finally {
      isLoading.value = false
    }
  }

  async function addCheckin(checkinData: Omit<WeeklyCheckin, 'id' | 'createdAt' | 'updatedAt'>) {
    isLoading.value = true
    error.value = null
    
    try {
      const newCheckin: WeeklyCheckin = {
        id: crypto.randomUUID(),
        ...checkinData,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      await db.checkins.add(newCheckin)
      checkins.value.unshift(newCheckin)
      
      return newCheckin
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to add checkin'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function updateCheckin(id: string, updates: Partial<WeeklyCheckin>) {
    isLoading.value = true
    error.value = null
    
    try {
      const existingCheckin = checkins.value.find(checkin => checkin.id === id)
      if (!existingCheckin) {
        throw new Error('Checkin not found')
      }

      const updatedCheckin: WeeklyCheckin = {
        ...existingCheckin,
        ...updates,
        updatedAt: new Date()
      }

      await db.checkins.put(updatedCheckin)
      const index = checkins.value.findIndex(checkin => checkin.id === id)
      if (index !== -1) {
        checkins.value[index] = updatedCheckin
      }
      
      return updatedCheckin
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update checkin'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function deleteCheckin(id: string) {
    isLoading.value = true
    error.value = null
    
    try {
      await db.checkins.delete(id)
      checkins.value = checkins.value.filter(checkin => checkin.id !== id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete checkin'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function getCheckinByWeek(weekStart: Date): Promise<WeeklyCheckin | undefined> {
    return await dbHelpers.getCheckinByWeek(weekStart)
  }

  function getCurrentWeekStart(): Date {
    return getWeekStart(new Date())
  }

  function clearError() {
    error.value = null
  }

  return {
    // State
    checkins: readonly(checkins),
    isLoading: readonly(isLoading),
    error: readonly(error),
    
    // Computed
    currentWeekCheckin,
    sortedCheckins,
    weightTrend,
    
    // Actions
    loadCheckins,
    addCheckin,
    updateCheckin,
    deleteCheckin,
    getCheckinByWeek,
    getCurrentWeekStart,
    clearError
  }
})
