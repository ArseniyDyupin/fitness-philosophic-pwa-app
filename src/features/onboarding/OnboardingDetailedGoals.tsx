import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfileStore } from '../../stores/profile.store'
import { useTranslations } from '../../stores/i18n.store'

const OnboardingDetailedGoals: React.FC = () => {
  const navigate = useNavigate()
  const { saveProfile } = useProfileStore()
  const t = useTranslations()
  
  const [goalsDetailed, setGoalsDetailed] = useState('')

  const handleNext = async () => {
    try {
      await saveProfile({ goalsDetailed })
      navigate('/onboarding/equipment')
    } catch (error) {
      console.error('Failed to save detailed goals:', error)
      alert('Failed to save detailed goals')
    }
  }

  const handleBack = () => {
    navigate('/onboarding/constraints')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tell us more about your goals
          </h1>
          <p className="text-gray-600">
            This helps AI provide better recommendations
          </p>
        </div>

        <div className="space-y-6">
          {/* Detailed Goals */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Describe your fitness journey in detail
            </label>
            <textarea
              value={goalsDetailed}
              onChange={(e) => setGoalsDetailed(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              placeholder="e.g., I want to lose 10kg in 6 months, improve my running endurance, and build some muscle. I have a busy schedule but can work out 3-4 times per week..."
            />
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
              onClick={handleNext}
              className="btn-primary"
            >
              {t.next}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OnboardingDetailedGoals
