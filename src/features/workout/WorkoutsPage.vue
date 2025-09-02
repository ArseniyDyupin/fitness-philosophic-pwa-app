<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <div class="flex items-center">
            <router-link 
              to="/" 
              class="p-2 text-gray-400 hover:text-gray-600 transition-colors mr-2"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </router-link>
            <h1 class="text-2xl font-bold text-gray-900">{{ t.workout }}</h1>
          </div>
          <button
            @click="showAddForm = true"
            class="btn-primary"
          >
            {{ t.addWorkout }}
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Add Workout Form Modal -->
      <div v-if="showAddForm" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-10 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
          <div class="mt-3">
            <h3 class="text-lg font-medium text-gray-900 mb-4">{{ t.addWorkout }}</h3>
            <WorkoutForm 
              @saved="handleWorkoutSaved"
              @cancel="showAddForm = false"
            />
          </div>
        </div>
      </div>

      <!-- Workouts List -->
      <div v-if="workouts.length > 0" class="space-y-4">
        <div 
          v-for="workout in workouts" 
          :key="workout.id"
          class="card hover:shadow-md transition-shadow cursor-pointer"
          @click="viewWorkout(workout.id)"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <span class="text-sm font-medium text-primary-600">
                  {{ getWorkoutTypeIcon(workout.type) }}
                </span>
              </div>
              <div class="ml-4">
                <div class="text-lg font-medium text-gray-900">
                  {{ formatWorkoutType(workout.type) }}
                </div>
                <div class="text-sm text-gray-500">
                  {{ formatDate(workout.date) }} • {{ workout.durationMin }} minutes
                </div>
                <div v-if="workout.notes" class="text-sm text-gray-600 mt-1">
                  {{ workout.notes }}
                </div>
              </div>
            </div>
            <div class="text-right">
              <div class="text-lg font-semibold text-primary-600">
                {{ workout.calories }} kcal
              </div>
              <button
                @click.stop="evaluateWorkout(workout.id)"
                class="text-sm text-blue-600 hover:text-blue-700"
              >
                Evaluate with AI
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No workouts yet</h3>
        <p class="text-gray-600 mb-6">Start your fitness journey by adding your first workout</p>
        <button
          @click="showAddForm = true"
          class="btn-primary"
        >
          Add Your First Workout
        </button>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useWorkoutsStore } from '@/stores/workouts.store'
import { useAIStore } from '@/stores/ai.store'
import { format } from 'date-fns'
import WorkoutForm from '@/components/WorkoutForm.vue'
import type { Workout } from '@/types/models'
import { useI18nStore } from '@/stores/i18n.store'

const router = useRouter()
const workoutsStore = useWorkoutsStore()
const aiStore = useAIStore()
const i18nStore = useI18nStore()

const { t } = i18nStore

const showAddForm = ref(false)

// Computed
const workouts = computed(() => workoutsStore.workouts)

// Methods
function formatWorkoutType(type: string): string {
  const types: Record<string, string> = {
    run: 'Running',
    pullups: 'Pull-ups',
    pushups: 'Push-ups',
    plank: 'Plank',
    custom: 'Custom Exercise'
  }
  return types[type] || type
}

function getWorkoutTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    run: '🏃',
    pullups: '💪',
    pushups: '🏋️',
    plank: '🧘',
    custom: '⚡'
  }
  return icons[type] || '⚡'
}

function formatDate(date: Date): string {
  return format(new Date(date), 'MMM d, yyyy')
}

function viewWorkout(id: string) {
  router.push(`/workouts/${id}`)
}

async function evaluateWorkout(workoutId: string) {
  try {
    await aiStore.reviewWorkout(workoutId)
    
    if ((window as any).showToast) {
      ;(window as any).showToast({
        type: 'success',
        message: 'Workout evaluated! Check your AI plans.'
      })
    }
  } catch (error) {
    console.error('Error evaluating workout:', error)
    
    if ((window as any).showToast) {
      ;(window as any).showToast({
        type: 'error',
        message: 'Failed to evaluate workout. Please check your AI settings.'
      })
    }
  }
}

function handleWorkoutSaved(workout: Workout) {
  showAddForm.value = false
  
  if ((window as any).showToast) {
    ;(window as any).showToast({
      type: 'success',
      message: 'Workout saved successfully!'
    })
  }
}

// Lifecycle
onMounted(async () => {
  await workoutsStore.loadWorkouts()
})
</script>
