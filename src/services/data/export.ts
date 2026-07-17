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
      ai_feedback: await db.ai_feedback.toArray(),
      metric_defs: await db.metric_defs.toArray(),
      metric_entries: await db.metric_entries.toArray(),
      photo_assets: await db.photo_assets.toArray(),
      ai_body_evals: await db.ai_body_evals.toArray(),
      exercise_estimates: await db.exercise_estimates.toArray(),
      weekly_reviews: await db.weekly_reviews.toArray(),
    }
    
    return bundle
  } catch (error) {
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
    throw new Error('Failed to download export')
  }
}
