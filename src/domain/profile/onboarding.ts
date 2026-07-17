export interface OnboardingDraft {
  name: string
  age: number
  gender: 'male' | 'female' | 'other'
  height: number
  weight: number
  goal: string
  constraints: string[]
  equipment: string[]
  sportsPreferences: string
  frequency: number
  duration: number
  language: 'en' | 'ru'
  goalsDetailed: string
}

export const ONBOARDING_LIMITS = {
  age: { min: 13, max: 100 },
  height: { min: 100, max: 250 },
  weight: { min: 30, max: 300 }
} as const

export function isMeaningfulText(value: string | undefined): boolean {
  return Boolean(value?.trim())
}

function isNumberInRange(
  value: number | undefined,
  range: { readonly min: number; readonly max: number }
): boolean {
  return Number.isFinite(value) && value! >= range.min && value! <= range.max
}

export const isValidAge = (value: number | undefined): boolean =>
  isNumberInRange(value, ONBOARDING_LIMITS.age)

export const isValidHeight = (value: number | undefined): boolean =>
  isNumberInRange(value, ONBOARDING_LIMITS.height)

export const isValidWeight = (value: number | undefined): boolean =>
  isNumberInRange(value, ONBOARDING_LIMITS.weight)

export function isOnboardingStepValid(
  draft: Partial<OnboardingDraft>,
  step: number
): boolean {
  switch (step) {
    case 0:
      return isMeaningfulText(draft.name) && isMeaningfulText(draft.goal)
    case 1:
    case 2:
    case 5:
      return true
    case 3:
      return Boolean(
        draft.gender &&
        isValidAge(draft.age) &&
        isValidHeight(draft.height) &&
        isValidWeight(draft.weight)
      )
    case 4:
      return Boolean(
        draft.frequency && draft.frequency > 0 &&
        draft.duration && draft.duration > 0
      )
    default:
      return false
  }
}

export function isOnboardingDraftComplete(draft: Partial<OnboardingDraft>): boolean {
  return [0, 3, 4].every(step => isOnboardingStepValid(draft, step))
}
