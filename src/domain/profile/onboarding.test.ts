import { describe, expect, it } from 'vitest'
import {
  isMeaningfulText,
  isOnboardingDraftComplete,
  isOnboardingStepValid,
  isValidAge,
  isValidHeight,
  isValidWeight
} from './onboarding'

describe('onboarding validation', () => {
  it('rejects whitespace-only names and goals', () => {
    expect(isMeaningfulText('   ')).toBe(false)
    expect(isOnboardingStepValid({ name: '   ', goal: 'Run faster' }, 0)).toBe(false)
    expect(isOnboardingStepValid({ name: 'Alex', goal: '   ' }, 0)).toBe(false)
  })

  it('enforces documented metric boundaries', () => {
    expect(isValidAge(12)).toBe(false)
    expect(isValidAge(13)).toBe(true)
    expect(isValidHeight(99)).toBe(false)
    expect(isValidHeight(250)).toBe(true)
    expect(isValidWeight(-20)).toBe(false)
    expect(isValidWeight(300)).toBe(true)
  })

  it('requires valid goals, metrics, and frequency for completion', () => {
    expect(isOnboardingDraftComplete({
      name: 'Alex',
      goal: 'Improve endurance',
      gender: 'male',
      age: 30,
      height: 180,
      weight: 80,
      frequency: 3,
      duration: 45
    })).toBe(true)

    expect(isOnboardingDraftComplete({
      name: 'Alex',
      goal: 'Improve endurance',
      gender: 'male',
      age: -5,
      height: 180,
      weight: 80,
      frequency: 3,
      duration: 45
    })).toBe(false)
  })
})
