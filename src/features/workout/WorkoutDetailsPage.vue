<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <div class="flex items-center">
            <router-link 
              to="/workouts" 
              class="p-2 text-gray-400 hover:text-gray-600 transition-colors mr-2"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </router-link>
            <h1 class="text-2xl font-bold text-gray-900">Workout Details</h1>
          </div>
          <div class="flex space-x-2">
            <button
              @click="showEditForm = true"
              class="btn-secondary"
            >
              Edit
            </button>
            <button
              @click="deleteWorkout"
              class="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p class="mt-4 text-gray-600">Loading workout details...</p>
      </div>

      <!-- Workout Details -->
      <div v-else-if="workout" class="space-y-6">
        <!-- Workout Info Card -->
        <div class="card">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <span class="text-lg font-medium text-primary-600">
                  {{ getWorkoutTypeIcon(workout.type) }}
                </span>
              </div>
              <div class="ml-4">
                <h2 class="text-2xl font-bold text-gray-900">
                  {{ formatWorkoutType(workout.type) }}
                </h2>
                <p class="text-gray-600">{{ formatDate(workout.date) }}</p>
              </div>
            </div>
            <div class="text-right">
              <div class="text-3xl font-bold text-primary-600">
                {{ workout.calories }} kcal
              </div>
              <div class="text-sm text-gray-500">Burned</div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Workout Details</h3>
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-gray-600">Duration:</span>
                  <span class="font-medium">{{ workout.durationMin }} minutes</span>
                </div>
                <div v-if="workout.distance" class="flex justify-between">
                  <span class="text-gray-600">Distance:</span>
                  <span class="font-medium">{{ workout.distance }} km</span>
                </div>
                <div v-if="workout.reps" class="flex justify-between">
                  <span class="text-gray-600">Reps:</span>
                  <span class="font-medium">{{ workout.reps }}</span>
                </div>
                <div v-if="workout.sets" class="flex justify-between">
                  <span class="text-gray-600">Sets:</span>
                  <span class="font-medium">{{ workout.sets }}</span>
                </div>
                <div v-if="workout.weight" class="flex justify-between">
                  <span class="text-gray-600">Weight:</span>
                  <span class="font-medium">{{ workout.weight }} kg</span>
                </div>
                <div v-if="workout.customExercise" class="flex justify-between">
                  <span class="text-gray-600">Exercise:</span>
                  <span class="font-medium">{{ workout.customExercise }}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
              <div v-if="workout.notes" class="bg-gray-50 rounded-lg p-4">
                <p class="text-gray-700">{{ workout.notes }}</p>
              </div>
              <div v-else class="text-gray-500 italic">
                No notes added
              </div>
            </div>
          </div>
        </div>

        <!-- AI Analysis -->
        <div v-if="aiStore.hasApiKey">
          <div v-if="aiPlan" class="card">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ t.aiAnalysis }}</h3>
            <PlanCard :plan="aiPlan" />
          </div>

          <!-- AI Analysis Button -->
          <div v-else class="card">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ t.aiAnalysis }}</h3>
            <p class="text-gray-600 mb-4">
              {{ t.aiAnalysisDescription }}
            </p>
            <button
              @click="evaluateWorkout"
              :disabled="isEvaluating"
              class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isEvaluating">{{ t.analyzing }}</span>
              <span v-else>{{ t.analyzeWithAI }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Not Found -->
      <div v-else class="text-center py-12">
        <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33"></path>
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Workout not found</h3>
        <p class="text-gray-600 mb-6">The workout you're looking for doesn't exist or has been deleted.</p>
        <router-link 
          to="/workouts" 
          class="btn-primary"
        >
          Back to Workouts
        </router-link>
      </div>

      <!-- Edit Form Modal -->
      <div v-if="showEditForm && workout" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-10 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
          <div class="mt-3">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Edit Workout</h3>
            <WorkoutForm 
              :workout="workout"
              :edit-mode="true"
              @saved="handleWorkoutUpdated"
              @cancel="showEditForm = false"
            />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useWorkoutsStore } from '@/stores/workouts.store'
import { useAIStore } from '@/stores/ai.store'
import { useI18nStore } from '@/stores/i18n.store'
import { format } from 'date-fns'
import WorkoutForm from '@/components/WorkoutForm.vue'
import PlanCard from '@/components/PlanCard.vue'
import type { Workout } from '@/types/models'

const i18nStore = useI18nStore()
const { t } = i18nStore

const route = useRoute()
const router = useRouter()
const workoutsStore = useWorkoutsStore()
const aiStore = useAIStore()

const isLoading = ref(false)
const isEvaluating = ref(false)
const showEditForm = ref(false)

// Computed
const workout = computed(() => workoutsStore.workouts.find(w => w.id === route.params.id))
const aiPlan = computed(() => aiStore.aiPlans.find(p => p.workoutId === route.params.id))

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
  return format(new Date(date), 'EEEE, MMM d, yyyy')
}

async function evaluateWorkout() {
  if (!workout.value) return
  
  isEvaluating.value = true
  
  try {
    await aiStore.reviewWorkout(workout.value.id)
    
    if ((window as any).showToast) {
      ;(window as any).showToast({
        type: 'success',
        message: t.workoutAnalyzed
      })
    }
  } catch (error) {
    console.error('Error evaluating workout:', error)
    
    if ((window as any).showToast) {
      ;(window as any).showToast({
        type: 'error',
        message: t.failedToAnalyze
      })
    }
  } finally {
    isEvaluating.value = false
  }
}

async function deleteWorkout() {
  if (!workout.value) return
  
  if (!confirm(t.deleteConfirm)) {
    return
  }
  
  try {
    await workoutsStore.deleteWorkout(workout.value.id)
    
    if ((window as any).showToast) {
      ;(window as any).showToast({
        type: 'success',
        message: t.workoutDeleted
      })
    }
    
    router.push('/workouts')
  } catch (error) {
    console.error('Error deleting workout:', error)
    
    if ((window as any).showToast) {
      ;(window as any).showToast({
        type: 'error',
        message: t.failedToDelete
      })
    }
  }
}

function handleWorkoutUpdated(updatedWorkout: Workout) {
  showEditForm.value = false
  
  if ((window as any).showToast) {
    ;(window as any).showToast({
      type: 'success',
              message: t.workoutUpdated
    })
  }
}

// Lifecycle
onMounted(async () => {
  isLoading.value = true
  
  try {
    await Promise.all([
      workoutsStore.loadWorkouts(),
      aiStore.loadAIPlans()
    ])
  } finally {
    isLoading.value = false
  }
})
</script>
