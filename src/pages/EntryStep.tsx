import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOnboardingStore } from '../stores/onboarding.store'
import { useTranslations } from '../stores/i18n.store'
import { Upload, Play, FileText, User, CheckCircle, AlertCircle } from 'lucide-react'
import { readFile, importData } from '../services/export'
import type { ExportBundle } from '../types/models'

const EntryStep: React.FC = () => {
  const navigate = useNavigate()
  const { clearDraft } = useOnboardingStore()
  const t = useTranslations()
  
  const [isImporting, setIsImporting] = useState(false)
  const [importPreview, setImportPreview] = useState<ExportBundle | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('replace')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check file size (20MB limit)
    if (file.size > 20 * 1024 * 1024) {
      setImportError('File too large. Maximum size is 20MB.')
      return
    }

    setIsImporting(true)
    setImportError(null)
    setImportPreview(null)

    try {
      const data = await readFile(file)
      setImportPreview(data)
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Failed to read file')
    } finally {
      setIsImporting(false)
    }
  }

  const handleImport = async () => {
    if (!importPreview) return

    setIsImporting(true)
    try {
      await importData(importPreview, importMode)
      
      // Clear onboarding draft since we imported a profile
      clearDraft()
      
      // Redirect to home
      navigate('/')
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Import failed')
    } finally {
      setIsImporting(false)
    }
  }

  const handleStartOnboarding = () => {
    // Clear any existing draft
    clearDraft()
    
    // Navigate to first onboarding step
    navigate('/onboarding/goals')
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const formatProfileSummary = (profile: any) => {
    return {
      name: profile.name || 'Not set',
      age: profile.age || 'Not set',
      gender: profile.gender || 'Not set',
      height: profile.height ? `${profile.height} cm` : 'Not set',
      weight: profile.weight ? `${profile.weight} kg` : 'Not set',
      goals: profile.goal?.types?.join(', ') || 'Not set',
      workouts: profile.workouts?.length || 0,
      foodLogs: profile.food?.length || 0
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t.onboarding?.entry?.title || 'Welcome to AI Trainer'}
          </h1>
          <p className="text-xl text-gray-600">
            {t.onboarding?.entry?.subtitle || 'Choose how to get started'}
          </p>
        </div>

        {/* Main Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Import Profile Card */}
          <div className="card hover:shadow-lg transition-shadow">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {t.onboarding?.entry?.importCardTitle || 'Import Profile (JSON)'}
              </h2>
              <p className="text-gray-600">
                {t.onboarding?.entry?.importCardDescription || 'Restore your data from a backup file'}
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={triggerFileInput}
                disabled={isImporting}
                className="btn-primary w-full flex items-center justify-center space-x-2"
              >
                <FileText size={20} />
                <span>
                  {isImporting ? 'Loading...' : 'Load JSON File'}
                </span>
              </button>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Import Preview */}
              {importPreview && (
                <div className="border border-green-200 bg-green-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-800">Profile Found!</span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    {importPreview.profile && (
                      <div className="grid grid-cols-2 gap-2 text-green-700">
                        {Object.entries(formatProfileSummary(importPreview.profile)).map(([key, value]) => (
                          <div key={key}>
                            <span className="font-medium capitalize">{key}:</span> {value}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="text-green-700">
                      <span className="font-medium">Data:</span> {importPreview.workouts?.length || 0} workouts, 
                      {importPreview.food?.length || 0} food logs, 
                      {importPreview.checkins?.length || 0} check-ins
                    </div>
                  </div>

                  {/* Import Options */}
                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Import Mode
                      </label>
                      <div className="space-x-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="replace"
                            checked={importMode === 'replace'}
                            onChange={(e) => setImportMode(e.target.value as 'replace' | 'merge')}
                            className="mr-2"
                          />
                          <span className="text-sm">Replace all data</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="merge"
                            checked={importMode === 'merge'}
                            onChange={(e) => setImportMode(e.target.value as 'replace' | 'merge')}
                            className="mr-2"
                          />
                          <span className="text-sm">Merge with existing</span>
                        </label>
                      </div>
                    </div>

                    <button
                      onClick={handleImport}
                      disabled={isImporting}
                      className="btn-primary w-full"
                    >
                      {isImporting ? 'Importing...' : 'Import Profile'}
                    </button>
                  </div>
                </div>
              )}

              {/* Import Error */}
              {importError && (
                <div className="border border-red-200 bg-red-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <span className="text-red-800">{importError}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Start Onboarding Card */}
          <div className="card hover:shadow-lg transition-shadow">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {t.onboarding?.entry?.startCardTitle || 'Start Onboarding'}
              </h2>
              <p className="text-gray-600">
                {t.onboarding?.entry?.startCardDescription || 'Create a new profile step by step'}
              </p>
            </div>

            <div className="space-y-4">
              <div className="text-sm text-gray-600 space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Set your fitness goals</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Configure your profile</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Start tracking workouts</span>
                </div>
              </div>

              <button
                onClick={handleStartOnboarding}
                className="btn-primary w-full flex items-center justify-center space-x-2"
              >
                <User size={20} />
                <span>Begin Onboarding</span>
              </button>
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="text-center mt-12 text-sm text-gray-500">
          <p>
            {t.onboarding?.entry?.helpText || 'Choose to either import an existing profile or create a new one from scratch.'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default EntryStep
