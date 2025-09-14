import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOnboardingStore } from '@stores/onboarding.store'
import { useTranslations } from '@stores/i18n.store'
import { useProfileStore } from '@stores/profile.store'
import OnboardingLayout from '@templates/OnboardingLayout'

const OnboardingDetailedGoals: React.FC = () => {
  const { draft, updateDraft, clearDraft } = useOnboardingStore()
  const { createProfile } = useProfileStore()
  const navigate = useNavigate()
  const t = useTranslations()
  
  const [goalsDetailed, setGoalsDetailed] = useState(draft.goalsDetailed || '')

  useEffect(() => {
    updateDraft({ goalsDetailed })
  }, [goalsDetailed, updateDraft])

  const handleCompleteOnboarding = async () => {
    try {
      // Create profile from draft data
      await createProfile({
        name: draft.name || '',
        age: draft.age || 0,
        gender: draft.gender || 'male',
        height: draft.height || 0,
        weight: draft.weight || 0,
        goal: draft.goal || '',
        constraints: draft.constraints || [],
        equipment: draft.equipment || [],
        frequency: draft.frequency || 3,
        duration: draft.duration || 45,
        goalsDetailed: draft.goalsDetailed || '',
        language: draft.language || 'en'
      })

      // Clear onboarding draft
      clearDraft()
      
      // Redirect to home
      navigate('/')
    } catch (error) {
      console.error('Failed to complete onboarding:', error)
      alert(t.error || 'Failed to complete onboarding')
    }
  }

  return (
    <OnboardingLayout
      stepNumber={5}
      stepTitle={t.onboarding?.detailedGoals?.title || 'Detailed Goals'}
      stepDescription={t.onboarding?.detailedGoals?.description || 'Tell us more about your specific fitness journey'}
      canProceed={true}
      showSaveButton={true}
      onSave={handleCompleteOnboarding}
    >
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            {t.onboarding?.detailedGoals?.additionalDetails || 'Additional Details (Optional)'}
          </label>
          <p className="text-sm text-gray-600 mb-4">
            {t.onboarding?.detailedGoals?.descriptionText || 'Share any specific goals, events, or motivations that will help us personalize your experience'}
          </p>
          <textarea
            value={goalsDetailed}
            onChange={(e) => setGoalsDetailed(e.target.value)}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            placeholder={t.onboarding?.detailedGoals?.placeholder || 'For example: I want to run a 5K in 3 months, I\'m training for a hiking trip, I want to feel more confident in my body, I\'m preparing for a wedding...'}
          />
        </div>

        {/* Examples */}
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">
            {t.onboarding?.detailedGoals?.examplesTitle || 'Examples of what to include:'}
          </h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• {t.onboarding?.detailedGoals?.example1 || 'Target weight or body composition goals'}</li>
            <li>• {t.onboarding?.detailedGoals?.example2 || 'Specific events you\'re training for'}</li>
            <li>• {t.onboarding?.detailedGoals?.example3 || 'Performance milestones you want to achieve'}</li>
            <li>• {t.onboarding?.detailedGoals?.example4 || 'How you want to feel or look'}</li>
            <li>• {t.onboarding?.detailedGoals?.example5 || 'Any specific challenges you\'re facing'}</li>
          </ul>
        </div>

        {goalsDetailed && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>{t.onboarding?.detailedGoals?.great || 'Great!'}</strong> {t.onboarding?.detailedGoals?.successMessage || 'We\'ll use this information to create more personalized workout recommendations and track your progress toward these specific goals.'}
            </p>
          </div>
        )}
      </div>
    </OnboardingLayout>
  )
}

export default OnboardingDetailedGoals
