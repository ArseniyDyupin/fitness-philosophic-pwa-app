<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="max-w-md w-full">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">AI Trainer</h1>
        <p class="text-gray-600">Step 5 of 5</p>
      </div>

      <div class="card">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">How often do you want to work out?</h2>
        
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Workout Frequency -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-3">Workouts per week:</label>
            <div class="grid grid-cols-2 gap-3">
              <label 
                v-for="freq in frequencyOptions" 
                :key="freq.value"
                class="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                :class="selectedFrequency === freq.value ? 'border-primary-500 bg-primary-50' : 'border-gray-200'"
              >
                <input
                  type="radio"
                  :value="freq.value"
                  v-model="selectedFrequency"
                  class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                />
                <div class="ml-3">
                  <div class="text-sm font-medium text-gray-900">{{ freq.label }}</div>
                  <div class="text-xs text-gray-500">{{ freq.description }}</div>
                </div>
              </label>
            </div>
          </div>

          <!-- Workout Duration -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Typical workout duration (minutes)
            </label>
            <select v-model="selectedDuration" class="input-field" required>
              <option value="">Select duration</option>
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">60 minutes</option>
              <option value="90">90 minutes</option>
            </select>
          </div>

          <!-- Navigation -->
          <div class="flex justify-between">
            <button
              type="button"
              @click="$router.push('/onboarding/metrics')"
              class="btn-secondary"
            >
              Back
            </button>
            <button
              type="submit"
              :disabled="!isFormValid || isSubmitting"
              class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isSubmitting">Creating Profile...</span>
              <span v-else>Complete Setup</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useProfileStore } from '@/stores/profile.store'

const router = useRouter()
const profileStore = useProfileStore()

const selectedFrequency = ref(3)
const selectedDuration = ref(30)
const isSubmitting = ref(false)

const frequencyOptions = [
  { value: 1, label: '1x per week', description: 'Beginner' },
  { value: 2, label: '2x per week', description: 'Light' },
  { value: 3, label: '3x per week', description: 'Moderate' },
  { value: 4, label: '4x per week', description: 'Active' },
  { value: 5, label: '5x per week', description: 'Very Active' },
  { value: 6, label: '6x per week', description: 'Athlete' }
]

const isFormValid = computed(() => {
  return selectedFrequency.value > 0 && selectedDuration.value > 0
})

async function handleSubmit() {
  if (!isFormValid.value) return

  isSubmitting.value = true

  try {
    // Collect all onboarding data
    const goalData = JSON.parse(localStorage.getItem('onboarding-goal') || '{}')
    const constraintsData = JSON.parse(localStorage.getItem('onboarding-constraints') || '[]')
    const equipmentData = JSON.parse(localStorage.getItem('onboarding-equipment') || '[]')
    const metricsData = JSON.parse(localStorage.getItem('onboarding-metrics') || '{}')

    // Create profile
    const profile = {
      id: crypto.randomUUID(),
      name: metricsData.name,
      age: metricsData.age,
      gender: metricsData.gender,
      height: metricsData.height,
      weight: metricsData.weight,
      goal: {
        type: goalData.type,
        targetWeight: goalData.targetWeight,
        targetEvent: goalData.targetEvent,
        description: goalData.description
      },
      constraints: constraintsData,
      equipment: equipmentData,
      frequency: selectedFrequency.value,
      duration: selectedDuration.value,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Save profile
    await profileStore.saveProfile(profile)

    // Clear onboarding data
    localStorage.removeItem('onboarding-goal')
    localStorage.removeItem('onboarding-constraints')
    localStorage.removeItem('onboarding-equipment')
    localStorage.removeItem('onboarding-metrics')

    // Navigate to home
    router.push('/')

    // Show success message
    if ((window as any).showToast) {
      ;(window as any).showToast({
        type: 'success',
        message: 'Profile created successfully! Welcome to AI Trainer!'
      })
    }
  } catch (error) {
    console.error('Error creating profile:', error)
    
    if ((window as any).showToast) {
      ;(window as any).showToast({
        type: 'error',
        message: 'Failed to create profile. Please try again.'
      })
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>
