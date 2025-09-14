import { useState } from 'react'
import { useProfileStore } from '@stores/profile.store'
import { useWorkoutStore } from '@stores/workout.store'
import { useWeeklyStore } from '@stores/weekly.store'
import { downloadExport, importData } from '@services/data'
import { toastSuccess, toastError } from '@lib/toast'
import { useTranslations } from '@stores/i18n.store'
import type { ExportBundle } from '@/types/export'

export interface ImportOptions {
  mode: 'replace' | 'merge'
}

export function useExportImport() {
  const t = useTranslations()
  const { profile } = useProfileStore()
  const { workouts } = useWorkoutStore()
  const { weeklyData } = useWeeklyStore()
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  const exportData = async () => {
    if (!profile) {
      toastError(t.error || 'Profile not found')
      return { success: false, error: 'Profile not found' }
    }

    setIsExporting(true)
    try {
      await downloadExport()
      toastSuccess(t.exportSuccess || 'Data exported successfully')
      return { success: true }
    } catch (error) {
      const message = error instanceof Error ? error.message : (t.error || 'Export failed')
      toastError(message)
      return { success: false, error: message }
    } finally {
      setIsExporting(false)
    }
  }

  const importDataFromFile = async (file: File, options: ImportOptions) => {
    setIsImporting(true)
    try {
      // Validate file
      if (file.size > 20 * 1024 * 1024) {
        throw new Error(t.fileTooLarge || 'File too large (max 20MB)')
      }

      if (!file.name.endsWith('.json')) {
        throw new Error(t.invalidFormat || 'Invalid file format')
      }

      // Read and parse file
      const text = await file.text()
      const data: ExportBundle = JSON.parse(text)

      // Import data
      await importData(data, options.mode)
      
      toastSuccess(t.importSuccess || 'Import completed')
      return { success: true }
    } catch (error) {
      const message = error instanceof Error ? error.message : (t.error || 'Import failed')
      toastError(message)
      return { success: false, error: message }
    } finally {
      setIsImporting(false)
    }
  }

  const validateImportFile = async (file: File): Promise<{ valid: boolean; data?: ExportBundle; error?: string }> => {
    try {
      if (file.size > 20 * 1024 * 1024) {
        return { valid: false, error: t.fileTooLarge || 'File too large (max 20MB)' }
      }

      if (!file.name.endsWith('.json')) {
        return { valid: false, error: t.invalidFormat || 'Invalid file format' }
      }

      const text = await file.text()
      const data: ExportBundle = JSON.parse(text)

      // Basic validation
      if (!data.profile && !data.workouts && !data.weeklyData) {
        return { valid: false, error: t.invalidFormat || 'Invalid file format' }
      }

      return { valid: true, data }
    } catch (error) {
      return { 
        valid: false, 
        error: error instanceof Error ? error.message : (t.error || 'Failed to read file')
      }
    }
  }

  return {
    exportData,
    importDataFromFile,
    validateImportFile,
    isExporting,
    isImporting,
    hasData: !!(profile || workouts.length > 0 || weeklyData.length > 0)
  }
}
