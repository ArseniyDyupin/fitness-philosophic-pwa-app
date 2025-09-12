import React, { useState, useEffect } from 'react'
import { useOnboardingStore } from '@stores/onboarding.store'
import { useTranslations } from '@stores/i18n.store'
import OnboardingLayout from '@templates/OnboardingLayout'

const OnboardingGoals: React.FC = () => {
  const { draft, updateDraft } = useOnboardingStore()
  const t = useTranslations()
  
  const [name, setName] = useState(draft.name || '')
  const [goals, setGoals] = useState(draft.goal || '')
  const [description, setDescription] = useState(draft.goalsDetailed || '')

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
      stepTitle={t.onboarding?.goals?.title || 'Какие у вас фитнес-цели?'}
      stepDescription={t.onboarding?.goals?.description || 'Расскажите нам о ваших основных фитнес-целях'}
      canProceed={!!name && goals.trim().length > 0}
    >
      <div className="space-y-6">
        {/* Name Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.onboarding?.goals?.yourName || 'Ваше имя'}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            placeholder={t.onboarding?.goals?.namePlaceholder || 'Введите ваше имя'}
          />
        </div>

        {/* Goals Textarea */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            {t.onboarding?.goals?.selectGoals || 'Опишите ваши основные фитнес-цели'}
          </label>
          <textarea
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            placeholder={t.onboarding?.goals?.goalsPlaceholder || 'Например: хочу похудеть на 10 кг, набрать мышечную массу, улучшить выносливость, стать сильнее, чувствовать себя лучше... Опишите подробно, что вы хотите достичь.'}
          />
        </div>

        {/* Goal Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.onboarding?.goals?.additionalDetails || 'Дополнительные детали (Необязательно)'}
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            placeholder={t.onboarding?.goals?.descriptionPlaceholder || 'Расскажите нам больше о ваших конкретных целях...'}
          />
        </div>
      </div>
    </OnboardingLayout>
  )
}

export default OnboardingGoals
