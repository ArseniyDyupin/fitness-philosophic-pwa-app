import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useI18nStore } from '../stores/i18n.store'
import { useProfileStore } from '../stores/profile.store'
import { useTranslations } from '../stores/i18n.store'

const LanguageSelectionPage: React.FC = () => {
  const navigate = useNavigate()
  const { setLanguage } = useI18nStore()
  const { createProfile } = useProfileStore()
  const t = useTranslations()

  const handleLanguageSelect = async (language: 'en' | 'ru') => {
    try {
      // Set language in i18n store
      setLanguage(language)
      
      // Create basic profile with selected language
      await createProfile({
        sex: 'male', // Will be updated in later steps
        age: 0, // Will be updated in later steps
        height: 0, // Will be updated in later steps
        weight: 0, // Will be updated in later steps
        goal: {
          types: [],
          description: ''
        },
        constraints: [],
        equipment: [],
        frequency: 3,
        duration: 30,
        language: language,
        goalsDetailed: ''
      })
      
      // Navigate to first onboarding step
      navigate('/onboarding/goals')
    } catch (error) {
      console.error('Failed to create profile:', error)
      alert('Failed to create profile')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t.aiTrainer}
          </h1>
          <p className="text-gray-600 mb-8">
            {t.selectLanguageDescription}
          </p>
          
          <div className="space-y-4">
            <button
              onClick={() => handleLanguageSelect('en')}
              className="w-full py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🇺🇸</span>
                <div>
                  <div className="font-medium text-gray-900">{t.english}</div>
                  <div className="text-sm text-gray-500">English</div>
                </div>
              </div>
            </button>
            
            <button
              onClick={() => handleLanguageSelect('ru')}
              className="w-full py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🇷🇺</span>
                <div>
                  <div className="font-medium text-gray-900">{t.russian}</div>
                  <div className="text-sm text-gray-500">Русский</div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LanguageSelectionPage
