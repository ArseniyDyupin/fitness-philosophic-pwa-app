<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="max-w-md w-full">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ t.aiTrainer }}</h1>
        <p class="text-gray-600">{{ t.step }} 5 {{ t.of }} 6</p>
      </div>

      <div class="card">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">{{ t.tellUsAboutYourself }}</h2>
        
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ t.name }} *
            </label>
            <input
              v-model="formData.name"
              type="text"
              class="input-field"
              :placeholder="t.yourName"
              required
            />
          </div>

          <!-- Age -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ t.age }} *
            </label>
            <input
              v-model.number="formData.age"
              type="number"
              min="12"
              max="90"
              class="input-field"
              :placeholder="t.yourAge"
              required
            />
          </div>

          <!-- Gender -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ t.gender }} *
            </label>
            <select v-model="formData.gender" class="input-field" required>
              <option value="">{{ t.selectGender }}</option>
              <option value="male">{{ t.male }}</option>
              <option value="female">{{ t.female }}</option>
              <option value="other">{{ t.other }}</option>
            </select>
          </div>

          <!-- Height -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ t.height }} *
            </label>
            <input
              v-model.number="formData.height"
              type="number"
              min="100"
              max="250"
              class="input-field"
              :placeholder="t.yourHeight"
              required
            />
          </div>

          <!-- Weight -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ t.yourWeight }} *
            </label>
            <input
              v-model.number="formData.weight"
              type="number"
              min="30"
              max="250"
              step="0.1"
              class="input-field"
              :placeholder="t.weightInKg"
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
              {{ t.back }}
            </button>
            <button
              type="submit"
              :disabled="!isFormValid"
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18nStore } from '@/stores/i18n.store'

const router = useRouter()
const i18nStore = useI18nStore()

const { t } = i18nStore

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

async function handleSubmit() {
  if (!isFormValid.value) return

  // Store metrics data for the next step
  localStorage.setItem('onboarding-metrics', JSON.stringify(formData.value))
  
  // Navigate to next step
  router.push('/onboarding/frequency')
}
</script>
