import React, { useState, useEffect } from 'react'
import { useOnboardingStore } from '@stores/onboarding.store'
import { useTranslations } from '@stores/i18n.store'
import OnboardingLayout from '@templates/OnboardingLayout'

const OnboardingEquipment: React.FC = () => {
  const { draft, updateDraft } = useOnboardingStore()
  const t = useTranslations()
  
  const [equipment, setEquipment] = useState(draft.equipment?.join(', ') || '')
  const [sportsPreferences, setSportsPreferences] = useState(draft.sportsPreferences || '')
  const [noEquipment, setNoEquipment] = useState(draft.equipment?.includes('none') || false)

  useEffect(() => {
    if (noEquipment) {
      updateDraft({ 
        equipment: ['none'],
        sportsPreferences: sportsPreferences || draft.sportsPreferences || ''
      })
    } else {
      const equipmentArray = equipment.trim() ? equipment.split(',').map(e => e.trim()).filter(e => e) : []
      updateDraft({ 
        equipment: equipmentArray,
        sportsPreferences: sportsPreferences || draft.sportsPreferences || ''
      })
    }
  }, [equipment, sportsPreferences, noEquipment, updateDraft, draft.sportsPreferences])

  const handleNoEquipmentChange = (checked: boolean) => {
    setNoEquipment(checked)
    if (checked) {
      setEquipment('')
    }
  }

  return (
    <OnboardingLayout
      stepNumber={2}
      stepTitle={t.onboarding?.equipment?.title || 'Доступное оборудование'}
      stepDescription={t.onboarding?.equipment?.description || 'Расскажите, какое спортивное оборудование у вас есть и какие виды спорта предпочитаете'}
      canProceed={true}
    >
      <div className="space-y-6">
        {/* Equipment Textarea */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            {t.onboarding?.equipment?.equipmentLabel || 'Опишите спортивное оборудование, которое у вас есть'}
          </label>
          
          <textarea
            value={equipment}
            onChange={(e) => setEquipment(e.target.value)}
            disabled={noEquipment}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:text-gray-500"
            placeholder={t.onboarding?.equipment?.equipmentPlaceholder || 'Например: гантели, скакалка, коврик для йоги, велотренажер, турник... Опишите все, что у вас есть.'}
          />
        </div>

        {/* Sports Preferences */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            {t.onboarding?.equipment?.sportsLabel || 'Какие виды спорта или физические активности вы предпочитаете?'}
          </label>
          
          <textarea
            value={sportsPreferences}
            onChange={(e) => setSportsPreferences(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            placeholder={t.onboarding?.equipment?.sportsPlaceholder || 'Например: бег, плавание, йога, силовые тренировки, танцы, велоспорт, баскетбол... Расскажите о том, что вам нравится.'}
          />
        </div>

        {/* No Equipment Checkbox */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="noEquipment"
            checked={noEquipment}
            onChange={(e) => handleNoEquipmentChange(e.target.checked)}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <label htmlFor="noEquipment" className="ml-3 text-gray-700">
            {t.onboarding?.equipment?.noEquipment || 'У меня нет спортивного оборудования'}
          </label>
        </div>

        {/* Conditional Messages */}
        {noEquipment && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              {t.onboarding?.equipment?.noEquipmentMessage || 'Не проблема! Мы сосредоточимся на упражнениях с собственным весом и минимальным оборудованием.'}
            </p>
          </div>
        )}

        {equipment && !noEquipment && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              {t.onboarding?.equipment?.equipmentMessage || 'Отлично! Мы создадим тренировки, которые максимально используют ваше доступное оборудование.'}
            </p>
          </div>
        )}

        {sportsPreferences && (
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-sm text-purple-800">
              {t.onboarding?.equipment?.sportsMessage || 'Спасибо за информацию о предпочтениях! Мы учтем это при составлении персональной программы тренировок.'}
            </p>
          </div>
        )}
      </div>
    </OnboardingLayout>
  )
}

export default OnboardingEquipment
