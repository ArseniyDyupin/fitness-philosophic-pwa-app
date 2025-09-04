import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfileStore } from '../stores/profile.store'
import { useI18nStore } from '../stores/i18n.store'
import { useTranslations } from '../stores/i18n.store'
import JsonFileButtons from '../components/JsonFileButtons'
import AISettings from '../components/AISettings'
import DataImport from '../components/DataImport'
import { Edit, Check, X } from 'lucide-react'

const SettingsPage: React.FC = () => {
  const navigate = useNavigate()
  const { profile, saveProfile } = useProfileStore()
  const { setLanguage } = useI18nStore()
  const t = useTranslations()
  
  // Editing states
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [editedData, setEditedData] = useState<any>({})
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

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
      case 'goals':
        setEditedData({
          goal: profile.goal || '',
          goalsDetailed: profile.goalsDetailed || ''
        })
        break
    }
  }

  const cancelEditing = () => {
    setEditingSection(null)
    setEditedData({})
    setValidationErrors({})
  }

  const validateData = (section: string, data: any): Record<string, string> => {
    const errors: Record<string, string> = {}
    
    if (section === 'profile') {
      if (!data.name?.trim()) {
        errors.name = t.settingsPage?.nameRequired || 'Name is required'
      }
      if (data.age < 10 || data.age > 120) {
        errors.age = t.settingsPage?.ageInvalid || 'Age must be between 10 and 120'
      }
      if (data.height < 100 || data.height > 250) {
        errors.height = t.settingsPage?.heightInvalid || 'Height must be between 100 and 250 cm'
      }
      if (data.weight <= 0 || data.weight > 500) {
        errors.weight = t.settingsPage?.weightInvalid || 'Weight must be between 1 and 500 kg'
      }
    }
    
    if (section === 'goals') {
      if (!data.goal?.trim()) {
        errors.goal = t.settingsPage?.goalRequired || 'Goal is required'
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
        setLanguage(editedData.language)
      } else {
        await saveProfile(editedData)
      }
      
      setEditingSection(null)
      setEditedData({})
      showToast(t.settingsPage?.changesSaved || 'Changes saved successfully', 'success')
    } catch (error) {
      console.error('Failed to save changes:', error)
      showToast(t.settingsPage?.failedToSave || 'Failed to save changes', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <button
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-900"
            >
              {t.settingsPage?.back || '← Back'}
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{t.settings}</h1>
            <div></div>
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
                      onChange={(e) => setEditedData({ ...editedData, language: e.target.value })}
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
                      onChange={(e) => setEditedData({ ...editedData, language: e.target.value })}
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
                  onClick={() => startEditing('profile')}
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
                      onChange={(e) => setEditedData({ ...editedData, gender: e.target.value })}
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

          {/* Goals */}
          <div className={`card ${editingSection === 'goals' ? 'ring-2 ring-primary-500 bg-primary-50' : ''}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">{t.settingsPage?.goals || 'Goals'}</h2>
              {editingSection !== 'goals' && (
                <button
                  onClick={() => startEditing('goals')}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  title={t.settingsPage?.editGoals || 'Edit goals'}
                >
                  <Edit size={16} />
                </button>
              )}
            </div>
            
            {editingSection === 'goals' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.settingsPage?.mainGoal || 'Main Goal'}</label>
                  <textarea
                    value={editedData.goal || ''}
                    onChange={(e) => setEditedData({ ...editedData, goal: e.target.value })}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500 ${
                      validationErrors.goal ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder={t.settingsPage?.goalPlaceholder || 'Describe your main fitness goal...'}
                  />
                  {validationErrors.goal && (
                    <p className="text-sm text-red-600 mt-1">{validationErrors.goal}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.settingsPage?.detailedGoals || 'Detailed Goals'}</label>
                  <textarea
                    value={editedData.goalsDetailed || ''}
                    onChange={(e) => setEditedData({ ...editedData, goalsDetailed: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    placeholder={t.settingsPage?.detailedGoalsPlaceholder || 'Add more details about your fitness goals, timeline, preferences...'}
                  />
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => saveSection('goals')}
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
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.settingsPage?.mainGoal || 'Main Goal'}</label>
                  <p className="text-gray-900">{profile.goal || (t.settingsPage?.noGoalsSet || 'No goals set')}</p>
            </div>
            {profile.goalsDetailed && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.settingsPage?.detailedGoals || 'Detailed Goals'}</label>
                <p className="text-gray-900">{profile.goalsDetailed}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* AI Configuration */}
          <div className="card">
            <AISettings />
          </div>

          {/* Data Import */}
          <div className="card">
            <DataImport />
            </div>

          {/* Export/Import (Legacy) */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t.settingsPage?.dataManagement || 'Data Management'}</h2>
            <JsonFileButtons />
          </div>
        </div>

        {/* Toast Notification */}
        {toast && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
            toast.type === 'success' 
              ? 'bg-green-100 border border-green-200 text-green-800' 
              : 'bg-red-100 border border-red-200 text-red-800'
          }`}>
            <div className="flex items-center space-x-2">
              {toast.type === 'success' ? (
                <Check size={16} className="text-green-600" />
              ) : (
                <X size={16} className="text-red-600" />
              )}
              <span className="text-sm font-medium">{toast.message}</span>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default SettingsPage
