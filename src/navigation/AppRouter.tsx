import { Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { ErrorBoundary, PageTransition, SkeletonCard } from '@/ui/atoms'

// Lazy load pages for better performance
const HomePage = lazy(() => import('@pages/HomePage'))
const WorkoutsPage = lazy(() => import('@pages/WorkoutsPage'))
const WorkoutDetailsPage = lazy(() => import('@pages/WorkoutDetailsPage'))
const FoodPage = lazy(() => import('@pages/FoodPage'))
const StatsPage = lazy(() => import('@pages/StatsPage'))
const SettingsPage = lazy(() => import('@pages/SettingsPage'))
const PlanRealizationPage = lazy(() => import('@pages/PlanRealizationPage'))
const WeeklyReviewPage = lazy(() => import('@pages/WeeklyReviewPage'))
const NotFound = lazy(() => import('@pages/NotFound'))

// Onboarding pages (keep synchronous for better UX)
import LanguageSelectionPage from '@pages/LanguageSelectionPage'
import OnboardingGoals from '@organisms/onboarding/OnboardingGoals'
import OnboardingConstraints from '@organisms/onboarding/OnboardingConstraints'
import OnboardingDetailedGoals from '@organisms/onboarding/OnboardingDetailedGoals'
import OnboardingEquipment from '@organisms/onboarding/OnboardingEquipment'
import OnboardingMetrics from '@organisms/onboarding/OnboardingMetrics'
import OnboardingFrequency from '@organisms/onboarding/OnboardingFrequency'
import EntryStep from '@pages/EntryStep'
import { FEATURES } from '@/config/features'

/**
 * Main application router with lazy loading and error boundaries
 */
export function AppRouter() {
  return (
    <ErrorBoundary>
      <PageTransition>
        <Suspense fallback={<SkeletonCard className="m-4" />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/workouts" element={<WorkoutsPage />} />
            <Route path="/workouts/:id" element={<WorkoutDetailsPage />} />
            <Route path="/plan/:planId" element={<PlanRealizationPage />} />
            {FEATURES.foodTracking && <Route path="/food" element={<FoodPage />} />}
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/weekly-review" element={<WeeklyReviewPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </PageTransition>
    </ErrorBoundary>
  )
}

/**
 * Onboarding router for new users
 */
export function OnboardingRouter() {
  return (
    <Routes>
      <Route path="/" element={<EntryStep />} />
      <Route path="/entry" element={<EntryStep />} />
      <Route path="/onboarding/goals" element={<OnboardingGoals />} />
      <Route path="/onboarding/constraints" element={<OnboardingConstraints />} />
      <Route path="/onboarding/detailed-goals" element={<OnboardingDetailedGoals />} />
      <Route path="/onboarding/equipment" element={<OnboardingEquipment />} />
      <Route path="/onboarding/metrics" element={<OnboardingMetrics />} />
      <Route path="/onboarding/frequency" element={<OnboardingFrequency />} />
      <Route path="*" element={<EntryStep />} />
    </Routes>
  )
}

/**
 * Language selection router for first-time users
 */
export function LanguageSelectionRouter() {
  return (
    <Routes>
      <Route path="/" element={<LanguageSelectionPage />} />
      <Route path="*" element={<LanguageSelectionPage />} />
    </Routes>
  )
}
