import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Goal } from '../types/models'

interface OnboardingDraft {
  name: string
  age: number
  gender: 'male' | 'female' | 'other'
  height: number
  weight: number
  goal: Goal
  constraints: string[]
  equipment: string[]
  sportsPreferences: string
  frequency: number
  duration: number
  language: 'en' | 'ru'
  goalsDetailed: string
}

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
        set({ currentStep: 0, isComplete: false })
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
        const { draft } = get()
        
        switch (step) {
          case 0: // Goals
            return !!(draft.name && draft.goal && draft.goal.trim().length > 0)
          case 1: // Constraints
            return true // Optional step
          case 2: // Equipment
            return true // Optional step
          case 3: // Metrics
            return !!(draft.age && draft.height && draft.weight && draft.gender)
          case 4: // Frequency
            return !!(draft.frequency && draft.duration)
          case 5: // Detailed Goals
            return true // Optional step
          default:
            return false
        }
      },

      isDraftComplete: () => {
        const { draft } = get()
        return !!(
          draft.name &&
          draft.age &&
          draft.height &&
          draft.weight &&
          draft.gender &&
          draft.goal &&
          draft.goal.trim().length > 0 &&
          draft.frequency &&
          draft.duration &&
          draft.language
        )
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
