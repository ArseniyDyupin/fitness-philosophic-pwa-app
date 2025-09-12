import { Routes, Route } from 'react-router-dom'
import { useProfileStore } from '@stores/profile.store'
import { useI18nStore } from '@stores/i18n.store'
import { useEffect, useState, Suspense, lazy } from 'react'
import { Toaster } from 'react-hot-toast'
import Header from '@organisms/shared/Header'
import { ErrorBoundary, PageTransition, SkeletonCard } from '@/ui/atoms'

// Lazy load pages for better performance
const HomePage = lazy(() => import('@pages/HomePage'))
const WorkoutsPage = lazy(() => import('@pages/WorkoutsPage'))
const WorkoutDetailsPage = lazy(() => import('@pages/WorkoutDetailsPage'))
const FoodPage = lazy(() => import('@pages/FoodPage'))
const StatsPage = lazy(() => import('@pages/StatsPage'))
const SettingsPage = lazy(() => import('@pages/SettingsPage'))
const PlanRealizationPage = lazy(() => import('@pages/PlanRealizationPage'))
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

function App() {
  const { profile, loadProfile } = useProfileStore()
  const { initializeLanguage, setLanguageFromProfile } = useI18nStore()
  const [isFirstLaunch, setIsFirstLaunch] = useState(true)

  useEffect(() => {
    initializeLanguage()
    loadProfile()
    
    // Check if this is the first launch
    const hasLaunchedBefore = localStorage.getItem('ai-trainer:has-launched')
    if (hasLaunchedBefore) {
      setIsFirstLaunch(false)
    }
  }, [initializeLanguage, loadProfile])

  // Set language from profile after profile is loaded
  useEffect(() => {
    if (profile) {
      setLanguageFromProfile()
    }
  }, [profile, setLanguageFromProfile])


  // Always show language selection on first launch
  if (isFirstLaunch) {
    return (
      <Routes>
        <Route path="/" element={<LanguageSelectionPage />} />
        <Route path="*" element={<LanguageSelectionPage />} />
      </Routes>
    )
  }

  // If no profile exists, show language selection
  if (!profile) {
    return (
      <Routes>
        <Route path="/" element={<LanguageSelectionPage />} />
        <Route path="*" element={<LanguageSelectionPage />} />
      </Routes>
    )
  }

  // If profile exists but no language, redirect to language selection
  if (!profile.language) {
    return (
      <Routes>
        <Route path="/" element={<LanguageSelectionPage />} />
        <Route path="*" element={<LanguageSelectionPage />} />
      </Routes>
    )
  }

  // If profile exists but incomplete, show entry step
  if (!profile.name || !profile.age || !profile.height || !profile.weight || !profile.goal || profile.goal.trim().length === 0) {
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

  return (
    <ErrorBoundary>
      <Header />
      <PageTransition>
        <Suspense fallback={<SkeletonCard className="m-4" />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/workouts" element={<WorkoutsPage />} />
            <Route path="/workouts/:id" element={<WorkoutDetailsPage />} />
            <Route path="/plan/:planId" element={<PlanRealizationPage />} />
            <Route path="/food" element={<FoodPage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </PageTransition>
      <Toaster
        position="top-right"
        gutter={8}
        toastOptions={{
          duration: 3500,
          style: { 
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '500'
          }
        }}
      />
    </ErrorBoundary>
  )
}

export default App
