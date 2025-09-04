import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfileStore } from '../stores/profile.store'
import { useI18nStore } from '../stores/i18n.store'
import { useTranslations } from '../stores/i18n.store'
import JsonFileButtons from '../components/JsonFileButtons'

const SettingsPage: React.FC = () => {
  const navigate = useNavigate()
  const { profile, saveProfile } = useProfileStore()
  const { setLanguage } = useI18nStore()
  const t = useTranslations()
  
  if (!profile) {
    return <div>Loading...</div>
  }

  const handleLanguageChange = async (language: 'en' | 'ru') => {
    try {
      await saveProfile({ language })
      setLanguage(language)
    } catch (error) {
      console.error('Failed to update language:', error)
      alert('Failed to update language')
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
              ← Back
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
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Language</h2>
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
                <span className="ml-3 text-gray-700">English</span>
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
                <span className="ml-3 text-gray-700">Русский</span>
              </label>
            </div>
          </div>

          {/* Profile Information */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <p className="text-gray-900">{profile.name || 'Not set'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <p className="text-gray-900">{profile.age} years</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
                <p className="text-gray-900">{profile.height} cm</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
                <p className="text-gray-900">{profile.weight} kg</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <p className="text-gray-900">{profile.gender}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Goals</label>
                <p className="text-gray-900">{profile.goal?.types?.join(', ') || 'Not set'}</p>
              </div>
            </div>
          </div>

          {/* Onboarding Reset */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Onboarding</h2>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Reset the onboarding process to start over with language selection and profile setup.
              </p>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to reset onboarding? This will clear your profile and start over.')) {
                    localStorage.removeItem('ai-trainer:has-launched')
                    localStorage.removeItem('ai-trainer:onboarding-draft')
                    window.location.reload()
                  }
                }}
                className="btn-secondary text-red-600 border-red-300 hover:bg-red-50"
              >
                Reset Onboarding
              </button>
            </div>
          </div>

          {/* Goals */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Goals</h2>
            <div className="space-y-2">
              {profile.goal.types.map(type => (
                <span key={type} className="inline-block bg-primary-100 text-primary-800 px-2 py-1 rounded text-sm mr-2 mb-2">
                  {type}
                </span>
              ))}
            </div>
            {profile.goalsDetailed && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Goals</label>
                <p className="text-gray-900">{profile.goalsDetailed}</p>
              </div>
            )}
          </div>

          {/* Export/Import */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Data Management</h2>
            <JsonFileButtons />
          </div>
        </div>
      </main>
    </div>
  )
}

export default SettingsPage
