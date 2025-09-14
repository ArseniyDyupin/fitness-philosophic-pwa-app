import React, { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useProfileStore } from '@stores/profile.store'
import { useI18nStore } from '@stores/i18n.store'
import { useTranslations } from '@stores/i18n.store'
import { dbHelpers } from '@services/data'
import { toastSuccess, toastError } from '@lib/toast'
import { checkForUpdates, getPWAStatus } from '@services/pwa'
import { ExportButton, ImportButton } from '@/ui/atoms'
import AISettings from '@modals/settings/AISettings'
import DataImport from '@modals/settings/DataImport'
import ProfileDetailsModal from '@modals/settings/ProfileDetailsModal'
import SettingsBodyMetrics from '@organisms/settings/SettingsBodyMetrics'
import { Edit, Check, X, Eye, RefreshCw } from 'lucide-react'
import type { Profile } from '@/types/models'

const SettingsPage: React.FC = () => {
  const { profile, saveProfile } = useProfileStore()
  const { setLanguage } = useI18nStore()
  const t = useTranslations()
  
  // Editing states
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [editedData, setEditedData] = useState<Partial<Profile>>({})
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)
  
  // Profile modal states
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [profileModalEditMode, setProfileModalEditMode] = useState(false)
  const [isUpgradingDB, setIsUpgradingDB] = useState(false)
  const [isDebuggingDB, setIsDebuggingDB] = useState(false)
  const [isDebuggingDatabase, setIsDebuggingDatabase] = useState(false)
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false)
  
  // Export/Import states
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  
  // Refs for scrolling
  const aiSettingsRef = useRef<HTMLDivElement>(null)
  const location = useLocation()

  // Handle scrolling to AI settings
  useEffect(() => {
    if (location.state?.scrollToAI && aiSettingsRef.current) {
      setTimeout(() => {
        aiSettingsRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        })
      }, 100)
    }
  }, [location.state])

  if (!profile) {
    return <div>{t.settingsPage?.loading || 'Loading...'}</div>
  }


  // Inline editing functions
  const startEditing = (section: string) => {
    setEditingSection(section)
    setValidationErrors({})
    
    // Initialize edited data based on section
    switch (section) {
      case 'language':
        setEditedData({ language: profile.language })
        break
      case 'profile':
        setEditedData({
          name: profile.name || '',
          age: profile.age || 18,
          height: profile.height || 170,
          weight: profile.weight || 70,
          gender: profile.gender || 'male'
        })
        break
    }
  }

  const cancelEditing = () => {
    setEditingSection(null)
    setEditedData({})
    setValidationErrors({})
  }

  const validateData = (section: string, data: unknown): Record<string, string> => {
    const errors: Record<string, string> = {}
    
    if (section === 'profile') {
      const profileData = data as any
      if (!profileData.name?.trim()) {
        errors.name = t.settingsPage?.nameRequired || 'Name is required'
      }
      if (profileData.age < 10 || profileData.age > 120) {
        errors.age = t.settingsPage?.ageInvalid || 'Age must be between 10 and 120'
      }
      if (profileData.height < 100 || profileData.height > 250) {
        errors.height = t.settingsPage?.heightInvalid || 'Height must be between 100 and 250 cm'
      }
      if (profileData.weight <= 0 || profileData.weight > 500) {
        errors.weight = t.settingsPage?.weightInvalid || 'Weight must be between 1 and 500 kg'
      }
    }
    
    
    return errors
  }

  const saveSection = async (section: string) => {
    const errors = validateData(section, editedData)
    setValidationErrors(errors)
    
    if (Object.keys(errors).length > 0) {
      return
    }
    
    setIsSaving(true)
    try {
      if (section === 'language') {
        await saveProfile({ language: editedData.language })
        if (editedData.language) setLanguage(editedData.language)
      } else {
        await saveProfile(editedData)
      }
      
      setEditingSection(null)
      setEditedData({})
      toastSuccess(t.settingsPage?.changesSaved || 'Changes saved successfully')
    } catch (error) {
      console.error('Failed to save changes:', error)
      toastError(t.settingsPage?.failedToSave || 'Failed to save changes')
    } finally {
      setIsSaving(false)
    }
  }


  const handleForceDBUpgrade = async () => {
    if (!confirm(t.settingsPage?.forceUpgradeConfirm || 'This will force upgrade the database. Continue?')) {
      return
    }
    
    setIsUpgradingDB(true)
    try {
      await dbHelpers.forceUpgrade()
      toastSuccess(t.settingsPage?.upgradeSuccess || 'Database upgraded successfully. Please refresh the page.')
    } catch (error) {
      console.error('Failed to upgrade database:', error)
      toastError(t.settingsPage?.upgradeError || 'Failed to upgrade database. Please refresh the page manually.')
    } finally {
      setIsUpgradingDB(false)
    }
  }

  const handleDebugDB = async () => {
    setIsDebuggingDB(true)
    try {
      const allFeedback = await dbHelpers.getAllAIFeedback()
      toastSuccess(t.settingsPage?.debugSuccess?.replace('{{count}}', allFeedback.length.toString()) || `Found ${allFeedback.length} AI feedback records. Check console for details.`)
    } catch (error) {
      console.error('Failed to debug database:', error)
      toastError(t.settingsPage?.debugError || 'Failed to debug database. Check console for errors.')
    } finally {
      setIsDebuggingDB(false)
    }
  }

  const handleDebugDatabase = async () => {
    setIsDebuggingDatabase(true)
    try {
      await dbHelpers.debugDatabase()
      toastSuccess(t.settingsPage?.debugSuccess || 'Database debug info logged to console')
    } catch (error) {
      console.error('Database debug failed:', error)
      toastError(t.settingsPage?.debugError || 'Database debug failed. Check console for details.')
    } finally {
      setIsDebuggingDatabase(false)
    }
  }

  const handleCheckUpdates = async () => {
    setIsCheckingUpdates(true)
    try {
      const pwaStatus = getPWAStatus()
      
      if (pwaStatus.hasServiceWorker) {
        checkForUpdates()
        toastSuccess(t.pwa?.updateAvailable || 'Checking for updates...')
      } else {
        toastError(t.pwa?.serviceWorkerNotSupported || 'Service Worker not supported')
      }
    } catch (error) {
      toastError(t.pwa?.checkUpdatesFailed || 'Failed to check for updates')
    } finally {
      setIsCheckingUpdates(false)
    }
  }

  // Export/Import functions
  const handleExport = async () => {
    setIsExporting(true)
    try {
      // Import the export function
      const { downloadExport } = await import('@services/data')
      await downloadExport()
      toastSuccess(t.exportSuccess || 'Data exported successfully')
    } catch (error) {
      console.error('Export failed:', error)
      toastError(t.error || 'Export failed')
    } finally {
      setIsExporting(false)
    }
  }

  const handleImport = async (file: File) => {
    setIsImporting(true)
    try {
      // Import the import function
      const { importData } = await import('@services/data')
      await importData(file as any)
      toastSuccess(t.importSuccess || 'Data imported successfully')
    } catch (error) {
      console.error('Import failed:', error)
      toastError(t.error || 'Import failed')
    } finally {
      setIsImporting(false)
    }
  }

  // Profile modal functions
  const openProfileModal = (editMode: boolean = false) => {
    setProfileModalEditMode(editMode)
    setIsProfileModalOpen(true)
  }

  const closeProfileModal = () => {
    setIsProfileModalOpen(false)
    setProfileModalEditMode(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">{t.settingsPage?.title || t.settings}</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Language Settings */}
          <div className={`card ${editingSection === 'language' ? 'ring-2 ring-primary-500 bg-primary-50' : ''}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">{t.settingsPage?.language || 'Language'}</h2>
              {editingSection !== 'language' && (
                <button
                  onClick={() => startEditing('language')}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  title={t.settingsPage?.editLanguage || 'Edit language'}
                >
                  <Edit size={16} />
                </button>
              )}
            </div>
            
            {editingSection === 'language' ? (
              <div className="space-y-4">
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                      name="editLanguage"
                  value="en"
                      checked={editedData.language === 'en'}
                      onChange={(e) => setEditedData({ ...editedData, language: e.target.value as any })}
                  className="border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                    <span className="ml-3 text-gray-700">{t.english}</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                      name="editLanguage"
                  value="ru"
                      checked={editedData.language === 'ru'}
                      onChange={(e) => setEditedData({ ...editedData, language: e.target.value as any })}
                  className="border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                    <span className="ml-3 text-gray-700">{t.russian}</span>
              </label>
            </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => saveSection('language')}
                    disabled={isSaving}
                    className="btn-primary flex items-center space-x-1"
                  >
                    <Check size={16} />
                    <span>{isSaving ? (t.saving || 'Saving...') : (t.save || 'Save')}</span>
                  </button>
                  <button
                    onClick={cancelEditing}
                    disabled={isSaving}
                    className="btn-secondary flex items-center space-x-1"
                  >
                    <X size={16} />
                    <span>{t.cancel || 'Cancel'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-gray-900">
                  {profile.language === 'en' ? t.english : t.russian}
                </p>
              </div>
            )}
          </div>

          {/* Profile Information */}
          <div className={`card ${editingSection === 'profile' ? 'ring-2 ring-primary-500 bg-primary-50' : ''}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">{t.settingsPage?.profileInformation || 'Profile Information'}</h2>
              {editingSection !== 'profile' && (
                <button
                  onClick={() => openProfileModal(true)}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  title={t.settingsPage?.editProfile || 'Edit profile'}
                >
                  <Edit size={16} />
                </button>
              )}
            </div>
            
            {editingSection === 'profile' ? (
              <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.settingsPage?.name || 'Name'}</label>
                    <input
                      type="text"
                      value={editedData.name || ''}
                      onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500 ${
                        validationErrors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    {validationErrors.name && (
                      <p className="text-sm text-red-600 mt-1">{validationErrors.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.settingsPage?.age || 'Age'}</label>
                    <input
                      type="number"
                      min="10"
                      max="120"
                      value={editedData.age || ''}
                      onChange={(e) => setEditedData({ ...editedData, age: parseInt(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500 ${
                        validationErrors.age ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    {validationErrors.age && (
                      <p className="text-sm text-red-600 mt-1">{validationErrors.age}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.settingsPage?.height || 'Height'} ({t.settingsPage?.cm || 'cm'})</label>
                    <input
                      type="number"
                      min="100"
                      max="250"
                      value={editedData.height || ''}
                      onChange={(e) => setEditedData({ ...editedData, height: parseInt(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500 ${
                        validationErrors.height ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    {validationErrors.height && (
                      <p className="text-sm text-red-600 mt-1">{validationErrors.height}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.settingsPage?.weight || 'Weight'} ({t.settingsPage?.kg || 'kg'})</label>
                    <input
                      type="number"
                      min="1"
                      max="500"
                      value={editedData.weight || ''}
                      onChange={(e) => setEditedData({ ...editedData, weight: parseInt(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500 ${
                        validationErrors.weight ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    {validationErrors.weight && (
                      <p className="text-sm text-red-600 mt-1">{validationErrors.weight}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.settingsPage?.gender || 'Gender'}</label>
                    <select
                      value={editedData.gender || ''}
                      onChange={(e) => setEditedData({ ...editedData, gender: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="male">{t.settingsPage?.male || 'Male'}</option>
                      <option value="female">{t.settingsPage?.female || 'Female'}</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => saveSection('profile')}
                    disabled={isSaving}
                    className="btn-primary flex items-center space-x-1"
                  >
                    <Check size={16} />
                    <span>{isSaving ? (t.saving || 'Saving...') : (t.save || 'Save')}</span>
                  </button>
                  <button
                    onClick={cancelEditing}
                    disabled={isSaving}
                    className="btn-secondary flex items-center space-x-1"
                  >
                    <X size={16} />
                    <span>{t.cancel || 'Cancel'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.settingsPage?.name || 'Name'}</label>
                  <p className="text-gray-900">{profile.name || (t.settingsPage?.notSet || 'Not set')}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.settingsPage?.age || 'Age'}</label>
                  <p className="text-gray-900">{profile.age} {t.settingsPage?.years || 'years'}</p>
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.settingsPage?.height || 'Height'}</label>
                  <p className="text-gray-900">{profile.height} {t.settingsPage?.cm || 'cm'}</p>
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.settingsPage?.weight || 'Weight'}</label>
                  <p className="text-gray-900">{profile.weight} {t.settingsPage?.kg || 'kg'}</p>
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.settingsPage?.gender || 'Gender'}</label>
                  <p className="text-gray-900 capitalize">{profile.gender}</p>
                </div>
              </div>
            )}
            
            {/* View All Details Button */}
            {editingSection !== 'profile' && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => openProfileModal(false)}
                  className="btn-secondary flex items-center space-x-2 w-full justify-center"
                >
                  <Eye size={16} />
                  <span>{t.settingsPage?.viewAllDetails || 'View all details'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Onboarding Reset */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t.settingsPage?.onboarding || 'Onboarding'}</h2>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                {t.settingsPage?.onboardingDescription || 'Reset the onboarding process to start over with language selection and profile setup.'}
              </p>
              <button
                onClick={() => {
                  if (confirm(t.settingsPage?.resetConfirmMessage || 'Are you sure you want to reset onboarding? This will clear your profile and start over.')) {
                    localStorage.removeItem('ai-trainer:has-launched')
                    localStorage.removeItem('ai-trainer:onboarding-draft')
                    window.location.reload()
                  }
                }}
                className="btn-secondary text-red-600 border-red-300 hover:bg-red-50"
              >
                {t.settingsPage?.resetOnboarding || 'Reset Onboarding'}
              </button>
            </div>
          </div>


          {/* AI Configuration */}
          <div ref={aiSettingsRef} className="card">
            <AISettings />
          </div>

          {/* Body Metrics */}
          <div className="card">
            <SettingsBodyMetrics />
          </div>

          {/* Data Import */}
          <div className="card">
            <DataImport />
          </div>

          {/* Export/Import (Legacy) */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t.settingsPage?.dataManagement || 'Data Management'}</h2>
            <div className="flex space-x-3">
              <ExportButton 
                onClick={handleExport}
                loading={isExporting}
              />
              <ImportButton 
                onFileSelect={handleImport}
                loading={isImporting}
              />
            </div>
            
            {/* Database Management */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-md font-semibold text-gray-900 mb-3">{t.settingsPage?.databaseManagement || 'Database Management'}</h3>
              <div className="space-y-3">
                <button
                  onClick={handleForceDBUpgrade}
                  disabled={isUpgradingDB}
                  className="flex items-center space-x-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpgradingDB ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-700"></div>
                      <span>{t.settingsPage?.upgrading || 'Upgrading...'}</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw size={16} />
                      <span>{t.settingsPage?.forceDatabaseUpgrade || 'Force Database Upgrade'}</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleDebugDB}
                  disabled={isDebuggingDB}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDebuggingDB ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700"></div>
                      <span>{t.settingsPage?.debugging || 'Debugging...'}</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw size={16} />
                      <span>{t.settingsPage?.debugAIFeedback || 'Debug AI Feedback'}</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleDebugDatabase}
                  disabled={isDebuggingDatabase}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDebuggingDatabase ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-700"></div>
                      <span>{t.settingsPage?.debugging || 'Debugging...'}</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw size={16} />
                      <span>{t.settingsPage?.debugDatabase || 'Debug Database'}</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleCheckUpdates}
                  disabled={isCheckingUpdates}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCheckingUpdates ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-700"></div>
                      <span>{t.pwa?.updateAvailable || 'Checking...'}</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw size={16} />
                      <span>{t.pwa?.update || 'Check Updates'}</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {t.settingsPage?.databaseHelpText || 'Use "Force Database Upgrade" if you encounter database errors. Use "Debug AI Feedback" to check what AI feedback records exist. Use "Check Updates" to manually check for PWA updates.'}
              </p>
            </div>
          </div>
        </div>


        {/* Profile Details Modal */}
        <ProfileDetailsModal
          isOpen={isProfileModalOpen}
          onClose={closeProfileModal}
          initialEditMode={profileModalEditMode}
        />
      </main>
    </div>
  )
}

export default SettingsPage
