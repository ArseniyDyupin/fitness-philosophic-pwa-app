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
            <h1 class="text-2xl font-bold text-gray-900">Food Log</h1>
          </div>
          <button
            @click="showAddForm = true"
            class="btn-primary"
          >
            Add Food
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Add Food Form Modal -->
      <div v-if="showAddForm" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-10 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
          <div class="mt-3">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Add Food Log</h3>
            <FoodLogForm 
              @saved="handleFoodSaved"
              @cancel="showAddForm = false"
            />
          </div>
        </div>
      </div>

      <!-- Food Logs by Date -->
      <div v-if="groupedFoodLogs.length > 0" class="space-y-6">
        <div 
          v-for="day in groupedFoodLogs" 
          :key="day.date.toISOString()"
          class="card"
        >
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ formatDate(day.date) }}
            </h3>
            <div class="text-right">
              <div class="text-lg font-semibold text-blue-600">
                {{ day.totalCalories }} kcal
              </div>
              <div class="text-sm text-gray-500">
                {{ day.logs.length }} entries
              </div>
            </div>
          </div>

          <div class="space-y-3">
            <div 
              v-for="log in day.logs" 
              :key="log.id"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div>
                <div class="text-sm font-medium text-gray-900">
                  {{ log.notes || 'Food entry' }}
                </div>
                <div class="text-xs text-gray-500">
                  {{ log.calories }} kcal
                  <span v-if="log.protein">• {{ log.protein }}g protein</span>
                  <span v-if="log.carbs">• {{ log.carbs }}g carbs</span>
                  <span v-if="log.fat">• {{ log.fat }}g fat</span>
                </div>
              </div>
              <button
                @click="editFoodLog(log)"
                class="text-sm text-blue-600 hover:text-blue-700"
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"></path>
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No food logs yet</h3>
        <p class="text-gray-600 mb-6">Start tracking your nutrition by adding your first food log</p>
        <button
          @click="showAddForm = true"
          class="btn-primary"
        >
          Add Your First Food Log
        </button>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useFoodStore } from '@/stores/food.store'
import { format } from 'date-fns'
import FoodLogForm from '@/components/FoodLogForm.vue'
import type { FoodLog } from '@/types/models'

const foodStore = useFoodStore()

const showAddForm = ref(false)
const editingFoodLog = ref<FoodLog | null>(null)

// Computed
const groupedFoodLogs = computed(() => foodStore.groupedByDate)

// Methods
function formatDate(date: Date): string {
  return format(new Date(date), 'EEEE, MMM d, yyyy')
}

function editFoodLog(log: FoodLog) {
  editingFoodLog.value = log
  showAddForm.value = true
}

function handleFoodSaved(foodLog: FoodLog) {
  showAddForm.value = false
  editingFoodLog.value = null
  
  if ((window as any).showToast) {
    ;(window as any).showToast({
      type: 'success',
      message: 'Food log saved successfully!'
    })
  }
}

// Lifecycle
onMounted(async () => {
  await foodStore.loadFoodLogs()
})
</script>
