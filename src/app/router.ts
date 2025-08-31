import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import HomePage from '@/pages/HomePage.vue'
import SettingsPage from '@/pages/SettingsPage.vue'
import NotFound from '@/pages/NotFound.vue'
import OnboardingGoals from '@/features/onboarding/OnboardingGoals.vue'
import OnboardingConstraints from '@/features/onboarding/OnboardingConstraints.vue'
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

export default router
