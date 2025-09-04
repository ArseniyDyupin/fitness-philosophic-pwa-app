import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOnboardingStore } from '../stores/onboarding.store'
import { useTranslations } from '../stores/i18n.store'
import { ArrowLeft, ArrowRight, Save, Check } from 'lucide-react'
import ProfileSummary from './ProfileSummary'

interface OnboardingLayoutProps {
  children: React.ReactNode
  stepNumber: number
  stepTitle: string
  stepDescription?: string
  canProceed?: boolean
  onSave?: () => void
  showBackButton?: boolean
  showSaveButton?: boolean
}

const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  children,
  stepNumber,
  stepTitle,
  stepDescription,
  canProceed = true,
  onSave,
  showBackButton = true,
  showSaveButton = false
}) => {
  const navigate = useNavigate()
  const { currentStep, totalSteps, isStepValid, isDraftComplete, setCurrentStep } = useOnboardingStore()
  const t = useTranslations()

  useEffect(() => {
    setCurrentStep(stepNumber)
  }, [stepNumber])
  console.log(canProceed, currentStep, isStepValid(currentStep), '<<<< steper')

  const handleNext = () => {
    if (canProceed && isStepValid(currentStep)) {
      // Navigate to next step instead of just updating store
      const nextStepNumber = currentStep + 1
      if (nextStepNumber < totalSteps) {
        navigate(getStepRoute(nextStepNumber))
      }
    }
  }

  const handlePrevious = () => {
    const prevStepNumber = currentStep - 1
    if (prevStepNumber >= 0) {
      navigate(getStepRoute(prevStepNumber))
    }
  }

  const handleSave = () => {
    if (onSave) {
      onSave()
    }
  }

  const getStepRoute = (step: number) => {
    const routes = [
      '/onboarding/goals',
      '/onboarding/constraints',
      '/onboarding/equipment',
      '/onboarding/metrics',
      '/onboarding/frequency',
      '/onboarding/detailed-goals'
    ]
    return routes[step] || '/onboarding/goals'
  }

  const handleStepClick = (step: number) => {
    navigate(getStepRoute(step))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Step Title */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{stepTitle}</h1>
            {stepDescription && (
              <p className="text-lg text-gray-600">{stepDescription}</p>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                {t.onboarding?.progress?.stepOf?.replace('{{current}}', String(stepNumber + 1)).replace('{{total}}', String(totalSteps)) || `Step ${stepNumber + 1} of ${totalSteps}`}
              </span>
              <span className="text-sm text-gray-500">{Math.round(((stepNumber + 1) / totalSteps) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-primary-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${((stepNumber + 1) / totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Step Indicators */}
          <div className="flex justify-between">
            {Array.from({ length: totalSteps }, (_, index) => (
              <button
                key={index}
                onClick={() => handleStepClick(index)}
                className={`flex-1 mx-1 p-2 rounded-lg text-sm font-medium transition-colors ${
                  index === stepNumber
                    ? 'bg-primary-100 text-primary-700 border-2 border-primary-300'
                    : index < stepNumber
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  {index < stepNumber ? (
                    <Check size={16} />
                  ) : (
                    <span className="w-4 h-4 rounded-full border-2 border-current flex items-center justify-center text-xs">
                      {index + 1}
                    </span>
                  )}
                  <span className="hidden sm:inline">
                    {t.onboarding?.steps?.[index as keyof typeof t.onboarding.steps] || `Step ${index + 1}`}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Summary Sidebar */}
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          <div className="lg:col-span-2">
            {children}
          </div>
          
          <div className="lg:col-span-1 mt-8 lg:mt-0">
            <ProfileSummary />
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="mt-12 flex justify-between items-center">
          <div className="flex space-x-4">
            {showBackButton && (
              <button
                onClick={handlePrevious}
                disabled={stepNumber === 0}
                className={`btn-secondary flex items-center space-x-2 ${
                  stepNumber === 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <ArrowLeft size={20} />
                <span>{t.onboarding?.navigation?.back || 'Back'}</span>
              </button>
            )}
          </div>

          <div className="flex space-x-4">
            {showSaveButton && (
              <button
                onClick={handleSave}
                disabled={!isDraftComplete()}
                className={`btn-secondary flex items-center space-x-2 ${
                  !isDraftComplete() ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Save size={20} />
                <span>{t.onboarding?.navigation?.save || 'Save & Exit'}</span>
              </button>
            )}

            {stepNumber < totalSteps - 1 ? (
              <button
                onClick={handleNext}
                disabled={!canProceed || !isStepValid(stepNumber)}
                className={`btn-primary flex items-center space-x-2 ${
                  !canProceed || !isStepValid(stepNumber) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <span>{t.onboarding?.navigation?.next || 'Next'}</span>
                <ArrowRight size={20} />
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={!isDraftComplete()}
                className={`btn-primary flex items-center space-x-2 ${
                  !isDraftComplete() ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Check size={20} />
                <span>{t.onboarding?.navigation?.complete || 'Complete Setup'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OnboardingLayout
