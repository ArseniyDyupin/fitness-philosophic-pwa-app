import { db, dbHelpers } from './db'
import type { ExportData } from '@/types/models'

const SCHEMA_VERSION = 1

export class ExportService {
  async exportData(): Promise<ExportData> {
    const profile = await dbHelpers.getProfile()
    const workouts = await db.workouts.toArray()
    const foodLogs = await db.foodLogs.toArray()
    const checkins = await db.checkins.toArray()
    const aiPlans = await db.aiPlans.toArray()

    if (!profile) {
      throw new Error('No profile found. Please complete onboarding first.')
    }

    const exportData: ExportData = {
      schemaVersion: SCHEMA_VERSION,
      profile,
      workouts,
      foodLogs,
      checkins,
      aiPlans,
      exportedAt: new Date()
    }

    return exportData
  }

  async importData(data: ExportData): Promise<void> {
    // Validate schema version
    if (data.schemaVersion !== SCHEMA_VERSION) {
      throw new Error(`Unsupported schema version: ${data.schemaVersion}. Expected: ${SCHEMA_VERSION}`)
    }

    // Validate required fields
    if (!data.profile || !data.workouts || !data.foodLogs || !data.checkins || !data.aiPlans) {
      throw new Error('Invalid export data: missing required fields')
    }

    // Clear existing data
    await dbHelpers.clearAllData()

    // Import new data
    await db.transaction('rw', [db.profiles, db.workouts, db.foodLogs, db.checkins, db.aiPlans], async () => {
      await db.profiles.put(data.profile)
      
      for (const workout of data.workouts) {
        await db.workouts.put(workout)
      }
      
      for (const foodLog of data.foodLogs) {
        await db.foodLogs.put(foodLog)
      }
      
      for (const checkin of data.checkins) {
        await db.checkins.put(checkin)
      }
      
      for (const aiPlan of data.aiPlans) {
        await db.aiPlans.put(aiPlan)
      }
    })
  }

  async downloadExport(): Promise<void> {
    try {
      const data = await this.exportData()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = url
      a.download = `ai-trainer-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      throw new Error(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async uploadImport(file: File): Promise<void> {
    try {
      const text = await file.text()
      const data = JSON.parse(text) as ExportData
      await this.importData(data)
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('Invalid JSON file')
      }
      throw error
    }
  }

  validateImportFile(file: File): boolean {
    // Check file type
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      return false
    }
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return false
    }
    
    return true
  }
}

export const exportService = new ExportService()
