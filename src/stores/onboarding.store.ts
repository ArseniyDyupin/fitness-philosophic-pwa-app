import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  isOnboardingDraftComplete,
  isOnboardingStepValid,
  type OnboardingDraft
} from '@/domain/profile/onboarding'

interface OnboardingState {
  currentStep: number
  totalSteps: number
  draft: Partial<OnboardingDraft>
  isComplete: boolean
  
  // Actions
  setCurrentStep: (step: number) => void
  updateDraft: (updates: Partial<OnboardingDraft>) => void
  clearDraft: () => void
  completeOnboarding: () => void
  resetOnboarding: () => void
  
  // Step navigation
  nextStep: () => void
  previousStep: () => void
  goToStep: (step: number) => void
  
  // Validation
  isStepValid: (step: number) => boolean
  isDraftComplete: () => boolean
}

const STORAGE_KEY = 'ai-trainer:onboarding-draft'

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      currentStep: 0,
      totalSteps: 6,
      draft: {},
      isComplete: false,

      setCurrentStep: (step: number) => {
        set({ currentStep: step })
      },

      updateDraft: (updates: Partial<OnboardingDraft>) => {
        set(state => ({
          draft: { ...state.draft, ...updates }
        }))
      },

      clearDraft: () => {
        set({ draft: {}, currentStep: 0, isComplete: false })
      },

      completeOnboarding: () => {
        set({ isComplete: true })
      },

      resetOnboarding: () => {
        set({ draft: {}, currentStep: 0, isComplete: false })
      },

      nextStep: () => {
        const { currentStep, totalSteps } = get()
        if (currentStep < totalSteps - 1) {
          set({ currentStep: currentStep + 1 })
        }
      },

      previousStep: () => {
        const { currentStep } = get()
        if (currentStep > 0) {
          set({ currentStep: currentStep - 1 })
        }
      },

      goToStep: (step: number) => {
        if (step >= 0 && step < get().totalSteps) {
          set({ currentStep: step })
        }
      },

      isStepValid: (step: number) => {
        return isOnboardingStepValid(get().draft, step)
      },

      isDraftComplete: () => {
        return isOnboardingDraftComplete(get().draft)
      }
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        draft: state.draft,
        currentStep: state.currentStep
      })
    }
  )
)
