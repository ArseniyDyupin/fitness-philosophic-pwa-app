import { db } from '../data/db'
import { startOfWeek, endOfWeek, subWeeks, format } from 'date-fns'
import type { MetricDef, MetricEntry, PhotoAsset, BodyMetricsSettings } from '@/types/body-metrics'

export const metricsService = {
  // Metric Definitions
  async getActiveDefs(): Promise<MetricDef[]> {
    try {
      // Check if database is open and table exists
      if (!db.isOpen()) {
        await db.open()
      }
      
      const tableExists = db.tables.some(table => table.name === 'metric_defs')
      if (!tableExists) {
        console.log('metric_defs table does not exist')
        return []
      }
      
      return await db.metric_defs.where('isActive').equals(1).toArray()
    } catch (error) {
      console.error('Error getting active metric definitions:', error)
      return []
    }
  },

  async getAllDefs(): Promise<MetricDef[]> {
    return await db.metric_defs.orderBy('createdAt').toArray()
  },

  async getDefById(id: string): Promise<MetricDef | undefined> {
    return await db.metric_defs.get(id)
  },

  async saveDef(metricDef: MetricDef): Promise<void> {
    await db.metric_defs.put(metricDef)
  },

  async deleteDef(id: string): Promise<void> {
    // Delete associated entries first
    await db.metric_entries.where('defId').equals(id).delete()
    await db.metric_defs.delete(id)
  },

  // Metric Entries
  async saveEntries(entries: MetricEntry[]): Promise<void> {
    await db.metric_entries.bulkPut(entries)
  },

  async getEntriesByDef(defId: string, startDate?: string, endDate?: string): Promise<MetricEntry[]> {
    let query = db.metric_entries.where('defId').equals(defId)
    
    if (startDate && endDate) {
      query = query.and(entry => entry.date >= startDate && entry.date <= endDate)
    }
    
    return await query.sortBy('date')
  },

  async getEntriesByRange(startDate: string, endDate: string): Promise<MetricEntry[]> {
    return await db.metric_entries
      .where('date')
      .between(startDate, endDate)
      .sortBy('date')
  },

  async getLatestByDef(defId: string): Promise<MetricEntry | undefined> {
    try {
      // Check if database is open and table exists
      if (!db.isOpen()) {
        await db.open()
      }
      
      const tableExists = db.tables.some(table => table.name === 'metric_entries')
      if (!tableExists) {
        console.log('metric_entries table does not exist')
        return undefined
      }
      
      const entries = await db.metric_entries
        .where('defId')
        .equals(defId)
        .sortBy('date')
      return entries[entries.length - 1]
    } catch (error) {
      console.error(`Error getting latest entry for metric ${defId}:`, error)
      return undefined
    }
  },

  async getLatestValues(): Promise<Record<string, number>> {
    try {
      const activeDefs = await this.getActiveDefs()
      const latestValues: Record<string, number> = {}
      
      for (const def of activeDefs) {
        try {
          const latest = await this.getLatestByDef(def.id)
          if (latest) {
            latestValues[def.key] = latest.value
          }
        } catch (error) {
          console.warn(`Failed to get latest value for metric ${def.key}:`, error)
        }
      }
      
      return latestValues
    } catch (error) {
      console.error('Error getting latest values:', error)
      return {}
    }
  },

  // Photo Assets
  async savePhotos(photos: PhotoAsset[]): Promise<void> {
    await db.photo_assets.bulkPut(photos)
  },

  async getPhotosByDate(date: string): Promise<PhotoAsset[]> {
    return await db.photo_assets.where('date').equals(date).toArray()
  },

  async deletePhoto(id: string): Promise<void> {
    await db.photo_assets.delete(id)
  },

  // Week utilities
  getWeekStart(date: Date = new Date(), weekStartsOn: 0 | 1 = 1): Date {
    return startOfWeek(date, { weekStartsOn })
  },

  getWeekEnd(date: Date = new Date(), weekStartsOn: 0 | 1 = 1): Date {
    return endOfWeek(date, { weekStartsOn })
  },

  isEndOfWeek(date: Date = new Date(), weekStartsOn: 0 | 1 = 1): boolean {
    const weekEnd = this.getWeekEnd(date, weekStartsOn)
    return format(date, 'yyyy-MM-dd') === format(weekEnd, 'yyyy-MM-dd')
  },

  async isWeekFilled(weekStart: Date, weekStartsOn: 0 | 1 = 1): Promise<boolean> {
    const weekEnd = this.getWeekEnd(weekStart, weekStartsOn)
    const startDate = format(weekStart, 'yyyy-MM-dd')
    const endDate = format(weekEnd, 'yyyy-MM-dd')
    
    const entries = await this.getEntriesByRange(startDate, endDate)
    const activeDefs = await this.getActiveDefs()
    const requiredDefs = activeDefs.filter(def => def.isRequired)
    
    // Check if all required metrics have entries for this week
    for (const def of requiredDefs) {
      const hasEntry = entries.some(entry => entry.defId === def.id)
      if (!hasEntry) {
        return false
      }
    }
    
    return requiredDefs.length > 0
  },

  // Trends and analysis
  async getTrends(defId: string, weeks: number = 8): Promise<Array<{ date: string; value: number }>> {
    const endDate = new Date()
    const startDate = subWeeks(endDate, weeks)
    
    const entries = await this.getEntriesByDef(
      defId,
      format(startDate, 'yyyy-MM-dd'),
      format(endDate, 'yyyy-MM-dd')
    )
    
    return entries.map(entry => ({
      date: entry.date,
      value: entry.value
    }))
  },

  async getDelta(defId: string, days: number = 30): Promise<number | null> {
    const endDate = new Date()
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000)
    
    const entries = await this.getEntriesByDef(
      defId,
      format(startDate, 'yyyy-MM-dd'),
      format(endDate, 'yyyy-MM-dd')
    )
    
    if (entries.length < 2) return null
    
    const sorted = entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    const first = sorted[0]
    const last = sorted[sorted.length - 1]
    
    return last.value - first.value
  },

  // Settings
  async getSettings(): Promise<BodyMetricsSettings> {
    // For now, return default settings
    // In the future, this could be stored in profile or separate settings table
    return {
      allowPhotoAnalysis: false,
      collectionFrequency: 'weekly',
      weekStartsOn: 1,
      reminderEnabled: true
    }
  },

  async updateSettings(settings: Partial<BodyMetricsSettings>): Promise<void> {
    // For now, this is a placeholder
    // In the future, this could update profile or separate settings table
    console.log('Updating metrics settings:', settings)
  },

  // Validation
  validateEntry(def: MetricDef, value: number): { valid: boolean; error?: string } {
    if (def.min !== undefined && value < def.min) {
      return { valid: false, error: `Value must be at least ${def.min}` }
    }
    
    if (def.max !== undefined && value > def.max) {
      return { valid: false, error: `Value must be at most ${def.max}` }
    }
    
    return { valid: true }
  },

  // Photo compression utility
  compressPhoto(file: File, maxWidth: number = 1280, quality: number = 0.7): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        
        canvas.width = width
        canvas.height = height
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height)
        const dataUrl = canvas.toDataURL('image/jpeg', quality)
        resolve(dataUrl)
      }
      
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = URL.createObjectURL(file)
    })
  }
}
