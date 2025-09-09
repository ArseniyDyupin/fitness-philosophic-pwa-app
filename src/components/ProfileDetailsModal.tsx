import React, { useState, useEffect } from 'react'
import { useProfileStore } from '../stores/profile.store'
import { useI18nStore } from '../stores/i18n.store'
import { useTranslations } from '../stores/i18n.store'
import { X, Edit, Save } from 'lucide-react'

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
  const [editedData, setEditedData] = useState<any>({})
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
      errors.name = (t.profile as any)?.nameRequired || 'Name is required'
    }
    if (editedData.age < 10 || editedData.age > 100) {
      errors.age = (t.profile as any)?.ageRange || 'Age must be between 10 and 100'
    }
    if (editedData.height < 100 || editedData.height > 250) {
      errors.height = (t.profile as any)?.heightRange || 'Height must be between 100 and 250 cm'
    }
    if (editedData.weight < 30 || editedData.weight > 300) {
      errors.weight = (t.profile as any)?.weightRange || 'Weight must be between 30 and 300 kg'
    }
    if (editedData.frequency < 1 || editedData.frequency > 14) {
      errors.frequency = (t.profile as any)?.frequencyRange || 'Frequency must be between 1 and 14'
    }
    if (editedData.duration < 5 || editedData.duration > 300) {
      errors.duration = (t.profile as any)?.durationRange || 'Duration must be between 5 and 300 minutes'
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
        setLanguage(editedData.language)
      }
      
      setIsEditMode(false)
      showToast((t.profile as any)?.updateSuccess || 'Profile updated successfully', 'success')
    } catch (error) {
      console.error('Failed to save profile:', error)
      showToast((t.profile as any)?.updateError || 'Failed to save profile', 'error')
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

  const showToast = (message: string, type: 'success' | 'error') => {
    // Simple toast implementation
    const toast = document.createElement('div')
    toast.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
      type === 'success' 
        ? 'bg-green-100 border border-green-200 text-green-800' 
        : 'bg-red-100 border border-red-200 text-red-800'
    }`
    toast.textContent = message
    document.body.appendChild(toast)
    setTimeout(() => {
      document.body.removeChild(toast)
    }, 3000)
  }

  if (!isOpen || !profile) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {(t.profile as any)?.title || 'Profile Details'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
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
            {(t.profile as any)?.general || 'General'}
          </button>
          <button
            onClick={() => setActiveTab('goals')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'goals'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {(t.profile as any)?.goalsPreferences || 'Goals & Preferences'}
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {(t.profile as any)?.name || 'Name'}
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
                    <p className="text-gray-900 py-2">{profile.name || (t.profile as any)?.notSet || 'Not set'}</p>
                  )}
                  {validationErrors.name && (
                    <p className="text-sm text-red-600 mt-1">{validationErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {(t.profile as any)?.age || 'Age'}
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
                    <p className="text-gray-900 py-2">{profile.age} {(t.profile as any)?.years || 'years'}</p>
                  )}
                  {validationErrors.age && (
                    <p className="text-sm text-red-600 mt-1">{validationErrors.age}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {(t.profile as any)?.gender || 'Gender'}
                  </label>
                  {isEditMode ? (
                    <select
                      value={editedData.gender || ''}
                      onChange={(e) => setEditedData({ ...editedData, gender: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="male">{(t.profile as any)?.male || 'Male'}</option>
                      <option value="female">{(t.profile as any)?.female || 'Female'}</option>
                      <option value="other">{(t.profile as any)?.other || 'Other'}</option>
                    </select>
                  ) : (
                    <p className="text-gray-900 py-2 capitalize">{profile.gender}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {(t.profile as any)?.height || 'Height'} ({(t.profile as any)?.units?.cm || 'cm'})
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
                    <p className="text-gray-900 py-2">{profile.height} {(t.profile as any)?.units?.cm || 'cm'}</p>
                  )}
                  {validationErrors.height && (
                    <p className="text-sm text-red-600 mt-1">{validationErrors.height}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {(t.profile as any)?.weight || 'Weight'} ({(t.profile as any)?.units?.kg || 'kg'})
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
                    <p className="text-gray-900 py-2">{profile.weight} {(t.profile as any)?.units?.kg || 'kg'}</p>
                  )}
                  {validationErrors.weight && (
                    <p className="text-sm text-red-600 mt-1">{validationErrors.weight}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {(t.profile as any)?.language || 'Language'}
                  </label>
                  {isEditMode ? (
                    <select
                      value={editedData.language || ''}
                      onChange={(e) => setEditedData({ ...editedData, language: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="en">{(t.profile as any)?.english || 'English'}</option>
                      <option value="ru">{(t.profile as any)?.russian || 'Русский'}</option>
                    </select>
                  ) : (
                    <p className="text-gray-900 py-2">{profile.language === 'en' ? ((t.profile as any)?.english || 'English') : ((t.profile as any)?.russian || 'Русский')}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'goals' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {(t.profile as any)?.goalDescription || 'Goal Description'}
                </label>
                {isEditMode ? (
                  <textarea
                    value={editedData.goal || ''}
                    onChange={(e) => setEditedData({ ...editedData, goal: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    placeholder={(t.profile as any)?.goalPlaceholder || 'Describe your main fitness goal...'}
                  />
                ) : (
                  <p className="text-gray-900 py-2">{profile.goal || (t.profile as any)?.notSet || 'Not set'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {(t.profile as any)?.detailedGoals || 'Detailed Goals'}
                </label>
                {isEditMode ? (
                  <textarea
                    value={editedData.goalsDetailed || ''}
                    onChange={(e) => setEditedData({ ...editedData, goalsDetailed: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    placeholder={(t.profile as any)?.detailedGoalsPlaceholder || 'Add more details about your fitness goals...'}
                  />
                ) : (
                  <p className="text-gray-900 py-2">{profile.goalsDetailed || (t.profile as any)?.notSet || 'Not set'}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {(t.profile as any)?.workoutsPerWeek || 'Workouts per week'}
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
                    <p className="text-gray-900 py-2">{profile.frequency || (t.profile as any)?.notSet || 'Not set'}</p>
                  )}
                  {validationErrors.frequency && (
                    <p className="text-sm text-red-600 mt-1">{validationErrors.frequency}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {(t.profile as any)?.workoutDuration || 'Workout duration'} ({(t.profile as any)?.units?.min || 'min'})
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
                    <p className="text-gray-900 py-2">{profile.duration || (t.profile as any)?.notSet || 'Not set'} {(t.profile as any)?.units?.min || 'min'}</p>
                  )}
                  {validationErrors.duration && (
                    <p className="text-sm text-red-600 mt-1">{validationErrors.duration}</p>
                  )}
                </div>
              </div>

              {/* Constraints and Equipment - display only for now */}
              {profile.constraints && profile.constraints.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {(t.profile as any)?.constraints || 'Constraints'}
                  </label>
                  <p className="text-gray-900 py-2">{profile.constraints.join(', ')}</p>
                </div>
              )}

              {profile.equipment && profile.equipment.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {(t.profile as any)?.equipment || 'Equipment'}
                  </label>
                  <p className="text-gray-900 py-2">{profile.equipment.join(', ')}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            {(t.profile as any)?.close || 'Close'}
          </button>
          
          <div className="flex space-x-2">
            {!isEditMode ? (
              <button
                onClick={() => setIsEditMode(true)}
                className="btn-primary flex items-center space-x-1"
              >
                <Edit size={16} />
                <span>{(t.profile as any)?.update || 'Update'}</span>
              </button>
            ) : (
              <>
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="btn-secondary flex items-center space-x-1"
                >
                  <X size={16} />
                  <span>{(t.profile as any)?.cancel || 'Cancel'}</span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="btn-primary flex items-center space-x-1"
                >
                  <Save size={16} />
                  <span>{isSaving ? ((t.profile as any)?.saving || 'Saving...') : ((t.profile as any)?.save || 'Save')}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileDetailsModal