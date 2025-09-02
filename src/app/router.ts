import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import HomePage from '@/pages/HomePage.vue'
import SettingsPage from '@/pages/SettingsPage.vue'
import NotFound from '@/pages/NotFound.vue'
import OnboardingSelectionPage from '@/pages/OnboardingSelectionPage.vue'
import LanguageSelectionPage from '@/pages/LanguageSelectionPage.vue'
import OnboardingGoals from '@/features/onboarding/OnboardingGoals.vue'
import OnboardingConstraints from '@/features/onboarding/OnboardingConstraints.vue'
import OnboardingDetailedGoals from '@/features/onboarding/OnboardingDetailedGoals.vue'
import OnboardingEquipment from '@/features/onboarding/OnboardingEquipment.vue'
import OnboardingMetrics from '@/features/onboarding/OnboardingMetrics.vue'
import OnboardingFrequency from '@/features/onboarding/OnboardingFrequency.vue'
import WorkoutsPage from '@/features/workout/WorkoutsPage.vue'
import WorkoutDetailsPage from '@/features/workout/WorkoutDetailsPage.vue'
import FoodPage from '@/features/food/FoodPage.vue'
import WeeklyPage from '@/features/week/WeeklyPage.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: HomePage
  },
  {
    path: '/onboarding',
    name: 'onboarding-selection',
    component: OnboardingSelectionPage
  },
  {
    path: '/language-selection',
    name: 'language-selection',
    component: LanguageSelectionPage
  },
  {
    path: '/onboarding/goals',
    name: 'onboarding-goals',
    component: OnboardingGoals
  },
  {
    path: '/onboarding/constraints',
    name: 'onboarding-constraints',
    component: OnboardingConstraints
  },
  {
    path: '/onboarding/detailed-goals',
    name: 'onboarding-detailed-goals',
    component: OnboardingDetailedGoals
  },
  {
    path: '/onboarding/equipment',
    name: 'onboarding-equipment',
    component: OnboardingEquipment
  },
  {
    path: '/onboarding/metrics',
    name: 'onboarding-metrics',
    component: OnboardingMetrics
  },
  {
    path: '/onboarding/frequency',
    name: 'onboarding-frequency',
    component: OnboardingFrequency
  },
  {
    path: '/workouts',
    name: 'workouts',
    component: WorkoutsPage
  },
  {
    path: '/workouts/:id',
    name: 'workout-details',
    component: WorkoutDetailsPage,
    props: true
  },
  {
    path: '/food',
    name: 'food',
    component: FoodPage
  },
  {
    path: '/week',
    name: 'week',
    component: WeeklyPage
  },
  {
    path: '/settings',
    name: 'settings',
    component: SettingsPage
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFound
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard to check language and profile
router.beforeEach(async (to, from, next) => {
  // Skip guard for language selection and onboarding routes
  if (to.path === '/language-selection' || to.path.startsWith('/onboarding')) {
    return next()
  }

  // Skip guard for settings page
  if (to.path === '/settings') {
    return next()
  }

  // If coming from onboarding, give some time for profile to be saved
  if (from.path.startsWith('/onboarding') && to.path === '/') {
    // Wait a bit to ensure profile is saved
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Double-check that profile was actually created
    try {
      const { dbHelpers } = await import('@/services/db')
      const profile = await dbHelpers.getProfile()
      if (!profile) {
        // If profile still doesn't exist, redirect back to onboarding
        return next('/onboarding')
      }
    } catch (error) {
      console.error('Error checking profile after onboarding:', error)
      return next('/onboarding')
    }
  }

  try {
    // First, check if user has selected a language
    const selectedLanguage = localStorage.getItem('selectedLanguage')
    
    if (!selectedLanguage) {
      // If no language selected, redirect to language selection
      return next('/language-selection')
    }

    // Then check if profile exists
    const { dbHelpers } = await import('@/services/db')
    const profile = await dbHelpers.getProfile()
    
    if (!profile) {
      // If no profile exists, redirect to onboarding
      return next('/onboarding')
    }
    
    // Profile exists, allow navigation
    next()
  } catch (error) {
    console.error('Navigation guard error:', error)
    // In case of error, allow navigation but show error
    next()
  }
})

export default router
