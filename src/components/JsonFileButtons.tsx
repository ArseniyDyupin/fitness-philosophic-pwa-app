import React, { useRef, useState } from 'react'

import { exportData, importData, downloadData, readFile } from '../services/export'
import { Download, Upload, AlertCircle, CheckCircle } from 'lucide-react'

interface JsonFileButtonsProps {
  onImportSuccess?: () => void
}

const JsonFileButtons: React.FC<JsonFileButtonsProps> = ({ onImportSuccess }) => {

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleExport = async () => {
    setIsExporting(true)
    setMessage(null)
    
    try {
      const data = await exportData()
      downloadData(data, `ai-trainer-backup-${new Date().toISOString().split('T')[0]}.json`)
      setMessage({ type: 'success', text: 'Data exported successfully!' })
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Export failed' 
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleImport = async (file: File) => {
    setIsImporting(true)
    setMessage(null)
    
    try {
      // Validate file
      if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
        throw new Error('Please select a valid JSON file')
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        throw new Error('File size must be less than 10MB')
      }

      const data = await readFile(file)
      await importData(data)
      
      setMessage({ type: 'success', text: 'Data imported successfully!' })
      onImportSuccess?.()
      
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Import failed' 
      })
    } finally {
      setIsImporting(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleImport(file)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      {/* Message Display */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center space-x-3 ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle size={20} className="text-green-600" />
          ) : (
            <AlertCircle size={20} className="text-red-600" />
          )}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Export Button */}
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download size={20} />
          <span>
            {isExporting ? 'Exporting...' : 'Export All Data'}
          </span>
        </button>

        {/* Import Button */}
        <button
          onClick={triggerFileInput}
          disabled={isImporting}
          className="btn-secondary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload size={20} />
          <span>
            {isImporting ? 'Importing...' : 'Import Data'}
          </span>
        </button>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Help Text */}
      <div className="text-sm text-gray-600 space-y-2">
        <p>
          <strong>Export:</strong> Download all your data as a JSON file for backup.
        </p>
        <p>
          <strong>Import:</strong> Restore your data from a previously exported JSON file.
        </p>
        <p className="text-xs text-gray-500">
          Note: Importing will replace all existing data. Make sure to backup first.
        </p>
      </div>
    </div>
  )
}

export default JsonFileButtons
