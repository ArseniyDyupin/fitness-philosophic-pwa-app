<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="max-w-md w-full">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ t.aiTrainer }}</h1>
        <p class="text-gray-600">{{ t.step }} 3 {{ t.of }} 6</p>
      </div>

      <div class="card">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">{{ t.detailedGoals }}</h2>
        <p class="text-sm text-gray-600 mb-6">{{ t.goalsDescription }}</p>
        
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Detailed Goals Text Area -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ t.describeYourGoals }}
            </label>
            <textarea
              v-model="detailedGoals"
              rows="6"
              class="input-field"
              :placeholder="t.goalsPlaceholder"
              required
            ></textarea>
            <p class="text-xs text-gray-500 mt-1">
              {{ t.goalsDescription }}
            </p>
          </div>

          <!-- Navigation -->
          <div class="flex justify-between">
            <button
              type="button"
              @click="$router.push('/onboarding/constraints')"
              class="btn-secondary"
            >
              {{ t.back }}
            </button>
            <button
              type="submit"
              :disabled="!detailedGoals.trim()"
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

const detailedGoals = ref('')

function handleSubmit() {
  if (!detailedGoals.value.trim()) return

  // Store detailed goals data
  localStorage.setItem('onboarding-detailed-goals', detailedGoals.value)
  
  // Navigate to next step
  router.push('/onboarding/equipment')
}
</script>
