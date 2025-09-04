import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfileStore } from '../../stores/profile.store'
import { useTranslations } from '../../stores/i18n.store'

const OnboardingMetrics: React.FC = () => {
  const navigate = useNavigate()
  const { saveProfile } = useProfileStore()
  const t = useTranslations()
  
  const [sex, setSex] = useState<'male' | 'female' | 'other'>('male')
  const [age, setAge] = useState('')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')

  const handleNext = async () => {
    if (!age || !height || !weight) {
      alert('Please fill in all fields')
      return
    }

    try {
      await saveProfile({
        sex,
        age: parseInt(age),
        height: parseInt(height),
        weight: parseFloat(weight)
      })
      navigate('/onboarding/frequency')
    } catch (error) {
      console.error('Failed to save metrics:', error)
      alert('Failed to save metrics')
    }
  }

  const handleBack = () => {
    navigate('/onboarding/equipment')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Basic Information
          </h1>
          <p className="text-gray-600">
            Help us personalize your experience
          </p>
        </div>

        <div className="space-y-6">
          {/* Sex Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Sex
            </label>
            <div className="space-y-2">
              {[
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
                { value: 'other', label: 'Other' }
              ].map(option => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="radio"
                    name="sex"
                    value={option.value}
                    checked={sex === option.value}
                    onChange={(e) => setSex(e.target.value as 'male' | 'female' | 'other')}
                    className="border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-3 text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Age */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Age (years)
            </label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              placeholder="e.g., 25"
              min="13"
              max="100"
            />
          </div>

          {/* Height */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Height (cm)
            </label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              placeholder="e.g., 175"
              min="100"
              max="250"
            />
          </div>

          {/* Weight */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Weight (kg)
            </label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              placeholder="e.g., 70"
              min="30"
              max="300"
              step="0.1"
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
              disabled={!age || !height || !weight}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t.next}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OnboardingMetrics
