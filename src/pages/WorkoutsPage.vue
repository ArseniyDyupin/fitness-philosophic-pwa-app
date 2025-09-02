<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <h1 class="text-2xl font-bold text-gray-900">{{ t.workouts }}</h1>
          <router-link 
            to="/workouts/add" 
            class="btn-primary"
          >
            {{ t.addWorkout }}
          </router-link>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-8">
        <div class="text-gray-500">{{ t.loading }}</div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-8">
        <div class="text-red-500">{{ t.error }}: {{ error }}</div>
      </div>

      <!-- Empty State -->
      <div v-else-if="workouts.length === 0" class="text-center py-8">
        <div class="text-gray-500 mb-4">{{ t.noWorkoutsFound }}</div>
        <router-link 
          to="/workouts/add" 
          class="btn-primary"
        >
          {{ t.addFirstWorkout }}
        </router-link>
      </div>

      <!-- Workouts List -->
      <div v-else class="space-y-4">
        <div 
          v-for="workout in workouts" 
          :key="workout.id"
          class="card hover:shadow-md transition-shadow cursor-pointer"
          @click="viewWorkout(workout.id)"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <div>
                <div class="font-medium text-gray-900">{{ getWorkoutTypeLabel(workout.exercises[0]?.type || 'custom') }}</div>
                <div class="text-sm text-gray-500">{{ formatDate(workout.date) }}</div>
                <div v-if="workout.exercises.length > 1" class="text-xs text-gray-400">
                  +{{ workout.exercises.length - 1 }} {{ workout.exercises.length === 2 ? t.exercise : t.exercises }}
                </div>
              </div>
            </div>
            <div class="text-right">
              <div class="font-medium text-gray-900">{{ getTotalCalories(workout) }} {{ t.calories }}</div>
              <div class="text-sm text-gray-500">{{ getTotalDuration(workout) }} {{ t.duration }}</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useWorkoutsStore } from '@/stores/workouts.store'
import { useI18nStore } from '@/stores/i18n.store'
import { format } from 'date-fns'

const router = useRouter()
const workoutsStore = useWorkoutsStore()
const i18nStore = useI18nStore()

const { t } = i18nStore

// Computed properties
const workouts = computed(() => workoutsStore.workouts)
const isLoading = computed(() => workoutsStore.isLoading)
const error = computed(() => workoutsStore.error)

// Methods
function viewWorkout(id: string) {
  router.push(`/workouts/${id}`)
}

function formatDate(date: Date) {
  return format(date, 'MMM d, yyyy')
}

function getWorkoutTypeLabel(type: string) {
  const typeMap: Record<string, string> = {
    run: t.run,
    pullups: t.pullups,
    pushups: t.pushups,
    plank: t.plank,
    custom: t.custom
  }
  return typeMap[type] || type
}

function getTotalCalories(workout: any) {
  return workout.exercises.reduce((total: number, exercise: any) => {
    return total + (exercise.kcalEstimated || 0)
  }, 0)
}

function getTotalDuration(workout: any) {
  return workout.exercises.reduce((total: number, exercise: any) => {
    return total + (exercise.details.durationMin || 0)
  }, 0)
}

// Load data on mount
onMounted(async () => {
  await workoutsStore.loadWorkouts()
})
</script>
