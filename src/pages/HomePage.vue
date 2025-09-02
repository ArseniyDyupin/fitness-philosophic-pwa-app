<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <h1 class="text-2xl font-bold text-gray-900">{{ t.home }}</h1>
          <router-link 
            to="/settings" 
            class="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
          </router-link>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Daily Summary Card -->
      <div class="card mb-8">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">{{ t.todaysSummary }}</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-primary-600">{{ todayCalories }} kcal</div>
            <div class="text-sm text-gray-600">{{ t.burned }}</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600">{{ todayFoodCalories }} kcal</div>
            <div class="text-sm text-gray-600">{{ t.consumed }}</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold" :class="balanceClass">{{ dailyBalance }} kcal</div>
            <div class="text-sm text-gray-600">{{ t.balance }}</div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <router-link 
          to="/workouts" 
          class="card hover:shadow-md transition-shadow cursor-pointer group"
        >
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-medium text-gray-900">{{ t.addWorkout }}</h3>
              <p class="text-sm text-gray-600">{{ t.trackExercise }}</p>
            </div>
          </div>
        </router-link>

        <router-link 
          to="/food" 
          class="card hover:shadow-md transition-shadow cursor-pointer group"
        >
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"></path>
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-medium text-gray-900">{{ t.logFood }}</h3>
              <p class="text-sm text-gray-600">{{ t.trackNutrition }}</p>
            </div>
          </div>
        </router-link>

        <router-link 
          to="/week" 
          class="card hover:shadow-md transition-shadow cursor-pointer group"
        >
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-medium text-gray-900">{{ t.weeklyView }}</h3>
              <p class="text-sm text-gray-600">{{ t.checkProgress }}</p>
            </div>
          </div>
        </router-link>
      </div>

      <!-- Next AI Plan -->
      <div v-if="latestPlan" class="card">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">{{ t.nextWorkoutPlan }}</h2>
        <PlanCard :plan="latestPlan" />
      </div>

      <!-- Recent Workouts -->
      <div v-if="recentWorkouts.length > 0" class="card mt-8">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">{{ t.recentWorkouts }}</h2>
        <div class="space-y-3">
          <div 
            v-for="workout in recentWorkouts.slice(0, 3)" 
            :key="workout.id"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div class="flex items-center">
              <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span class="text-xs font-medium text-primary-600">{{ workout.type.charAt(0).toUpperCase() }}</span>
              </div>
              <div class="ml-3">
                <div class="text-sm font-medium text-gray-900">{{ formatWorkoutType(workout.type) }}</div>
                <div class="text-xs text-gray-500">{{ formatDate(workout.date) }}</div>
              </div>

            </div>
            <div class="text-sm font-medium text-gray-900">{{ workout.calories }} kcal</div>
          </div>
        </div>
        <router-link 
          to="/workouts" 
          class="mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          {{ t.viewAllWorkouts }} →
        </router-link>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useWorkoutsStore } from '@/stores/workouts.store'
import { useFoodStore } from '@/stores/food.store'
import { useAIStore } from '@/stores/ai.store'
import { useProfileStore } from '@/stores/profile.store'
import { format } from 'date-fns'
import PlanCard from '@/components/PlanCard.vue'
import { useRouter } from 'vue-router'
import { useI18nStore } from '@/stores/i18n.store'

const workoutsStore = useWorkoutsStore()
const foodStore = useFoodStore()
const aiStore = useAIStore()
const profileStore = useProfileStore()
const router = useRouter()
const i18nStore = useI18nStore()

const { t } = i18nStore

// Computed properties
const todayCalories = computed(() => workoutsStore.todayCalories)
const todayFoodCalories = computed(() => foodStore.todayCalories)
const dailyBalance = computed(() => foodStore.calculateDailyBalance(todayCalories.value))
const balanceClass = computed(() => {
  if (dailyBalance.value > 0) return 'text-red-600'
  if (dailyBalance.value < 0) return 'text-green-600'
  return 'text-gray-600'
})

const recentWorkouts = computed(() => workoutsStore.recentWorkouts)
const latestPlan = computed(() => aiStore.latestPlan)

// Methods
function formatWorkoutType(type: string): string {
  const types: Record<string, string> = {
    run: t.run,
    pullups: t.pullups,
    pushups: t.pushups,
    plank: t.plank,
    custom: t.custom
  }
  return types[type] || type
}

function formatDate(date: Date): string {
  return format(new Date(date), 'MMM d, yyyy')
}

// Lifecycle
onMounted(async () => {
  // First, check if user has selected a language
  const selectedLanguage = localStorage.getItem('selectedLanguage')
  if (!selectedLanguage) {
    router.push('/language-selection')
    return
  }

  // Initialize i18n store with selected language
  i18nStore.initializeLanguage()
  
  // Load profile
  await profileStore.loadProfile()
  
  // Check if profile exists, if not redirect to onboarding
  if (!profileStore.hasCompletedOnboarding) {
    router.push('/onboarding')
    return
  }
  
  await Promise.all([
    workoutsStore.loadWorkouts(),
    foodStore.loadFoodLogs(),
    aiStore.loadAIPlans()
  ])
})
</script>

