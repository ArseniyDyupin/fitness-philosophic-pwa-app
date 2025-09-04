import React, { useState, useEffect } from 'react'
import { useOnboardingStore } from '../../stores/onboarding.store'
import OnboardingLayout from '../../components/OnboardingLayout'

const OnboardingConstraints: React.FC = () => {
  const { draft, updateDraft } = useOnboardingStore()
  
  const [constraints, setConstraints] = useState<string[]>(draft.constraints || [])

  const constraintOptions = [
    'back_pain',
    'knee_problems', 
    'shoulder_issues',
    'heart_conditions',
    'diabetes',
    'asthma',
    'pregnancy',
    'recent_surgery',
    'none'
  ]

  const constraintLabels: Record<string, string> = {
    back_pain: 'Back pain',
    knee_problems: 'Knee problems',
    shoulder_issues: 'Shoulder issues',
    heart_conditions: 'Heart conditions',
    diabetes: 'Diabetes',
    asthma: 'Asthma',
    pregnancy: 'Pregnancy',
    recent_surgery: 'Recent surgery',
    none: 'No constraints'
  }

  useEffect(() => {
    updateDraft({ constraints })
  }, [constraints, updateDraft])

  const handleConstraintToggle = (constraint: string) => {
    if (constraint === 'none') {
      setConstraints([])
    } else {
      setConstraints(prev => 
        prev.includes(constraint) 
          ? prev.filter(c => c !== constraint)
          : [...prev.filter(c => c !== 'none'), constraint]
      )
    }
  }

  return (
    <OnboardingLayout
      stepNumber={1}
      stepTitle="Physical Constraints"
      stepDescription="Let us know about any physical limitations or health conditions"
      canProceed={true}
    >
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Select any physical constraints or health conditions that apply to you
          </label>
          <div className="space-y-3">
            {constraintOptions.map(constraint => (
              <label key={constraint} className="flex items-center">
                <input
                  type="checkbox"
                  checked={constraints.includes(constraint)}
                  onChange={() => handleConstraintToggle(constraint)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-3 text-gray-700">{constraintLabels[constraint]}</span>
              </label>
            ))}
          </div>
        </div>

        {constraints.length > 0 && constraints.filter(c => c !== 'none').length > 0 && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              We'll tailor your workout recommendations to accommodate these constraints and ensure safe, effective training.
            </p>
          </div>
        )}
      </div>
    </OnboardingLayout>
  )
}

export default OnboardingConstraints
