import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfileStore } from '../../stores/profile.store'
import { useI18nStore } from '../../stores/i18n.store'
import { useTranslations } from '../../stores/i18n.store'

const OnboardingFrequency: React.FC = () => {
  const navigate = useNavigate()
  const { saveProfile } = useProfileStore()
  const { setLanguageFromProfile, currentLanguage } = useI18nStore()
  const t = useTranslations()
  
  const [frequency, setFrequency] = useState(3)
  const [duration, setDuration] = useState(30)

  const handleComplete = async () => {
    try {
      // Update profile with final settings
      await saveProfile({
        frequency,
        duration,
        language: currentLanguage
      })

      // Set language from profile
      setLanguageFromProfile()

      // Redirect to home page
      setTimeout(() => {
        navigate('/')
      }, 500)
    } catch (error) {
      console.error('Failed to complete onboarding:', error)
      alert('Failed to complete onboarding')
    }
  }

  const handleBack = () => {
    navigate('/onboarding/metrics')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Almost there!
          </h1>
          <p className="text-gray-600">
            Set your workout preferences
          </p>
        </div>

        <div className="space-y-6">
          {/* Workout Frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              How many workouts per week?
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6].map(num => (
                <button
                  key={num}
                  onClick={() => setFrequency(num)}
                  className={`py-2 px-3 rounded-lg border transition-colors ${
                    frequency === num
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Workout Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              How long per workout? (minutes)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[15, 30, 45, 60, 75, 90].map(num => (
                <button
                  key={num}
                  onClick={() => setDuration(num)}
                  className={`py-2 px-3 rounded-lg border transition-colors ${
                    duration === num
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Your Plan</h3>
            <p className="text-gray-600">
              {frequency} workout{frequency !== 1 ? 's' : ''} per week, {duration} minutes each
            </p>
          </div>

          {/* Navigation */}
          <div className="flex justify-between space-x-4 pt-4">
            <button
              onClick={handleBack}
              className="btn-secondary"
            >
              {t.previous}
            </button>
            <button
              onClick={handleComplete}
              className="btn-primary"
            >
              Complete Setup
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OnboardingFrequency
