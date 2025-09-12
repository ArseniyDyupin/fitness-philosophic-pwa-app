import { db } from './db'
import type { ExportBundle } from '@/types/export'

export async function exportAll(): Promise<ExportBundle> {
  try {
    const [profile] = await db.profiles.toArray()
    
    const bundle: ExportBundle = {
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      profile,
      workouts: await db.workouts.toArray(),
      food: await db.food.toArray(),
      checkins: await db.checkins.toArray(),
      weeklyData: [], // For compatibility
      ai: await db.ai.toArray(),
      plans: await db.plans.toArray(),
    }
    
    return bundle
  } catch (error) {
    console.error('Failed to export data:', error)
    throw new Error('Failed to export data')
  }
}

export async function downloadExport(): Promise<void> {
  try {
    const bundle = await exportAll()
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { 
      type: 'application/json' 
    })
    
    // Format timestamp for filename
    const ts = new Date().toISOString()
      .slice(0, 16)
      .replace(/[:-]/g, '_')
      .replace('T', '_')
    
    const filename = `ai-trainer-export_${ts}_v1.json`
    
    // Create download link
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    
    // Cleanup
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Failed to download export:', error)
    throw new Error('Failed to download export')
  }
}