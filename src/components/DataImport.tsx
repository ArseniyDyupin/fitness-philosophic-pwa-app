import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslations } from '../stores/i18n.store'
import { validateFile, importData, ImportError, getImportPreview } from '../services/import'
import { toastSuccess, toastError } from '../lib/toast'
import type { ExportBundle, ImportPreview } from '../types/export'
import { Upload, FileText, Check, X, AlertCircle } from 'lucide-react'

const DataImport: React.FC = () => {
  const t = useTranslations()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [bundle, setBundle] = useState<ExportBundle | null>(null)
  const [preview, setPreview] = useState<ImportPreview | null>(null)
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('replace')
  const [isValidating, setIsValidating] = useState(false)
  const [isImporting, setIsImporting] = useState(false)


  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    setBundle(null)
    setPreview(null)
    setIsValidating(true)

    try {
      const validatedBundle = await validateFile(file)
      setBundle(validatedBundle)
      setPreview(getImportPreview(validatedBundle))
    } catch (err) {
      if (err instanceof ImportError) {
        switch (err.code) {
          case 'FILE_TOO_LARGE':
            toastError(t.fileTooLarge || 'File too large (max 20MB)')
            break
          case 'INVALID_FORMAT':
          case 'VALIDATION_ERROR':
          case 'PARSE_ERROR':
            toastError(t.invalidFormat || 'Invalid file format')
            break
          default:
            toastError(t.error || 'Error processing file')
        }
      } else {
        toastError(t.error || 'Error processing file')
      }
    } finally {
      setIsValidating(false)
    }
  }

  const handleImport = async () => {
    if (!bundle) return

    setIsImporting(true)

    try {
      const stats = await importData(bundle, importMode)
      
      let message = t.importSuccess || 'Import completed'
      if (importMode === 'merge') {
        const totalUpserted = stats.workoutsUpserted + stats.foodUpserted + 
                            stats.checkinsUpserted + stats.aiUpserted + stats.plansUpserted
        message += ` (${totalUpserted} records)`
      }
      
      toastSuccess(message)
      
      // Reset form
      setSelectedFile(null)
      setBundle(null)
      setPreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      
      // Redirect to home after successful import
      setTimeout(() => {
        navigate('/')
      }, 1500)
      
    } catch (err) {
      if (err instanceof ImportError) {
        toastError(err.message)
      } else {
        toastError(t.error || 'Import failed')
      }
    } finally {
      setIsImporting(false)
    }
  }

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString()
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {t.importAll || 'Import Data'}
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          {t.importAll === 'Import Data' 
            ? 'Import your data from a previously exported JSON file'
            : 'Импортируйте ваши данные из ранее экспортированного JSON файла'
          }
        </p>
      </div>

      {/* File Selection */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isValidating || isImporting}
          className="btn-secondary flex items-center space-x-2"
        >
          <Upload size={16} />
          <span>{t.chooseJson || 'Choose JSON'}</span>
        </button>
        
        {selectedFile && (
          <div className="mt-2 text-sm text-gray-600">
            <FileText size={14} className="inline mr-1" />
            {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
          </div>
        )}
      </div>

      {/* Validation Status */}
      {isValidating && (
        <div className="flex items-center space-x-2 text-blue-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm">{t.loading || 'Loading...'}</span>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-center space-x-2">
          <AlertCircle size={16} className="text-red-600" />
          <span className="text-sm text-red-800">{error}</span>
        </div>
      )}

      {/* Preview */}
      {preview && !error && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">{t.preview || 'Preview'}</h4>
          
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="text-sm">
              <span className="font-medium">{t.exportedAt || 'Exported at'}:</span> {formatDate(preview.exportedAt)}
            </div>
            <div className="text-sm">
              <span className="font-medium">Schema Version:</span> {preview.schemaVersion}
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-sm">
                <span className="font-medium">{t.profile || 'Profile'}:</span> {preview.hasProfile ? '✓' : '✗'}
              </div>
              <div className="text-sm">
                <span className="font-medium">{t.workouts || 'Workouts'}:</span> {preview.workoutsCount}
              </div>
              <div className="text-sm">
                <span className="font-medium">{t.food || 'Food'}:</span> {preview.foodCount}
              </div>
              <div className="text-sm">
                <span className="font-medium">Checkins:</span> {preview.checkinsCount}
              </div>
              <div className="text-sm">
                <span className="font-medium">AI History:</span> {preview.aiCount}
              </div>
              <div className="text-sm">
                <span className="font-medium">Plans:</span> {preview.plansCount}
              </div>
            </div>
          </div>

          {/* Import Mode Selection */}
          <div className="space-y-3">
            <h5 className="font-medium text-gray-900">{t.importMode || 'Import Mode'}</h5>
            
            <label className="flex items-start space-x-3">
              <input
                type="radio"
                name="importMode"
                value="replace"
                checked={importMode === 'replace'}
                onChange={(e) => setImportMode(e.target.value as 'replace')}
                className="mt-1 border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <div>
                <div className="font-medium text-gray-900">{t.replaceMode || 'Replace All'}</div>
                <div className="text-sm text-gray-600">
                  {t.replaceModeDescription || 'Clear all existing data and import from file'}
                </div>
              </div>
            </label>
            
            <label className="flex items-start space-x-3">
              <input
                type="radio"
                name="importMode"
                value="merge"
                checked={importMode === 'merge'}
                onChange={(e) => setImportMode(e.target.value as 'merge')}
                className="mt-1 border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <div>
                <div className="font-medium text-gray-900">{t.mergeMode || 'Merge'}</div>
                <div className="text-sm text-gray-600">
                  {t.mergeModeDescription || 'Merge with existing data, keep newer records'}
                </div>
              </div>
            </label>
          </div>

          {/* Import Button */}
          <button
            onClick={handleImport}
            disabled={isImporting}
            className="btn-primary flex items-center space-x-2"
          >
            {isImporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>{t.importing || 'Importing...'}</span>
              </>
            ) : (
              <>
                <Check size={16} />
                <span>{t.import || 'Import'}</span>
              </>
            )}
          </button>
        </div>
      )}

    </div>
  )
}

export default DataImport
