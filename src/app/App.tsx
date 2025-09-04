import { Routes, Route } from 'react-router-dom'
import { useProfileStore } from '../stores/profile.store'
import { useI18nStore } from '../stores/i18n.store'
import { useEffect, useState } from 'react'
import Header from '../components/Header'

// Pages
import HomePage from '../pages/HomePage'
import WorkoutsPage from '../features/workout/WorkoutsPage'
import WorkoutDetailsPage from '../features/workout/WorkoutDetailsPage'
import FoodPage from '../features/food/FoodPage'
import WeeklyPage from '../features/week/WeeklyPage'
import SettingsPage from '../pages/SettingsPage'
import NotFound from '../pages/NotFound'

// Onboarding
import LanguageSelectionPage from '../pages/LanguageSelectionPage'
import OnboardingGoals from '../features/onboarding/OnboardingGoals'
import OnboardingConstraints from '../features/onboarding/OnboardingConstraints'
import OnboardingDetailedGoals from '../features/onboarding/OnboardingDetailedGoals'
import OnboardingEquipment from '../features/onboarding/OnboardingEquipment'
import OnboardingMetrics from '../features/onboarding/OnboardingMetrics'
import OnboardingFrequency from '../features/onboarding/OnboardingFrequency'
import EntryStep from '../pages/EntryStep'

function App() {
  const { profile, loadProfile } = useProfileStore()
  const { initializeLanguage } = useI18nStore()
  const [isFirstLaunch, setIsFirstLaunch] = useState(true)

  useEffect(() => {
    initializeLanguage()
    loadProfile()
    
    // Check if this is the first launch
    const hasLaunchedBefore = localStorage.getItem('ai-trainer:has-launched')
    console.log('App useEffect - hasLaunchedBefore:', hasLaunchedBefore)
    if (hasLaunchedBefore) {
      setIsFirstLaunch(false)
    }
  }, [initializeLanguage, loadProfile])

  // Debug logging
  console.log('App render - isFirstLaunch:', isFirstLaunch, 'profile:', profile)

  // Always show language selection on first launch
  if (isFirstLaunch) {
    console.log('App: Showing LanguageSelectionPage (first launch)')
    return (
      <Routes>
        <Route path="/" element={<LanguageSelectionPage />} />
        <Route path="*" element={<LanguageSelectionPage />} />
      </Routes>
    )
  }

  // If no profile exists, show language selection
  if (!profile) {
    console.log('App: Showing LanguageSelectionPage (no profile)')
    return (
      <Routes>
        <Route path="/" element={<LanguageSelectionPage />} />
        <Route path="*" element={<LanguageSelectionPage />} />
      </Routes>
    )
  }

  // If profile exists but no language, redirect to language selection
  if (!profile.language) {
    console.log('App: Showing LanguageSelectionPage (no language)')
    return (
      <Routes>
        <Route path="/" element={<LanguageSelectionPage />} />
        <Route path="*" element={<LanguageSelectionPage />} />
      </Routes>
    )
  }

  // If profile exists but incomplete, show entry step
  if (!profile.name || !profile.age || !profile.height || !profile.weight || !profile.goal || !profile.goal.types || profile.goal.types.length === 0) {
    console.log('App: Showing EntryStep/Onboarding (incomplete profile)')
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

  // Main app routes
  console.log('App: Showing main app routes (complete profile)')
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/workouts" element={<WorkoutsPage />} />
        <Route path="/workouts/:id" element={<WorkoutDetailsPage />} />
        <Route path="/food" element={<FoodPage />} />
        <Route path="/weekly" element={<WeeklyPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

export default App
