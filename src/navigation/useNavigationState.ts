import { useState, useEffect } from 'react'
import { useProfileStore } from '@stores/profile.store'
import { useI18nStore } from '@stores/i18n.store'

export type NavigationState = 'loading' | 'language-selection' | 'onboarding' | 'main-app'

export interface NavigationStateResult {
  state: NavigationState
  isFirstLaunch: boolean
  isProfileComplete: boolean
  isLanguageSet: boolean
}

/**
 * Hook to determine the current navigation state based on user profile and app state
 * @returns Navigation state and related flags
 */
export function useNavigationState(): NavigationStateResult {
  const { profile, loadProfile } = useProfileStore()
  const { initializeLanguage, setLanguageFromProfile } = useI18nStore()
  const [isFirstLaunch, setIsFirstLaunch] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await Promise.all([
          initializeLanguage(),
          loadProfile()
        ])
        
        // Check if this is the first launch
        const hasLaunchedBefore = localStorage.getItem('ai-trainer:has-launched')
        if (hasLaunchedBefore) {
          setIsFirstLaunch(false)
        } else {
          // Mark as launched for future visits
          localStorage.setItem('ai-trainer:has-launched', 'true')
        }
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

  // Determine navigation state
  const getNavigationState = (): NavigationState => {
    if (isLoading) {
      return 'loading'
    }

    // First launch - always show language selection
    if (isFirstLaunch) {
      return 'language-selection'
    }

    // No profile exists - show language selection
    if (!profile) {
      return 'language-selection'
    }

    // Profile exists but no language - show language selection
    if (!profile.language) {
      return 'language-selection'
    }

    // Profile exists but incomplete - show onboarding
    if (!profile.name || !profile.age || !profile.height || !profile.weight || !profile.goal || profile.goal.trim().length === 0) {
      return 'onboarding'
    }

    // Profile is complete - show main app
    return 'main-app'
  }

  const state = getNavigationState()
  const isProfileComplete = Boolean(
    profile?.name && 
    profile?.age && 
    profile?.height && 
    profile?.weight && 
    profile?.goal && 
    profile.goal.trim().length > 0
  )
  const isLanguageSet = Boolean(profile?.language)

  return {
    state,
    isFirstLaunch,
    isProfileComplete,
    isLanguageSet
  }
}
