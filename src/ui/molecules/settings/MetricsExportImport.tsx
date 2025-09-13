import React, { useRef } from 'react'
import { useTranslations } from '@stores/i18n.store'
import { useMetricsExportImport } from '@hooks/useMetricsExportImport'
import { Download, Upload, Loader } from 'lucide-react'
import Button from '@atoms/Button'

const MetricsExportImport: React.FC = () => {
  const t = useTranslations()
  const { exportMetrics, importMetrics, isExporting, isImporting } = useMetricsExportImport()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = async () => {
    await exportMetrics()
  }

  const handleImport = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      await importMetrics(file)
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {t.metrics?.exportImport || 'Export/Import Metrics'}
        </h3>
        <p className="text-sm text-gray-600">
          {t.metrics?.exportImportDescription || 'Export your metrics data to a JSON file or import from a previously exported file.'}
        </p>
      </div>

      <div className="flex space-x-3">
        <Button
          onClick={handleExport}
          disabled={isExporting}
          variant="secondary"
          className="flex items-center space-x-2"
        >
          {isExporting ? (
            <Loader className="animate-spin h-4 w-4" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          <span>{t.metrics?.export || 'Export'}</span>
        </Button>

        <Button
          onClick={handleImport}
          disabled={isImporting}
          variant="secondary"
          className="flex items-center space-x-2"
        >
          {isImporting ? (
            <Loader className="animate-spin h-4 w-4" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          <span>{t.metrics?.import || 'Import'}</span>
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}

export default MetricsExportImport
