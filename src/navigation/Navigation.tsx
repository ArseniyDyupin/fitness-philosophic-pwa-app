import { useNavigationState } from './useNavigationState'
import { AppRouter, OnboardingRouter, LanguageSelectionRouter } from './AppRouter'
import { SkeletonCard } from '@/ui/atoms'

/**
 * Main navigation component that determines which router to render
 * based on the current application state
 */
export function Navigation() {
  const { state } = useNavigationState()

  // Show loading skeleton while determining navigation state
  if (state === 'loading') {
    return <SkeletonCard className="m-4" />
  }

  // Show language selection for first-time users or users without language
  if (state === 'language-selection') {
    return <LanguageSelectionRouter />
  }

  // Show onboarding for users with incomplete profiles
  if (state === 'onboarding') {
    return <OnboardingRouter />
  }

  // Show main application for users with complete profiles
  if (state === 'main-app') {
    return <AppRouter />
  }

  // Fallback to language selection
  return <LanguageSelectionRouter />
}
