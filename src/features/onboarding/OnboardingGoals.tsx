import React, { useState, useEffect } from 'react'
import { useOnboardingStore } from '../../stores/onboarding.store'
import { useTranslations } from '../../stores/i18n.store'
import OnboardingLayout from '../../components/OnboardingLayout'
import type { Goal } from '../../types/models'

type GoalType = 'weight_loss' | 'muscle_gain' | 'endurance' | 'strength' | 'general_fitness'

const OnboardingGoals: React.FC = () => {
  const { draft, updateDraft } = useOnboardingStore()
  const t = useTranslations()
  
  const [name, setName] = useState(draft.name || '')
  const [goals, setGoals] = useState<Goal>(draft.goal || { types: [], description: '' })
  const [description, setDescription] = useState(draft.goalsDetailed || '')

  const goalLabels: Record<GoalType, string> = {
    weight_loss: t.onboarding?.goals?.weightLoss || 'Weight Loss',
    muscle_gain: t.onboarding?.goals?.muscleGain || 'Muscle Gain',
    endurance: t.onboarding?.goals?.endurance || 'Endurance',
    strength: t.onboarding?.goals?.strength || 'Strength',
    general_fitness: t.onboarding?.goals?.generalFitness || 'General Fitness'
  }

  useEffect(() => {
    // Update draft when local state changes
    updateDraft({
      name,
      goal: goals,
      goalsDetailed: description
    })
  }, [name, goals, description, updateDraft])

  return (
    <OnboardingLayout
      stepNumber={0}
      stepTitle={t.onboarding?.goals?.title || 'What are your fitness goals?'}
      stepDescription={t.onboarding?.goals?.description || 'Tell us about your primary fitness objectives'}
      canProceed={!!name && goals.types.length > 0}
    >
      <div className="space-y-6">
        {/* Name Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.onboarding?.goals?.yourName || 'Your Name'}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            placeholder={t.onboarding?.goals?.namePlaceholder || 'Enter your name'}
          />
        </div>

        {/* Goal Types */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            {t.onboarding?.goals?.selectGoals || 'Select your primary fitness goals'}
          </label>
          <div className="space-y-2">
            {(['weight_loss', 'muscle_gain', 'endurance', 'strength', 'general_fitness'] as GoalType[]).map((goalType) => (
              <label key={goalType} className="flex items-center">
                <input
                  type="checkbox"
                  checked={goals.types.includes(goalType)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setGoals(prev => ({ ...prev, types: [...prev.types, goalType] }))
                    } else {
                      setGoals(prev => ({ ...prev, types: prev.types.filter(t => t !== goalType) }))
                    }
                  }}
                  className="mr-3 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-gray-700 capitalize">
                  {goalLabels[goalType]}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Goal Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.onboarding?.goals?.additionalDetails || 'Additional Details (Optional)'}
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            placeholder={t.onboarding?.goals?.descriptionPlaceholder || 'Tell us more about your specific goals...'}
          />
        </div>
      </div>
    </OnboardingLayout>
  )
}

export default OnboardingGoals
