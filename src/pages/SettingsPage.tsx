import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfileStore } from '../stores/profile.store'
import { useI18nStore } from '../stores/i18n.store'
import { useTranslations } from '../stores/i18n.store'
import JsonFileButtons from '../components/JsonFileButtons'
import AISettings from '../components/AISettings'

const SettingsPage: React.FC = () => {
  const navigate = useNavigate()
  const { profile, saveProfile } = useProfileStore()
  const { setLanguage } = useI18nStore()
  const t = useTranslations()
  
  if (!profile) {
    return <div>{t.settingsPage?.loading || 'Loading...'}</div>
  }

  const handleLanguageChange = async (language: 'en' | 'ru') => {
    try {
      await saveProfile({ language })
      setLanguage(language)
    } catch (error) {
      console.error('Failed to update language:', error)
      alert(t.settingsPage?.failedToUpdateLanguage || 'Failed to update language')
    }
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
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t.settingsPage?.language || 'Language'}</h2>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="language"
                  value="en"
                  checked={profile.language === 'en'}
                  onChange={() => handleLanguageChange('en')}
                  className="border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-3 text-gray-700">{t.english}</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="language"
                  value="ru"
                  checked={profile.language === 'ru'}
                  onChange={() => handleLanguageChange('ru')}
                  className="border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-3 text-gray-700">{t.russian}</span>
              </label>
            </div>
          </div>

          {/* Profile Information */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t.settingsPage?.profileInformation || 'Profile Information'}</h2>
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
                <p className="text-gray-900">{profile.gender}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.settingsPage?.goals || 'Goals'}</label>
                <p className="text-gray-900">{profile.goal || (t.settingsPage?.notSet || 'Not set')}</p>
              </div>
            </div>
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
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t.settingsPage?.goals || 'Goals'}</h2>
            <div className="space-y-2">
              <p className="text-gray-900">{profile.goal || (t.settingsPage?.noGoalsSet || 'No goals set')}</p>
            </div>
            {profile.goalsDetailed && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.settingsPage?.detailedGoals || 'Detailed Goals'}</label>
                <p className="text-gray-900">{profile.goalsDetailed}</p>
              </div>
            )}
          </div>

          {/* AI Configuration */}
          <div className="card">
            <AISettings />
          </div>

          {/* Export/Import */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t.settingsPage?.dataManagement || 'Data Management'}</h2>
            <JsonFileButtons />
          </div>
        </div>
      </main>
    </div>
  )
}

export default SettingsPage
