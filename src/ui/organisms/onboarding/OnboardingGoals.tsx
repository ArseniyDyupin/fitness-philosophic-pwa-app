import React, { useState, useEffect } from 'react'
import { useOnboardingStore } from '@stores/onboarding.store'
import { useTranslations } from '@stores/i18n.store'
import OnboardingLayout from '@templates/OnboardingLayout'
import { isMeaningfulText } from '@/domain/profile/onboarding'

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
      canProceed={isMeaningfulText(name) && isMeaningfulText(goals)}
    >
      <div className="space-y-6">
        {/* Name Input */}
        <div>
          <label htmlFor="onboarding-name" className="block text-sm font-medium text-gray-700 mb-2">
            {t.onboarding?.goals?.yourName || 'Ваше имя'}
          </label>
          <input
            id="onboarding-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            placeholder={t.onboarding?.goals?.namePlaceholder || 'Введите ваше имя'}
            aria-invalid={name.length > 0 && !isMeaningfulText(name)}
          />
          {name.length > 0 && !isMeaningfulText(name) && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {t.onboarding?.goals?.nameRequired || 'Enter a name that is not only spaces'}
            </p>
          )}
        </div>

        {/* Goals Textarea */}
        <div>
          <label htmlFor="onboarding-goals" className="block text-sm font-medium text-gray-700 mb-3">
            {t.onboarding?.goals?.selectGoals || 'Опишите ваши основные фитнес-цели'}
          </label>
          <textarea
            id="onboarding-goals"
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            placeholder={t.onboarding?.goals?.goalsPlaceholder || 'Например: хочу похудеть на 10 кг, набрать мышечную массу, улучшить выносливость, стать сильнее, чувствовать себя лучше... Опишите подробно, что вы хотите достичь.'}
          />
        </div>

        {/* Goal Description */}
        <div>
          <label htmlFor="onboarding-details" className="block text-sm font-medium text-gray-700 mb-2">
            {t.onboarding?.goals?.additionalDetails || 'Дополнительные детали (Необязательно)'}
          </label>
          <textarea
            id="onboarding-details"
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
