<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <h1 class="text-2xl font-bold text-gray-900">{{ t.workouts }}</h1>
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
        <button 
          @click="showAddForm = true"
          class="btn-primary"
        >
          {{ t.addFirstWorkout }}
        </button>
      </div>

      <!-- Weekly Summary -->
      <div v-else-if="weeklyStats" class="mb-8">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">{{ t.weeklySummary }}</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="text-center">
              <div class="text-2xl font-bold text-primary-600">{{ weeklyStats.workoutCount }}</div>
              <div class="text-sm text-gray-600">{{ t.workouts }}</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-green-600">{{ weeklyStats.totalCalories }}</div>
              <div class="text-sm text-gray-600">{{ t.calories }}</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-orange-600">{{ weeklyStats.totalDuration }}</div>
              <div class="text-sm text-gray-600">{{ t.minutes }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Workouts List -->
      <div v-else class="space-y-4">
        <!-- Debug Info -->
        <div class="bg-blue-100 p-4 text-sm text-blue-800 rounded-lg">
          <div>Total workouts: {{ workouts.length }}</div>
          <div>Sorted workouts: {{ sortedWorkouts.length }}</div>
          <div v-if="sortedWorkouts.length > 0">
            First workout: {{ JSON.stringify(sortedWorkouts[0], null, 2) }}
          </div>
        </div>
        
        <WorkoutCard
          v-for="workout in sortedWorkouts"
          :key="workout.id"
          :workout="workout"
        />
      </div>
    </main>

    <!-- Add Workout Modal -->
    <div v-if="showAddForm" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-4 mx-auto p-6 border shadow-xl rounded-lg bg-white" style="width: 90vw !important; max-width: 90vw !important;">
        <div class="w-full">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-2xl font-semibold text-gray-900">{{ t.addWorkout }}</h3>
            <button
              @click="showAddForm = false"
              class="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <WorkoutForm 
            @saved="handleWorkoutSaved"
            @cancel="showAddForm = false"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useWorkoutsStore } from '@/stores/workouts.store'
import { useI18nStore } from '@/stores/i18n.store'
import WorkoutForm from '@/components/WorkoutForm.vue'
import WorkoutCard from '@/components/WorkoutCard.vue'

const router = useRouter()
const workoutsStore = useWorkoutsStore()
const i18nStore = useI18nStore()

const { t } = i18nStore

// State
const showAddForm = ref(false)

// Computed properties
const workouts = computed(() => workoutsStore.workouts)
const isLoading = computed(() => workoutsStore.isLoading)
const error = computed(() => workoutsStore.error)

// Sort workouts by date (newest first)
const sortedWorkouts = computed(() => {
  return [...workouts.value].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) as any[]
})

// Weekly statistics
const weeklyStats = computed(() => {
  if (workouts.value.length === 0) return null
  
  const now = new Date()
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
  const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
  
  const weeklyWorkouts = workouts.value.filter(workout => {
    const workoutDate = new Date(workout.date)
    return workoutDate >= weekStart && workoutDate < weekEnd
  })
  
  if (weeklyWorkouts.length === 0) return null
  
  const totalCalories = weeklyWorkouts.reduce((total, workout) => {
    return total + workout.exercises.reduce((sum, exercise) => sum + (exercise.kcalEstimated || 0), 0)
  }, 0)
  
  const totalDuration = weeklyWorkouts.reduce((total, workout) => {
    return total + workout.exercises.reduce((sum, exercise) => {
      if (exercise.type === 'run') {
        return sum + (exercise.details.durationMin || 0)
      } else if (exercise.type === 'pullups' || exercise.type === 'pushups') {
        return sum + (exercise.details.sets || 0) * 2
      } else if (exercise.type === 'plank') {
        const totalSeconds = exercise.details.seconds?.reduce((a, b) => a + b, 0) || 0
        return sum + Math.ceil(totalSeconds / 60)
      } else if (exercise.type === 'custom') {
        if (exercise.details.durationMin) {
          return sum + exercise.details.durationMin
        } else if (exercise.details.sets) {
          return sum + (exercise.details.sets * 2)
        }
      }
      return sum + 5
    }, 0)
  }, 0)
  
  return {
    workoutCount: weeklyWorkouts.length,
    totalCalories,
    totalDuration
  }
})

// Methods
function handleWorkoutSaved(workout: any) {
  showAddForm.value = false
  // Refresh workouts list
  workoutsStore.loadWorkouts()
}

// Load data on mount
onMounted(async () => {
  console.log('WorkoutsPage mounted, loading workouts...')
  await workoutsStore.loadWorkouts()
  console.log('Workouts loaded:', workoutsStore.workouts)
  console.log('Workouts length:', workoutsStore.workouts.length)
})
</script>
