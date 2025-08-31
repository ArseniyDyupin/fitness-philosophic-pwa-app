<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="max-w-md w-full">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">AI Trainer</h1>
        <p class="text-gray-600">Step 3 of 5</p>
      </div>

      <div class="card">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">What equipment do you have access to?</h2>
        
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-3">Select all that apply:</label>
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
              @click="$router.push('/onboarding/constraints')"
              class="btn-secondary"
            >
              Back
            </button>
            <button
              type="submit"
              class="btn-primary"
            >
              Next
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

const router = useRouter()

const selectedEquipment = ref<string[]>([])

const equipmentList = [
  {
    id: 'none',
    title: 'No Equipment',
    description: 'Bodyweight exercises only'
  },
  {
    id: 'dumbbells',
    title: 'Dumbbells',
    description: 'Free weights for strength training'
  },
  {
    id: 'resistance_bands',
    title: 'Resistance Bands',
    description: 'Elastic bands for strength and mobility'
  },
  {
    id: 'pull_up_bar',
    title: 'Pull-up Bar',
    description: 'Bar for pull-ups and hanging exercises'
  },
  {
    id: 'yoga_mat',
    title: 'Yoga Mat',
    description: 'Mat for floor exercises and stretching'
  },
  {
    id: 'treadmill',
    title: 'Treadmill',
    description: 'Cardio machine for running/walking'
  },
  {
    id: 'bicycle',
    title: 'Bicycle',
    description: 'Indoor or outdoor cycling'
  },
  {
    id: 'gym_access',
    title: 'Gym Access',
    description: 'Full gym with various equipment'
  }
]

function handleSubmit() {
  // Store equipment data
  localStorage.setItem('onboarding-equipment', JSON.stringify(selectedEquipment.value))
  
  // Navigate to next step
  router.push('/onboarding/metrics')
}
</script>
