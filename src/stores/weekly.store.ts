import { create } from 'zustand'
import { db } from '@services/db'
import type { WeeklyCheckin } from '@types/models'

interface WeeklyState {
  checkins: WeeklyCheckin[]
  isLoading: boolean
  error: string | null
  
  // Actions
  loadCheckins: () => Promise<void>
  addCheckin: (checkin: Omit<WeeklyCheckin, 'id' | 'createdAt'>) => Promise<void>
  updateCheckin: (id: string, checkin: Partial<WeeklyCheckin>) => Promise<void>
  deleteCheckin: (id: string) => Promise<void>
  getCheckinByWeek: (weekStart: Date) => WeeklyCheckin | undefined
  getCurrentWeekCheckin: () => WeeklyCheckin | undefined
  clearCheckins: () => void
}

export const useWeeklyStore = create<WeeklyState>((set, get) => ({
  checkins: [],
  isLoading: false,
  error: null,

  loadCheckins: async () => {
    set({ isLoading: true, error: null })
    try {
      const checkins = await db.checkins.orderBy('weekStart').reverse().toArray()
      set({ checkins })
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to load checkins' })
    } finally {
      set({ isLoading: false })
    }
  },

  addCheckin: async (checkinData) => {
    set({ isLoading: true, error: null })
    try {
      const newCheckin: WeeklyCheckin = {
        ...checkinData,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString()
      }
      
      await db.checkins.add(newCheckin)
      set(state => ({
        checkins: [newCheckin, ...state.checkins]
      }))
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to add checkin' })
      throw err
    } finally {
      set({ isLoading: false })
    }
  },

  updateCheckin: async (id, checkinData) => {
    set({ isLoading: true, error: null })
    try {
      const updatedCheckin: WeeklyCheckin = {
        ...get().checkins.find(c => c.id === id)!,
        ...checkinData
      }
      
      await db.checkins.update(id, updatedCheckin)
      set(state => ({
        checkins: state.checkins.map(c => 
          c.id === id ? updatedCheckin : c
        )
      }))
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to update checkin' })
      throw err
    } finally {
      set({ isLoading: false })
    }
  },

  deleteCheckin: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await db.checkins.delete(id)
      set(state => ({
        checkins: state.checkins.filter(c => c.id !== id)
      }))
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to delete checkin' })
      throw err
    } finally {
      set({ isLoading: false })
    }
  },

  getCheckinByWeek: (weekStart) => {
    return get().checkins.find(c => 
      new Date(c.weekStart).getTime() === weekStart.getTime()
    )
  },

  getCurrentWeekCheckin: () => {
    const now = new Date()
    const currentWeekStart = getWeekStart(now)
    return get().checkins.find(c => 
      new Date(c.weekStart).getTime() === currentWeekStart.getTime()
    )
  },

  clearCheckins: () => {
    set({ checkins: [] })
  }
}))

// Helper function to get the start of a week (Monday)
function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}
