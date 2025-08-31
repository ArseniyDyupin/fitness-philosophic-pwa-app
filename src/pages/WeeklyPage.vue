<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <h1 class="text-2xl font-bold text-gray-900">{{ t.weekly }}</h1>
          <router-link 
            to="/week/add" 
            class="btn-primary"
          >
            {{ t.weeklyCheckin }}
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
      <div v-else-if="weeklyCheckins.length === 0" class="text-center py-8">
        <div class="text-gray-500 mb-4">{{ t.noWeeklyCheckinsFound }}</div>
        <router-link 
          to="/week/add" 
          class="btn-primary"
        >
          {{ t.weeklyCheckin }}
        </router-link>
      </div>

      <!-- Weekly Checkins List -->
      <div v-else class="space-y-4">
        <div 
          v-for="checkin in weeklyCheckins" 
          :key="checkin.id"
          class="card hover:shadow-md transition-shadow cursor-pointer"
          @click="viewCheckin(checkin.id)"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
              <div>
                <div class="font-medium text-gray-900">{{ formatDate(checkin.date) }}</div>
                <div class="text-sm text-gray-500">{{ t.weeklyCheckin }}</div>
              </div>
            </div>
            <div class="text-right">
              <div class="font-medium text-gray-900">{{ checkin.weight }} {{ t.weeklyWeight }}</div>
              <div class="text-sm text-gray-500">
                {{ t.waist }}: {{ checkin.waist }}cm
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
import { useI18nStore } from '@/stores/i18n.store'
import { format } from 'date-fns'

const router = useRouter()
const i18nStore = useI18nStore()

const { t } = i18nStore

// Computed properties - placeholder until weekly store is implemented
const weeklyCheckins = computed(() => [] as any[])
const isLoading = computed(() => false)
const error = computed(() => null)

// Methods
function viewCheckin(id: string) {
  router.push(`/week/${id}`)
}

function formatDate(date: Date) {
  return format(date, 'MMM d, yyyy')
}

// Load data on mount
onMounted(async () => {
  // TODO: Implement weekly store
})
</script>
