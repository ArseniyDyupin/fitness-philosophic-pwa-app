<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="max-w-md w-full">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ t.aiTrainer }}</h1>
        <p class="text-gray-600">{{ t.step }} 6 {{ t.of }} 6</p>
      </div>

      <div class="card">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">{{ t.howOften }}</h2>
        
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Workout Frequency -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-3">{{ t.workoutsPerWeek }}</label>
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
              {{ t.typicalWorkoutDuration }}
            </label>
            <select v-model="selectedDuration" class="input-field" required>
              <option value="">{{ t.selectDuration }}</option>
              <option value="15">15 {{ t.minutes }}</option>
              <option value="30">30 {{ t.minutes }}</option>
              <option value="45">45 {{ t.minutes }}</option>
              <option value="60">60 {{ t.minutes }}</option>
              <option value="90">90 {{ t.minutes }}</option>
            </select>
          </div>

          <!-- Navigation -->
          <div class="flex justify-between">
            <button
              type="button"
              @click="$router.push('/onboarding/metrics')"
              class="btn-secondary"
            >
              {{ t.back }}
            </button>
            <button
              type="submit"
              :disabled="!isFormValid || isSubmitting"
              class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isSubmitting">{{ t.creatingProfile }}</span>
              <span v-else>{{ t.completeSetup }}</span>
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
import { useI18nStore } from '@/stores/i18n.store'

const router = useRouter()
const profileStore = useProfileStore()
const i18nStore = useI18nStore()

const { t } = i18nStore

const selectedFrequency = ref(3)
const selectedDuration = ref(30)
const isSubmitting = ref(false)

const frequencyOptions = [
  { value: 1, label: `1x ${t.timesPerWeek}`, description: t.beginner },
  { value: 2, label: `2x ${t.timesPerWeek}`, description: t.light },
  { value: 3, label: `3x ${t.timesPerWeek}`, description: t.moderate },
  { value: 4, label: `4x ${t.timesPerWeek}`, description: t.active },
  { value: 5, label: `5x ${t.timesPerWeek}`, description: t.veryActive },
  { value: 6, label: `6x ${t.timesPerWeek}`, description: t.athlete }
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
    const detailedGoalsData = localStorage.getItem('onboarding-detailed-goals') || ''
    const equipmentData = JSON.parse(localStorage.getItem('onboarding-equipment') || '[]')
    const metricsData = JSON.parse(localStorage.getItem('onboarding-metrics') || '{}')
    const selectedLanguage = localStorage.getItem('selectedLanguage') || 'en'

    // Create profile using the store method
    await profileStore.createProfile({
      name: metricsData.name,
      age: metricsData.age,
      gender: metricsData.gender,
      height: metricsData.height,
      weight: metricsData.weight,
      goal: {
        types: goalData.types || ['general_fitness'],
        targetWeight: goalData.targetWeight,
        targetEvent: goalData.targetEvent,
        description: goalData.description || ''
      },
      constraints: constraintsData,
      goalsDetailed: detailedGoalsData,
      equipment: equipmentData,
      frequency: selectedFrequency.value,
      duration: selectedDuration.value,
      language: selectedLanguage
    })

    // Clear onboarding data
    localStorage.removeItem('onboarding-goal')
    localStorage.removeItem('onboarding-constraints')
    localStorage.removeItem('onboarding-detailed-goals')
    localStorage.removeItem('onboarding-equipment')
    localStorage.removeItem('onboarding-metrics')
    localStorage.removeItem('selectedLanguage')

    // Show success message
    if ((window as any).showToast) {
      ;(window as any).showToast({
        type: 'success',
        message: t.profileCreatedSuccess
      })
    }

    // Wait a bit to ensure profile is saved, then navigate to home
    setTimeout(() => {
      router.push('/')
    }, 500)
  } catch (error) {
    console.error('Error creating profile:', error)
    
          if ((window as any).showToast) {
        ;(window as any).showToast({
          type: 'error',
          message: t.profileCreationFailed
        })
      }
  } finally {
    isSubmitting.value = false
  }
}
</script>
