<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="max-w-md w-full">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">AI Trainer</h1>
        <p class="text-gray-600">Step 4 of 5</p>
      </div>

      <div class="card">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">Tell us about yourself</h2>
        
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Name *
            </label>
            <input
              v-model="formData.name"
              type="text"
              class="input-field"
              placeholder="Your name"
              required
            />
          </div>

          <!-- Age -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Age *
            </label>
            <input
              v-model.number="formData.age"
              type="number"
              min="12"
              max="90"
              class="input-field"
              placeholder="Your age"
              required
            />
          </div>

          <!-- Gender -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Gender *
            </label>
            <select v-model="formData.gender" class="input-field" required>
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <!-- Height -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Height (cm) *
            </label>
            <input
              v-model.number="formData.height"
              type="number"
              min="100"
              max="250"
              class="input-field"
              placeholder="Height in centimeters"
              required
            />
          </div>

          <!-- Weight -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Current Weight (kg) *
            </label>
            <input
              v-model.number="formData.weight"
              type="number"
              min="30"
              max="250"
              step="0.1"
              class="input-field"
              placeholder="Weight in kilograms"
              required
            />
          </div>

          <!-- Navigation -->
          <div class="flex justify-between">
            <button
              type="button"
              @click="$router.push('/onboarding/equipment')"
              class="btn-secondary"
            >
              Back
            </button>
            <button
              type="submit"
              :disabled="!isFormValid"
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const formData = ref({
  name: '',
  age: 25,
  gender: '',
  height: 170,
  weight: 70
})

const isFormValid = computed(() => {
  return formData.value.name.trim() && 
         formData.value.age >= 12 && 
         formData.value.age <= 90 &&
         formData.value.gender &&
         formData.value.height >= 100 && 
         formData.value.height <= 250 &&
         formData.value.weight >= 30 && 
         formData.value.weight <= 250
})

function handleSubmit() {
  if (!isFormValid.value) return

  // Store metrics data
  localStorage.setItem('onboarding-metrics', JSON.stringify(formData.value))
  
  // Navigate to next step
  router.push('/onboarding/frequency')
}
</script>
