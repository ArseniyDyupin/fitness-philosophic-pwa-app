import React, { useState, useEffect } from 'react'
import { useOnboardingStore } from '../../stores/onboarding.store'
import OnboardingLayout from '../../components/OnboardingLayout'
import { useTranslations } from '../../stores/i18n.store'

const OnboardingFrequency: React.FC = () => {
  const { draft, updateDraft } = useOnboardingStore()
  const t = useTranslations()
  
  const [frequency, setFrequency] = useState(draft.frequency?.toString() || '3')
  const [duration, setDuration] = useState(draft.duration?.toString() || '45')

  useEffect(() => {
    updateDraft({
      frequency: parseInt(frequency),
      duration: parseInt(duration)
    })
  }, [frequency, duration, updateDraft])

  const canProceed = frequency && duration

  return (
    <OnboardingLayout
      stepNumber={4}
      stepTitle={t.onboarding?.frequency?.title || 'Workout Schedule'}
      stepDescription={t.onboarding?.frequency?.description || 'How often and how long do you want to work out?'}
      canProceed={!!canProceed}
    >
      <div className="space-y-8">
        {/* Frequency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            {t.onboarding?.frequency?.frequencyLabel || 'How many times per week do you want to work out?'}
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map(freq => (
              <button
                key={freq}
                onClick={() => setFrequency(freq.toString())}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  frequency === freq.toString()
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl font-bold">{freq}</div>
                <div className="text-sm text-gray-600">
                  {freq === 1 
                    ? t.onboarding?.frequency?.timePerWeek || 'time per week'
                    : t.onboarding?.frequency?.timesPerWeek || 'times per week'
                  }
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            {t.onboarding?.frequency?.durationLabel || 'How long should each workout session be?'}
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[30, 45, 60, 75, 90].map(dur => (
              <button
                key={dur}
                onClick={() => setDuration(dur.toString())}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  duration === dur.toString()
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl font-bold">{dur}</div>
                <div className="text-sm text-gray-600">
                  {t.onboarding?.frequency?.minutes || 'minutes'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            {t.onboarding?.frequency?.summary
              ?.replace('{{frequency}}', frequency)
              ?.replace('{{duration}}', duration) || 
              `You'll be working out ${frequency} times per week for ${duration} minutes per session. This is a great starting point that we can adjust as you progress!`
            }
          </p>
        </div>
      </div>
    </OnboardingLayout>
  )
}

export default OnboardingFrequency
