import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfileStore } from '../../stores/profile.store'
import { useTranslations } from '../../stores/i18n.store'

const OnboardingConstraints: React.FC = () => {
  const navigate = useNavigate()
  const { saveProfile } = useProfileStore()
  const t = useTranslations()
  
  const [constraints, setConstraints] = useState<string[]>([])

  const constraintOptions = [
    { value: 'knee_pain', label: 'Knee pain or injury' },
    { value: 'back_pain', label: 'Back pain or injury' },
    { value: 'shoulder_pain', label: 'Shoulder pain or injury' },
    { value: 'ankle_pain', label: 'Ankle pain or injury' },
    { value: 'heart_condition', label: 'Heart condition' },
    { value: 'diabetes', label: 'Diabetes' },
    { value: 'asthma', label: 'Astma' },
    { value: 'none', label: 'No specific constraints' }
  ]

  const handleConstraintToggle = (constraintValue: string) => {
    if (constraintValue === 'none') {
      setConstraints([])
    } else {
      setConstraints(prev => 
        prev.includes(constraintValue) 
          ? prev.filter(c => c !== constraintValue)
          : [...prev, constraintValue]
      )
    }
  }

  const handleNext = async () => {
    try {
      await saveProfile({ constraints })
      navigate('/onboarding/detailed-goals')
    } catch (error) {
      console.error('Failed to save constraints:', error)
      alert('Failed to save constraints')
    }
  }

  const handleBack = () => {
    navigate('/onboarding/goals')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Any physical constraints?
          </h1>
          <p className="text-gray-600">
            This helps us create safer workout plans
          </p>
        </div>

        <div className="space-y-6">
          {/* Constraints Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select all that apply
            </label>
            <div className="space-y-2">
              {constraintOptions.map(option => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={constraints.includes(option.value)}
                    onChange={() => handleConstraintToggle(option.value)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-3 text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
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

export default OnboardingConstraints
