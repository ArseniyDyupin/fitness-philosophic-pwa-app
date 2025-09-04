import { Routes, Route } from 'react-router-dom'
import { useProfileStore } from '../stores/profile.store'
import { useI18nStore } from '../stores/i18n.store'
import { useEffect } from 'react'

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

function App() {
  const { profile, loadProfile } = useProfileStore()
  const { initializeLanguage } = useI18nStore()

  useEffect(() => {
    initializeLanguage()
    loadProfile()
  }, [initializeLanguage, loadProfile])

  // If no profile exists, show language selection
  if (!profile) {
    return (
      <Routes>
        <Route path="*" element={<LanguageSelectionPage />} />
      </Routes>
    )
  }

  // If profile exists but no language, redirect to language selection
  if (!profile.language) {
    return (
      <Routes>
        <Route path="*" element={<LanguageSelectionPage />} />
      </Routes>
    )
  }

  // If profile exists but incomplete, show onboarding
  if (!profile.age || !profile.height || !profile.weight || !profile.goal) {
    return (
      <Routes>
        <Route path="/onboarding/goals" element={<OnboardingGoals />} />
        <Route path="/onboarding/constraints" element={<OnboardingConstraints />} />
        <Route path="/onboarding/detailed-goals" element={<OnboardingDetailedGoals />} />
        <Route path="/onboarding/equipment" element={<OnboardingEquipment />} />
        <Route path="/onboarding/metrics" element={<OnboardingMetrics />} />
        <Route path="/onboarding/frequency" element={<OnboardingFrequency />} />
        <Route path="/" element={<OnboardingGoals />} />
        <Route path="*" element={<OnboardingGoals />} />
      </Routes>
    )
  }

  // Main app routes
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/workouts" element={<WorkoutsPage />} />
      <Route path="/workouts/:id" element={<WorkoutDetailsPage />} />
      <Route path="/food" element={<FoodPage />} />
      <Route path="/weekly" element={<WeeklyPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
