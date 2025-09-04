import React, { useState, useEffect } from 'react'
import { useOnboardingStore } from '../../stores/onboarding.store'
import { useTranslations } from '../../stores/i18n.store'
import OnboardingLayout from '../../components/OnboardingLayout'

const OnboardingMetrics: React.FC = () => {
  const { draft, updateDraft } = useOnboardingStore()
  const t = useTranslations()
  
  const [gender, setGender] = useState<'male' | 'female' | 'other'>(draft.gender || 'male')
  const [age, setAge] = useState(draft.age?.toString() || '')
  const [height, setHeight] = useState(draft.height?.toString() || '')
  const [weight, setWeight] = useState(draft.weight?.toString() || '')

  const genderLabels = {
    male: t.onboarding?.metrics?.male || 'Male',
    female: t.onboarding?.metrics?.female || 'Female',
    other: t.onboarding?.metrics?.other || 'Other'
  }

  useEffect(() => {
    // Update draft when local state changes
    updateDraft({
      gender,
      age: age ? parseInt(age) : undefined,
      height: height ? parseInt(height) : undefined,
      weight: weight ? parseFloat(weight) : undefined
    })
  }, [gender, age, height, weight, updateDraft])

  const canProceed = age && height && weight

  return (
    <OnboardingLayout
      stepNumber={3}
      stepTitle={t.onboarding?.metrics?.title || 'Basic Information'}
      stepDescription={t.onboarding?.metrics?.description || 'Help us personalize your experience'}
      canProceed={!!canProceed}
    >
      <div className="space-y-6">
        {/* Gender Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            {t.onboarding?.metrics?.gender || 'Gender'}
          </label>
          <div className="space-y-3">
            {(['male', 'female', 'other'] as const).map(option => (
              <label key={option} className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value={option}
                  checked={gender === option}
                  onChange={(e) => setGender(e.target.value as 'male' | 'female' | 'other')}
                  className="border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-3 text-gray-700">{genderLabels[option]}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Age */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.onboarding?.metrics?.age || 'Age (years)'}
          </label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            placeholder={t.onboarding?.metrics?.agePlaceholder || 'e.g., 25'}
            min="13"
            max="100"
          />
        </div>

        {/* Height */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.onboarding?.metrics?.height || 'Height (cm)'}
          </label>
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            placeholder={t.onboarding?.metrics?.heightPlaceholder || 'e.g., 175'}
            min="100"
            max="250"
          />
        </div>

        {/* Weight */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.onboarding?.metrics?.weight || 'Weight (kg)'}
          </label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            placeholder={t.onboarding?.metrics?.weightPlaceholder || 'e.g., 70'}
            min="30"
            max="300"
            step="0.1"
          />
        </div>
      </div>
    </OnboardingLayout>
  )
}

export default OnboardingMetrics
