<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="max-w-md w-full">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ t.aiTrainer }}</h1>
        <p class="text-gray-600">{{ t.step }} 1 {{ t.of }} 6</p>
      </div>

      <div class="card">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">{{ t.whatIsYourGoal }}</h2>
        
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Goal Type -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-3">{{ t.selectYourGoal }}</label>
            <div class="space-y-3">
              <label 
                v-for="goal in goals" 
                :key="goal.type"
                class="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                :class="selectedGoal === goal.type ? 'border-primary-500 bg-primary-50' : 'border-gray-200'"
              >
                <input
                  type="radio"
                  :value="goal.type"
                  v-model="selectedGoal"
                  class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                />
                <div class="ml-3">
                  <div class="text-sm font-medium text-gray-900">{{ goal.title }}</div>
                  <div class="text-sm text-gray-500">{{ goal.description }}</div>
                </div>
              </label>
            </div>
          </div>

          <!-- Goal Description -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ t.describeYourGoal }}
            </label>
            <textarea
              v-model="goalDescription"
              rows="3"
              class="input-field"
              :placeholder="t.goalPlaceholder"
              required
            ></textarea>
          </div>

          <!-- Target Weight (optional) -->
          <div v-if="selectedGoal === 'weight_loss' || selectedGoal === 'muscle_gain'">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ t.targetWeight }}
            </label>
            <input
              v-model.number="targetWeight"
              type="number"
              min="30"
              max="250"
              class="input-field"
              :placeholder="t.targetWeightExample"
            />
          </div>

          <!-- Target Event (optional) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ t.targetEvent }}
            </label>
            <input
              v-model="targetEvent"
              type="text"
              class="input-field"
              :placeholder="t.targetEventExample"
            />
          </div>

          <!-- Navigation -->
          <div class="flex justify-end">
            <button
              type="submit"
              :disabled="!selectedGoal || !goalDescription"
              class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
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

const selectedGoal = ref('')
const goalDescription = ref('')
const targetWeight = ref<number | undefined>()
const targetEvent = ref('')

const goals = [
  {
    type: 'weight_loss',
    title: t.weightLoss,
    description: t.weightLossDescription
  },
  {
    type: 'muscle_gain',
    title: t.muscleGain,
    description: t.muscleGainDescription
  },
  {
    type: 'endurance',
    title: t.endurance,
    description: t.enduranceDescription
  },
  {
    type: 'strength',
    title: t.strength,
    description: t.strengthDescription
  },
  {
    type: 'general_fitness',
    title: t.generalFitness,
    description: t.generalFitnessDescription
  }
]

function handleSubmit() {
  if (!selectedGoal.value || !goalDescription.value) return

  // Store goal data in localStorage for the onboarding flow
  const goalData = {
    type: selectedGoal.value,
    description: goalDescription.value,
    targetWeight: targetWeight.value,
    targetEvent: targetEvent.value
  }
  
  localStorage.setItem('onboarding-goal', JSON.stringify(goalData))
  
  // Navigate to next step
  router.push('/onboarding/constraints')
}
</script>
