import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useI18nStore } from '@stores/i18n.store'
import { useProfileStore } from '@stores/profile.store'
import { useOnboardingStore } from '@stores/onboarding.store'
import { useTranslations } from '@stores/i18n.store'

const LanguageSelectionPage: React.FC = () => {
  const navigate = useNavigate()
  const { setLanguage } = useI18nStore()
  const { profile } = useProfileStore()
  const { updateDraft } = useOnboardingStore()
  const t = useTranslations()
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'ru' | null>(null)

  const handleLanguageSelect = (language: 'en' | 'ru') => {
    setSelectedLanguage(language)
  }

  const handleContinue = () => {
    if (!selectedLanguage) return

    localStorage.setItem('ai-trainer:has-launched', 'true')
    updateDraft({ language: selectedLanguage })
    setLanguage(selectedLanguage)
    navigate(profile ? '/' : '/entry', { replace: true })
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
          
          <div className="space-y-4 mb-8">
            <button
              type="button"
              onClick={() => handleLanguageSelect('en')}
              aria-pressed={selectedLanguage === 'en'}
              className={`w-full py-3 px-4 border rounded-lg hover:bg-gray-50 transition-colors text-left ${
                selectedLanguage === 'en' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300'
              }`}
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
              type="button"
              onClick={() => handleLanguageSelect('ru')}
              aria-pressed={selectedLanguage === 'ru'}
              className={`w-full py-3 px-4 border rounded-lg hover:bg-gray-50 transition-colors text-left ${
                selectedLanguage === 'ru' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300'
              }`}
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

          {/* Continue Button */}
          <button
            type="button"
            onClick={handleContinue}
            disabled={!selectedLanguage}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              selectedLanguage
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {t.continue}
          </button>
        </div>
      </div>
    </div>
  )
}

export default LanguageSelectionPage
