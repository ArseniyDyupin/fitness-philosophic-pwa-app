<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="max-w-md w-full">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ t.aiTrainer }}</h1>
        <p class="text-gray-600">{{ t.step }} 4 {{ t.of }} 6</p>
      </div>

      <div class="card">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">{{ t.whatEquipment }}</h2>
        
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-3">{{ t.selectEquipment }}</label>
            <div class="space-y-3">
              <label 
                v-for="equipment in equipmentList" 
                :key="equipment.id"
                class="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                :class="selectedEquipment.includes(equipment.id) ? 'border-primary-500 bg-primary-50' : 'border-gray-200'"
              >
                <input
                  type="checkbox"
                  :value="equipment.id"
                  v-model="selectedEquipment"
                  class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <div class="ml-3">
                  <div class="text-sm font-medium text-gray-900">{{ equipment.title }}</div>
                  <div class="text-sm text-gray-500">{{ equipment.description }}</div>
                </div>
              </label>
            </div>
          </div>

          <!-- Navigation -->
          <div class="flex justify-between">
            <button
              type="button"
              @click="$router.push('/onboarding/detailed-goals')"
              class="btn-secondary"
            >
              {{ t.back }}
            </button>
            <button
              type="submit"
              class="btn-primary"
            >
              {{ t.next }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18nStore } from '@/stores/i18n.store'

const router = useRouter()
const i18nStore = useI18nStore()

const { t } = i18nStore

const selectedEquipment = ref<string[]>([])

const equipmentList = [
  {
    id: 'none',
    title: t.noEquipment,
    description: t.noEquipmentDescription
  },
  {
    id: 'dumbbells',
    title: t.dumbbells,
    description: t.dumbbellsDescription
  },
  {
    id: 'resistance_bands',
    title: t.resistanceBands,
    description: t.resistanceBandsDescription
  },
  {
    id: 'pull_up_bar',
    title: t.pullUpBar,
    description: t.pullUpBarDescription
  },
  {
    id: 'yoga_mat',
    title: t.yogaMat,
    description: t.yogaMatDescription
  },
  {
    id: 'treadmill',
    title: t.treadmill,
    description: t.treadmillDescription
  },
  {
    id: 'bicycle',
    title: t.bicycle,
    description: t.bicycleDescription
  },
  {
    id: 'gym_access',
    title: t.gymAccess,
    description: t.gymAccessDescription
  }
]

function handleSubmit() {
  // Store equipment data
  localStorage.setItem('onboarding-equipment', JSON.stringify(selectedEquipment.value))
  
  // Navigate to next step
  router.push('/onboarding/metrics')
}
</script>
