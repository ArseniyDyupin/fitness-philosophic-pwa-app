<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <h1 class="text-2xl font-bold text-gray-900">{{ t.food }}</h1>
          <router-link 
            to="/food/add" 
            class="btn-primary"
          >
            {{ t.addFoodLog }}
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
      <div v-else-if="foodLogs.length === 0" class="text-center py-8">
        <div class="text-gray-500 mb-4">{{ t.noFoodLogsFound }}</div>
        <router-link 
          to="/food/add" 
          class="btn-primary"
        >
          {{ t.addFoodLog }}
        </router-link>
      </div>

      <!-- Food Logs List -->
      <div v-else class="space-y-4">
        <div 
          v-for="foodLog in foodLogs" 
          :key="foodLog.id"
          class="card hover:shadow-md transition-shadow cursor-pointer"
          @click="viewFoodLog(foodLog.id)"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"></path>
                </svg>
              </div>
              <div>
                <div class="font-medium text-gray-900">{{ foodLog.calories }} {{ t.calories }}</div>
                <div class="text-sm text-gray-500">{{ formatDate(foodLog.date) }}</div>
              </div>
            </div>
            <div class="text-right">
              <div class="text-sm text-gray-500">
                {{ t.protein }}: {{ foodLog.protein || 0 }}g
              </div>
              <div class="text-sm text-gray-500">
                {{ t.carbs }}: {{ foodLog.carbs || 0 }}g
              </div>
              <div class="text-sm text-gray-500">
                {{ t.fat }}: {{ foodLog.fat || 0 }}g
              </div>
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
import { useFoodStore } from '@/stores/food.store'
import { useI18nStore } from '@/stores/i18n.store'
import { format } from 'date-fns'

const router = useRouter()
const foodStore = useFoodStore()
const i18nStore = useI18nStore()

const { t } = i18nStore

// Computed properties
const foodLogs = computed(() => foodStore.foodLogs)
const isLoading = computed(() => foodStore.isLoading)
const error = computed(() => foodStore.error)

// Methods
function viewFoodLog(id: string) {
  router.push(`/food/${id}`)
}

function formatDate(date: Date) {
  return format(date, 'MMM d, yyyy')
}

// Load data on mount
onMounted(async () => {
  await foodStore.loadFoodLogs()
})
</script>
