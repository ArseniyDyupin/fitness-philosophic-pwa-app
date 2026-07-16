import { useState, useEffect } from 'react'
import { useProfileStore } from '@stores/profile.store'
import { useI18nStore } from '@stores/i18n.store'
import type { Profile } from '@/types/models'

export type NavigationState = 'loading' | 'language-selection' | 'onboarding' | 'main-app'

export interface NavigationStateResult {
  state: NavigationState
  isFirstLaunch: boolean
  isProfileComplete: boolean
  isLanguageSet: boolean
}

interface ResolveNavigationStateInput {
  isLoading: boolean
  isFirstLaunch: boolean
  hasSelectedLanguage: boolean
  profile: Profile | null
}

export function resolveNavigationState({
  isLoading,
  isFirstLaunch,
  hasSelectedLanguage,
  profile
}: ResolveNavigationStateInput): NavigationState {
  if (isLoading) {
    return 'loading'
  }

  if (isFirstLaunch) {
    return 'language-selection'
  }

  if (!profile) {
    return hasSelectedLanguage
      ? 'onboarding'
      : 'language-selection'
  }

  if (!profile.language && !hasSelectedLanguage) {
    return 'language-selection'
  }

  if (
    !profile.name ||
    !profile.age ||
    !profile.height ||
    !profile.weight ||
    !profile.goal ||
    profile.goal.trim().length === 0
  ) {
    return 'onboarding'
  }

  return 'main-app'
}

/**
 * Hook to determine the current navigation state based on user profile and app state
 * @returns Navigation state and related flags
 */
export function useNavigationState(): NavigationStateResult {
  const { profile, loadProfile } = useProfileStore()
  const {
    hasSelectedLanguage,
    initializeLanguage,
    setLanguageFromProfile
  } = useI18nStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await Promise.all([
          initializeLanguage(),
          loadProfile()
        ])
      } catch (error) {
        console.error('Failed to initialize app:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeApp()
  }, [initializeLanguage, loadProfile])

  // Set language from profile after profile is loaded
  useEffect(() => {
    if (profile && !isLoading) {
      setLanguageFromProfile()
    }
  }, [profile, setLanguageFromProfile, isLoading])

  const isFirstLaunch = localStorage.getItem('ai-trainer:has-launched') !== 'true'
  const state = resolveNavigationState({
    isLoading,
    isFirstLaunch,
    hasSelectedLanguage,
    profile
  })
  const isProfileComplete = Boolean(
    profile?.name && 
    profile?.age && 
    profile?.height && 
    profile?.weight && 
    profile?.goal && 
    profile.goal.trim().length > 0
  )
  const isLanguageSet = Boolean(profile?.language || hasSelectedLanguage)

  return {
    state,
    isFirstLaunch,
    isProfileComplete,
    isLanguageSet
  }
}
