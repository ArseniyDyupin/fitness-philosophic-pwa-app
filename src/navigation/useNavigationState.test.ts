import { describe, expect, it } from 'vitest'
import { resolveNavigationState } from './useNavigationState'
import type { Profile } from '@/types/models'

function createProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: 'me',
    name: 'Alex',
    age: 30,
    gender: 'male',
    height: 180,
    weight: 80,
    goal: 'Improve endurance',
    constraints: [],
    equipment: [],
    frequency: 3,
    duration: 45,
    language: 'en',
    goalsDetailed: '',
    createdAt: '2026-07-16T12:00:00.000Z',
    updatedAt: '2026-07-16T12:00:00.000Z',
    ...overrides
  }
}

describe('resolveNavigationState', () => {
  it('moves to onboarding after language selection even before a profile exists', () => {
    expect(resolveNavigationState({
      isLoading: false,
      isFirstLaunch: false,
      hasSelectedLanguage: true,
      profile: null
    })).toBe('onboarding')
  })

  it('keeps a first-time user on language selection until the CTA completes', () => {
    expect(resolveNavigationState({
      isLoading: false,
      isFirstLaunch: true,
      hasSelectedLanguage: false,
      profile: null
    })).toBe('language-selection')
  })

  it('routes incomplete and complete profiles to the correct application state', () => {
    expect(resolveNavigationState({
      isLoading: false,
      isFirstLaunch: false,
      hasSelectedLanguage: true,
      profile: createProfile({ goal: '' })
    })).toBe('onboarding')

    expect(resolveNavigationState({
      isLoading: false,
      isFirstLaunch: false,
      hasSelectedLanguage: true,
      profile: createProfile()
    })).toBe('main-app')
  })

  it('does not wait for profile persistence after a language was selected', () => {
    expect(resolveNavigationState({
      isLoading: false,
      isFirstLaunch: false,
      hasSelectedLanguage: true,
      profile: createProfile({ language: '' as Profile['language'] })
    })).toBe('main-app')
  })
})
