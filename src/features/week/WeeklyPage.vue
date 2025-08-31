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
            <h1 class="text-2xl font-bold text-gray-900">Weekly View</h1>
          </div>
          <button
            @click="showCheckinForm = true"
            class="btn-primary"
          >
            Weekly Check-in
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Weekly Summary -->
      <div class="card mb-8">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">This Week's Summary</h2>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-primary-600">{{ weeklyWorkoutCalories }} kcal</div>
            <div class="text-sm text-gray-600">Burned</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600">{{ weeklyFoodCalories }} kcal</div>
            <div class="text-sm text-gray-600">Consumed</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold" :class="weeklyBalanceClass">{{ weeklyBalance }} kcal</div>
            <div class="text-sm text-gray-600">Balance</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-green-600">{{ weeklyWorkouts.length }}</div>
            <div class="text-sm text-gray-600">Workouts</div>
          </div>
        </div>
      </div>

      <!-- Current Week Check-in -->
      <div v-if="currentWeekCheckin" class="card mb-8">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">This Week's Check-in</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div class="text-sm text-gray-600">Weight</div>
            <div class="text-xl font-semibold text-gray-900">{{ currentWeekCheckin.weight }} kg</div>
          </div>
          <div v-if="currentWeekCheckin.waist">
            <div class="text-sm text-gray-600">Waist</div>
            <div class="text-xl font-semibold text-gray-900">{{ currentWeekCheckin.waist }} cm</div>
          </div>
          <div v-if="currentWeekCheckin.notes" class="md:col-span-2">
            <div class="text-sm text-gray-600">Notes</div>
            <div class="text-gray-900">{{ currentWeekCheckin.notes }}</div>
          </div>
        </div>
      </div>

      <!-- Weekly Check-in Form Modal -->
      <div v-if="showCheckinForm" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-10 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
          <div class="mt-3">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Weekly Check-in</h3>
            <WeeklyCheckinForm 
              @saved="handleCheckinSaved"
              @cancel="showCheckinForm = false"
            />
          </div>
        </div>
      </div>

      <!-- Previous Check-ins -->
      <div v-if="sortedCheckins.length > 1" class="card">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Previous Check-ins</h2>
        <div class="space-y-4">
          <div 
            v-for="checkin in sortedCheckins.slice(1, 5)" 
            :key="checkin.id"
            class="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div>
              <div class="text-sm font-medium text-gray-900">
                Week of {{ formatDate(checkin.weekStart) }}
              </div>
              <div class="text-sm text-gray-500">
                Weight: {{ checkin.weight }} kg
                <span v-if="checkin.waist">• Waist: {{ checkin.waist }} cm</span>
              </div>
            </div>
            <div class="text-sm text-gray-500">
              {{ formatDate(checkin.createdAt) }}
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useWorkoutsStore } from '@/stores/workouts.store'
import { useFoodStore } from '@/stores/food.store'
import { useCheckinsStore } from '@/stores/checkins.store'
import { format, startOfWeek, endOfWeek } from 'date-fns'
import WeeklyCheckinForm from '@/components/WeeklyCheckinForm.vue'

const workoutsStore = useWorkoutsStore()
const foodStore = useFoodStore()
const checkinsStore = useCheckinsStore()

const showCheckinForm = ref(false)

// Computed properties
const weeklyWorkouts = computed(() => {
  const now = new Date()
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 })
  
  return workoutsStore.workouts.filter(workout => {
    const workoutDate = new Date(workout.date)
    return workoutDate >= weekStart && workoutDate <= weekEnd
  })
})

const weeklyWorkoutCalories = computed(() => {
  return weeklyWorkouts.value.reduce((total, workout) => total + workout.calories, 0)
})

const weeklyFoodCalories = computed(() => {
  const now = new Date()
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 })
  
  return foodStore.foodLogs.filter(log => {
    const logDate = new Date(log.date)
    return logDate >= weekStart && logDate <= weekEnd
  }).reduce((total, log) => total + log.calories, 0)
})

const weeklyBalance = computed(() => {
  return weeklyFoodCalories.value - weeklyWorkoutCalories.value
})

const weeklyBalanceClass = computed(() => {
  if (weeklyBalance.value > 0) return 'text-red-600'
  if (weeklyBalance.value < 0) return 'text-green-600'
  return 'text-gray-600'
})

const currentWeekCheckin = computed(() => checkinsStore.currentWeekCheckin)
const sortedCheckins = computed(() => checkinsStore.sortedCheckins)

// Methods
function formatDate(date: Date): string {
  return format(new Date(date), 'MMM d, yyyy')
}

function handleCheckinSaved() {
  showCheckinForm.value = false
  
  if ((window as any).showToast) {
    ;(window as any).showToast({
      type: 'success',
      message: 'Weekly check-in saved successfully!'
    })
  }
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    workoutsStore.loadWorkouts(),
    foodStore.loadFoodLogs(),
    checkinsStore.loadCheckins()
  ])
})
</script>
