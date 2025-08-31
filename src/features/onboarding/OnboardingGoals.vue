<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="max-w-md w-full">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Welcome to AI Trainer</h1>
        <p class="text-gray-600">Let's set up your fitness journey</p>
      </div>

      <div class="card">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">What's your main goal?</h2>
        
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Goal Type -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-3">Fitness Goal</label>
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
              Describe your goal in detail
            </label>
            <textarea
              v-model="goalDescription"
              rows="3"
              class="input-field"
              placeholder="e.g., I want to lose 10kg in 6 months to feel more confident..."
              required
            ></textarea>
          </div>

          <!-- Target Weight (optional) -->
          <div v-if="selectedGoal === 'weight_loss' || selectedGoal === 'muscle_gain'">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Target Weight (kg) - Optional
            </label>
            <input
              v-model.number="targetWeight"
              type="number"
              min="30"
              max="250"
              class="input-field"
              placeholder="e.g., 70"
            />
          </div>

          <!-- Target Event (optional) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Target Event or Date - Optional
            </label>
            <input
              v-model="targetEvent"
              type="text"
              class="input-field"
              placeholder="e.g., Summer vacation, Wedding, Marathon..."
            />
          </div>

          <!-- Navigation -->
          <div class="flex justify-end">
            <button
              type="submit"
              :disabled="!selectedGoal || !goalDescription"
              class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
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

const selectedGoal = ref('')
const goalDescription = ref('')
const targetWeight = ref<number | undefined>()
const targetEvent = ref('')

const goals = [
  {
    type: 'weight_loss',
    title: 'Weight Loss',
    description: 'Lose body fat and get leaner'
  },
  {
    type: 'muscle_gain',
    title: 'Muscle Gain',
    description: 'Build strength and muscle mass'
  },
  {
    type: 'endurance',
    title: 'Endurance',
    description: 'Improve cardiovascular fitness'
  },
  {
    type: 'strength',
    title: 'Strength',
    description: 'Increase overall strength'
  },
  {
    type: 'general_fitness',
    title: 'General Fitness',
    description: 'Stay healthy and active'
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
