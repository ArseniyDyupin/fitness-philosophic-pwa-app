import { useState } from 'react'
import { metricsService } from '@services/fitness'
import { aiBodyService } from '@services/ai'
import { toast } from 'react-hot-toast'
import { useTranslations } from '@stores/i18n.store'
import type { MetricDef, MetricEntry, PhotoAsset, AiBodyEval } from '@/types/body-metrics'

interface MetricsExportData {
  metricDefs: MetricDef[]
  metricEntries: MetricEntry[]
  photoAssets: PhotoAsset[]
  aiEvaluations: AiBodyEval[]
  exportDate: string
  version: string
}

export const useMetricsExportImport = () => {
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const t = useTranslations()

  const exportMetrics = async (): Promise<void> => {
    try {
      setIsExporting(true)
      
      // Get all metrics data
      const [metricDefs, metricEntries, photoAssets, aiEvaluations] = await Promise.all([
        metricsService.getAllDefs(),
        metricsService.getAllEntries(),
        metricsService.getAllPhotos(),
        aiBodyService.getEvaluations()
      ])

      const exportData: MetricsExportData = {
        metricDefs,
        metricEntries,
        photoAssets,
        aiEvaluations,
        exportDate: new Date().toISOString(),
        version: '1.0'
      }

      // Create and download JSON file
      const dataStr = JSON.stringify(exportData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `metrics-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success(t.metrics?.exportSuccess || 'Metrics exported successfully')
    } catch (error) {
      console.error('Export failed:', error)
      toast.error(t.metrics?.exportError || 'Failed to export metrics')
    } finally {
      setIsExporting(false)
    }
  }

  const importMetrics = async (file: File): Promise<void> => {
    try {
      setIsImporting(true)
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(t.metrics?.fileSizeError || 'File size must be less than 10MB')
        return
      }

      // Read and parse file
      const text = await file.text()
      const importData: MetricsExportData = JSON.parse(text)

      // Validate data structure
      if (!importData.version || !importData.exportDate) {
        toast.error(t.metrics?.invalidFileError || 'Invalid file format')
        return
      }

      // Import data
      await Promise.all([
        metricsService.importDefs(importData.metricDefs || []),
        metricsService.importEntries(importData.metricEntries || []),
        metricsService.importPhotos(importData.photoAssets || []),
        aiBodyService.importEvaluations(importData.aiEvaluations || [])
      ])

      toast.success(t.metrics?.importSuccess || 'Metrics imported successfully')
    } catch (error) {
      console.error('Import failed:', error)
      toast.error(t.metrics?.importError || 'Failed to import metrics')
    } finally {
      setIsImporting(false)
    }
  }

  return {
    exportMetrics,
    importMetrics,
    isExporting,
    isImporting
  }
}
