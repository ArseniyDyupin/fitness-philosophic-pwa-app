import React from 'react'
import { useOnboardingStore } from '../stores/onboarding.store'
import { useTranslations } from '../stores/i18n.store'
import { User, Target, Activity, Settings, Trash2 } from 'lucide-react'

const ProfileSummary: React.FC = () => {
  const { draft, clearDraft } = useOnboardingStore()
  const t = useTranslations()

  if (!draft || Object.keys(draft).length === 0) {
    return null
  }

  const getProgressPercentage = () => {
    const requiredFields = ['name', 'age', 'height', 'weight', 'gender', 'goal', 'frequency', 'duration', 'language']
    const completedFields = requiredFields.filter(field => {
      if (field === 'goal') return draft.goal && draft.goal.trim().length > 0
      return draft[field as keyof typeof draft] !== undefined && draft[field as keyof typeof draft] !== ''
    })
    return Math.round((completedFields.length / requiredFields.length) * 100)
  }

  const formatValue = (key: string, value: any) => {
    if (value === undefined || value === '') return 'Not set'
    
    switch (key) {
      case 'height':
        return `${value} cm`
      case 'weight':
        return `${value} kg`
      case 'frequency':
        return `${value} times per week`
      case 'duration':
        return `${value} minutes`
      case 'goal':
        return draft.goal || 'Не указано'
      case 'constraints':
        if (draft.constraints?.includes('none')) {
          return 'Проблем нет'
        }
        return draft.constraints?.length ? draft.constraints.join(', ') : 'None'
      case 'equipment':
        return draft.equipment?.length ? draft.equipment.join(', ') : 'None'
      default:
        return String(value)
    }
  }

  const progressPercentage = getProgressPercentage()

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-3 mb-2">
            <User size={24} className="text-primary-600" />
            <span>{t.onboarding?.summary?.title || 'Profile Summary'}</span>
          </h3>
          <p className="text-sm text-gray-600">
            {t.onboarding?.summary?.subtitle || 'Live preview of your profile data'}
          </p>
        </div>
        
        <button
          onClick={clearDraft}
          className="text-red-600 hover:text-red-800 transition-colors p-2"
          title={t.onboarding?.summary?.clearDraft || 'Clear draft'}
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium text-gray-700">
            {t.onboarding?.progress?.stepOf?.replace('{{current}}', String(progressPercentage)).replace('{{total}}', '100') || `${progressPercentage}% Complete`}
          </span>
          <span className="text-sm text-gray-500">{progressPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-primary-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Profile Data Grid */}
      <div className="space-y-6">
        {/* Basic Info */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 flex items-center space-x-2 text-lg">
            <User size={18} className="text-gray-500" />
            <span>{t.onboarding?.summary?.basicInfo || 'Basic Info'}</span>
          </h4>
          <div className="space-y-2 text-sm pl-6">
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-600 font-medium">Name:</span> 
              <span className="text-gray-900">{formatValue('name', draft.name)}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-600 font-medium">Age:</span> 
              <span className="text-gray-900">{formatValue('age', draft.age)}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-600 font-medium">Gender:</span> 
              <span className="text-gray-900">{formatValue('gender', draft.gender)}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-600 font-medium">Height:</span> 
              <span className="text-gray-900">{formatValue('height', draft.height)}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-600 font-medium">Weight:</span> 
              <span className="text-gray-900">{formatValue('weight', draft.weight)}</span>
            </div>
          </div>
        </div>

        {/* Goals & Fitness */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 flex items-center space-x-2 text-lg">
            <Target size={18} className="text-gray-500" />
            <span>{t.onboarding?.summary?.goals || 'Goals & Fitness'}</span>
          </h4>
          <div className="space-y-2 text-sm pl-6">
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-600 font-medium">Goals:</span> 
              <span className="text-gray-900">{formatValue('goal', draft.goal)}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-600 font-medium">Frequency:</span> 
              <span className="text-gray-900">{formatValue('frequency', draft.frequency)}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-600 font-medium">Duration:</span> 
              <span className="text-gray-900">{formatValue('duration', draft.duration)}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-600 font-medium">Language:</span> 
              <span className="text-gray-900">{formatValue('language', draft.language)}</span>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 flex items-center space-x-2 text-lg">
            <Settings size={18} className="text-gray-500" />
            <span>{t.onboarding?.summary?.preferences || 'Preferences'}</span>
          </h4>
          <div className="space-y-2 text-sm pl-6">
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-600 font-medium">Constraints:</span> 
              <span className="text-gray-900">{formatValue('constraints', draft.constraints)}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-600 font-medium">Equipment:</span> 
              <span className="text-gray-900">{formatValue('equipment', draft.equipment)}</span>
            </div>
            {draft.sportsPreferences && (
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-600 font-medium">Sports Preferences:</span> 
                <span className="text-gray-900">{draft.sportsPreferences}</span>
              </div>
            )}
            {draft.goalsDetailed && (
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-600 font-medium">Details:</span> 
                <span className="text-gray-900">{draft.goalsDetailed}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Completion Status */}
      {progressPercentage === 100 && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-3 text-green-800">
            <Activity size={18} />
            <span className="font-medium">
              {t.onboarding?.summary?.complete || 'Profile setup complete! You can now save and continue.'}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfileSummary
