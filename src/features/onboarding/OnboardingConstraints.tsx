import React, { useState, useEffect } from 'react'
import { useOnboardingStore } from '../../stores/onboarding.store'
import { useTranslations } from '../../stores/i18n.store'
import OnboardingLayout from '../../components/OnboardingLayout'

const OnboardingConstraints: React.FC = () => {
  const { draft, updateDraft } = useOnboardingStore()
  const t = useTranslations()
  
  const [constraints, setConstraints] = useState(draft.constraints?.join(', ') || '')
  const [noProblems, setNoProblems] = useState(draft.constraints?.includes('none') || false)

  useEffect(() => {
    if (noProblems) {
      updateDraft({ constraints: ['none'] })
    } else {
      const constraintsArray = constraints.trim() ? constraints.split(',').map(c => c.trim()).filter(c => c) : []
      updateDraft({ constraints: constraintsArray })
    }
  }, [constraints, noProblems, updateDraft])

  const handleNoProblemsChange = (checked: boolean) => {
    setNoProblems(checked)
    if (checked) {
      setConstraints('')
    }
  }

  return (
    <OnboardingLayout
      stepNumber={1}
      stepTitle={t.onboarding?.constraints?.title || 'Физические ограничения'}
      stepDescription={t.onboarding?.constraints?.description || 'Расскажите о своих физических ограничениях или проблемах со здоровьем'}
      canProceed={true}
    >
      <div className="space-y-6">
        {/* Equipment Textarea */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            {t.onboarding?.constraints?.label || 'Опишите любые физические ограничения или проблемы со здоровьем, которые у вас есть'}
          </label>
          
          <textarea
            value={constraints}
            onChange={(e) => setConstraints(e.target.value)}
            disabled={noProblems}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:text-gray-500"
            placeholder={t.onboarding?.constraints?.placeholder || 'Например: боль в спине, проблемы с коленями, диабет, астма... Опишите подробно, чтобы мы могли учесть это при составлении тренировок.'}
          />
        </div>

        {/* No Problems Checkbox */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="noProblems"
            checked={noProblems}
            onChange={(e) => handleNoProblemsChange(e.target.checked)}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <label htmlFor="noProblems" className="ml-3 text-gray-700">
            {t.onboarding?.constraints?.noProblems || 'У меня нет проблем со здоровьем или физических ограничений'}
          </label>
        </div>

        {/* Conditional Messages */}
        {noProblems && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              {t.onboarding?.constraints?.noProblemsMessage || 'Отлично! Это означает, что у вас больше возможностей для различных типов тренировок.'}
            </p>
          </div>
        )}

        {constraints && !noProblems && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              {t.onboarding?.constraints?.constraintsMessage || 'Спасибо за информацию! Мы учтем эти ограничения при составлении персональной программы тренировок.'}
            </p>
          </div>
        )}
      </div>
    </OnboardingLayout>
  )
}

export default OnboardingConstraints
