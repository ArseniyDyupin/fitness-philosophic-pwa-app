import React, { useState, useEffect } from 'react'
import { useProfileStore } from '@stores/profile.store'
import { useI18nStore } from '@stores/i18n.store'
import { useTranslations } from '@stores/i18n.store'
import { toastSuccess, toastError } from '@lib/toast'
import { X, Edit, Save } from 'lucide-react'
import type { Profile } from '@/types/models'

interface ProfileDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  initialEditMode?: boolean
}

const ProfileDetailsModal: React.FC<ProfileDetailsModalProps> = ({ 
  isOpen, 
  onClose, 
  initialEditMode = false 
}) => {
  const { profile, saveProfile } = useProfileStore()
  const { setLanguage } = useI18nStore()
  const t = useTranslations()
  
  const [isEditMode, setIsEditMode] = useState(initialEditMode)
  const [editedData, setEditedData] = useState<Partial<Profile>>({})
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'general' | 'goals'>('general')

  useEffect(() => {
    if (isOpen && profile) {
      setIsEditMode(initialEditMode)
      setEditedData({
        name: profile.name || '',
        age: profile.age || 18,
        gender: profile.gender || 'male',
        height: profile.height || 170,
        weight: profile.weight || 70,
        language: profile.language || 'ru',
        goal: profile.goal || '',
        goalsDetailed: profile.goalsDetailed || '',
        constraints: profile.constraints || [],
        equipment: profile.equipment || [],
        frequency: profile.frequency || 3,
        duration: profile.duration || 60
      })
      setValidationErrors({})
    }
  }, [isOpen, profile, initialEditMode])

  const validateData = (): Record<string, string> => {
    const errors: Record<string, string> = {}
    
    if (!editedData.name?.trim()) {
      errors.name = t.profile?.nameRequired || 'Name is required'
    }
    if (editedData.age && (editedData.age < 10 || editedData.age > 100)) {
      errors.age = t.profile?.ageRange || 'Age must be between 10 and 100'
    }
    if (editedData.height && (editedData.height < 100 || editedData.height > 250)) {
      errors.height = t.profile?.heightRange || 'Height must be between 100 and 250 cm'
    }
    if (editedData.weight && (editedData.weight < 30 || editedData.weight > 300)) {
      errors.weight = t.profile?.weightRange || 'Weight must be between 30 and 300 kg'
    }
    if (editedData.frequency && (editedData.frequency < 1 || editedData.frequency > 14)) {
      errors.frequency = t.profile?.frequencyRange || 'Frequency must be between 1 and 14'
    }
    if (editedData.duration && (editedData.duration < 5 || editedData.duration > 300)) {
      errors.duration = t.profile?.durationRange || 'Duration must be between 5 and 300 minutes'
    }
    
    return errors
  }

  const handleSave = async () => {
    const errors = validateData()
    setValidationErrors(errors)
    
    if (Object.keys(errors).length > 0) {
      return
    }
    
    setIsSaving(true)
    try {
      const updatedProfile = {
        ...editedData,
        updatedAt: new Date().toISOString()
      }
      
      await saveProfile(updatedProfile)
      
      if (editedData.language !== profile?.language) {
        if (editedData.language) setLanguage(editedData.language)
      }
      
      setIsEditMode(false)
      toastSuccess(t.profile?.updateSuccess || 'Profile updated successfully')
    } catch (error) {
      console.error('Failed to save profile:', error)
      toastError(t.profile?.updateError || 'Failed to save profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (initialEditMode) {
      onClose()
    } else {
      setIsEditMode(false)
      setValidationErrors({})
    }
  }


  if (!isOpen || !profile) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-sm sm:max-w-2xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            {t.profile?.title || 'Profile Details'}
          </h2>
          <button
            onClick={onClose}
            className="hit-44 focus-visible-ring text-gray-400 hover:text-gray-600 transition-colors rounded-lg"
          >
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'general'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.profile?.general || 'General'}
          </button>
          <button
            onClick={() => setActiveTab('goals')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'goals'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.profile?.goalsPreferences || 'Goals & Preferences'}
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[50vh] sm:max-h-[60vh]">
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.profile?.name || 'Name'}
                  </label>
                  {isEditMode ? (
                    <input
                      type="text"
                      value={editedData.name || ''}
                      onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500 ${
                        validationErrors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{profile.name || t.profile?.notSet || 'Not set'}</p>
                  )}
                  {validationErrors.name && (
                    <p className="text-sm text-red-600 mt-1">{validationErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.profile?.age || 'Age'}
                  </label>
                  {isEditMode ? (
                    <input
                      type="number"
                      min="10"
                      max="100"
                      value={editedData.age || ''}
                      onChange={(e) => setEditedData({ ...editedData, age: parseInt(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500 ${
                        validationErrors.age ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{profile.age} {t.profile?.years || 'years'}</p>
                  )}
                  {validationErrors.age && (
                    <p className="text-sm text-red-600 mt-1">{validationErrors.age}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.profile?.gender || 'Gender'}
                  </label>
                  {isEditMode ? (
                    <select
                      value={editedData.gender || ''}
                      onChange={(e) => setEditedData({ ...editedData, gender: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="male">{t.profile?.male || 'Male'}</option>
                      <option value="female">{t.profile?.female || 'Female'}</option>
                      <option value="other">{t.profile?.other || 'Other'}</option>
                    </select>
                  ) : (
                    <p className="text-gray-900 py-2 capitalize">{profile.gender}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.profile?.height || 'Height'} ({t.profile?.units?.cm || 'cm'})
                  </label>
                  {isEditMode ? (
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
                  ) : (
                    <p className="text-gray-900 py-2">{profile.height} {t.profile?.units?.cm || 'cm'}</p>
                  )}
                  {validationErrors.height && (
                    <p className="text-sm text-red-600 mt-1">{validationErrors.height}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.profile?.weight || 'Weight'} ({t.profile?.units?.kg || 'kg'})
                  </label>
                  {isEditMode ? (
                    <input
                      type="number"
                      min="30"
                      max="300"
                      value={editedData.weight || ''}
                      onChange={(e) => setEditedData({ ...editedData, weight: parseInt(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500 ${
                        validationErrors.weight ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{profile.weight} {t.profile?.units?.kg || 'kg'}</p>
                  )}
                  {validationErrors.weight && (
                    <p className="text-sm text-red-600 mt-1">{validationErrors.weight}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.profile?.language || 'Language'}
                  </label>
                  {isEditMode ? (
                    <select
                      value={editedData.language || ''}
                      onChange={(e) => setEditedData({ ...editedData, language: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="en">{t.profile?.english || 'English'}</option>
                      <option value="ru">{t.profile?.russian || 'Русский'}</option>
                    </select>
                  ) : (
                    <p className="text-gray-900 py-2">{profile.language === 'en' ? (t.profile?.english || 'English') : (t.profile?.russian || 'Русский')}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'goals' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.profile?.goalDescription || 'Goal Description'}
                </label>
                {isEditMode ? (
                  <textarea
                    value={editedData.goal || ''}
                    onChange={(e) => setEditedData({ ...editedData, goal: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    placeholder={t.profile?.goalPlaceholder || 'Describe your main fitness goal...'}
                  />
                ) : (
                  <p className="text-gray-900 py-2">{profile.goal || t.profile?.notSet || 'Not set'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.profile?.detailedGoals || 'Detailed Goals'}
                </label>
                {isEditMode ? (
                  <textarea
                    value={editedData.goalsDetailed || ''}
                    onChange={(e) => setEditedData({ ...editedData, goalsDetailed: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    placeholder={t.profile?.detailedGoalsPlaceholder || 'Add more details about your fitness goals...'}
                  />
                ) : (
                  <p className="text-gray-900 py-2">{profile.goalsDetailed || t.profile?.notSet || 'Not set'}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.profile?.workoutsPerWeek || 'Workouts per week'}
                  </label>
                  {isEditMode ? (
                    <input
                      type="number"
                      min="1"
                      max="14"
                      value={editedData.frequency || ''}
                      onChange={(e) => setEditedData({ ...editedData, frequency: parseInt(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500 ${
                        validationErrors.frequency ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{profile.frequency || t.profile?.notSet || 'Not set'}</p>
                  )}
                  {validationErrors.frequency && (
                    <p className="text-sm text-red-600 mt-1">{validationErrors.frequency}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.profile?.workoutDuration || 'Workout duration'} ({t.profile?.units?.min || 'min'})
                  </label>
                  {isEditMode ? (
                    <input
                      type="number"
                      min="5"
                      max="300"
                      value={editedData.duration || ''}
                      onChange={(e) => setEditedData({ ...editedData, duration: parseInt(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500 ${
                        validationErrors.duration ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{profile.duration || t.profile?.notSet || 'Not set'} {t.profile?.units?.min || 'min'}</p>
                  )}
                  {validationErrors.duration && (
                    <p className="text-sm text-red-600 mt-1">{validationErrors.duration}</p>
                  )}
                </div>
              </div>

              {/* Constraints */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.profile?.constraints || 'Constraints'}
                </label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={editedData.constraints?.join(', ') || ''}
                    onChange={(e) => setEditedData({ 
                      ...editedData, 
                      constraints: e.target.value.split(',').map(s => s.trim()).filter(s => s.length > 0)
                    })}
                    placeholder="Enter constraints separated by commas"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  />
                ) : (
                  <p className="text-gray-900 py-2">
                    {profile.constraints && profile.constraints.length > 0 
                      ? profile.constraints.join(', ') 
                      : 'No constraints specified'
                    }
                  </p>
                )}
              </div>

              {/* Equipment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.profile?.equipment || 'Equipment'}
                </label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={editedData.equipment?.join(', ') || ''}
                    onChange={(e) => setEditedData({ 
                      ...editedData, 
                      equipment: e.target.value.split(',').map(s => s.trim()).filter(s => s.length > 0)
                    })}
                    placeholder="Enter equipment separated by commas"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  />
                ) : (
                  <p className="text-gray-900 py-2">
                    {profile.equipment && profile.equipment.length > 0 
                      ? profile.equipment.join(', ') 
                      : 'No equipment specified'
                    }
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-3 p-4 sm:p-6 border-t border-gray-200 bg-gray-50 pb-6 sm:pb-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors focus-visible-ring rounded-lg w-full sm:w-auto"
            >
              {t.profile?.close || 'Close'}
            </button>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              {!isEditMode ? (
                <button
                  onClick={() => setIsEditMode(true)}
                  className="btn-primary flex items-center justify-center space-x-1 focus-visible-ring w-full sm:w-auto"
                >
                  <Edit size={16} />
                  <span>{t.profile?.update || 'Update'}</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="btn-secondary flex items-center justify-center space-x-1 focus-visible-ring w-full sm:w-auto"
                  >
                    <X size={16} />
                    <span>{t.profile?.cancel || 'Cancel'}</span>
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="btn-primary flex items-center justify-center space-x-1 focus-visible-ring w-full sm:w-auto"
                  >
                    <Save size={16} />
                    <span>{isSaving ? (t.profile?.saving || 'Saving...') : (t.profile?.save || 'Save')}</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileDetailsModal