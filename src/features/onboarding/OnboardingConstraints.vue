<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="max-w-md w-full">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ t.aiTrainer }}</h1>
        <p class="text-gray-600">{{ t.step }} 2 {{ t.of }} 6</p>
      </div>

      <div class="card">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">{{ t.doYouHaveConstraints }}</h2>
        
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-3">{{ t.selectConstraints }}</label>
            <div class="space-y-3">
              <label 
                v-for="constraint in constraints" 
                :key="constraint.id"
                class="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                :class="selectedConstraints.includes(constraint.id) ? 'border-primary-500 bg-primary-50' : 'border-gray-200'"
              >
                <input
                  type="checkbox"
                  :value="constraint.id"
                  v-model="selectedConstraints"
                  class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <div class="ml-3">
                  <div class="text-sm font-medium text-gray-900">{{ constraint.title }}</div>
                  <div class="text-sm text-gray-500">{{ constraint.description }}</div>
                </div>
              </label>
            </div>
          </div>

          <!-- Custom Constraint -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ t.otherConstraints }}
            </label>
            <textarea
              v-model="customConstraints"
              rows="3"
              class="input-field"
              :placeholder="t.otherConstraintsPlaceholder"
            ></textarea>
          </div>

          <!-- Navigation -->
          <div class="flex justify-between">
            <button
              type="button"
              @click="$router.push('/onboarding/goals')"
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

const selectedConstraints = ref<string[]>([])
const customConstraints = ref('')

const constraints = [
  {
    id: 'back_pain',
    title: t.backPain,
    description: t.backPainDescription
  },
  {
    id: 'knee_problems',
    title: t.kneeProblems,
    description: t.kneeProblemsDescription
  },
  {
    id: 'shoulder_issues',
    title: t.shoulderIssues,
    description: t.shoulderIssuesDescription
  },
  {
    id: 'heart_condition',
    title: t.heartCondition,
    description: t.heartConditionDescription
  },
  {
    id: 'diabetes',
    title: t.diabetes,
    description: t.diabetesDescription
  },
  {
    id: 'asthma',
    title: t.asthma,
    description: t.asthmaDescription
  },
  {
    id: 'pregnancy',
    title: t.pregnancy,
    description: t.pregnancyDescription
  },
  {
    id: 'recent_surgery',
    title: t.recentSurgery,
    description: t.recentSurgeryDescription
  }
]

function handleSubmit() {
  // Combine selected constraints with custom ones
  let allConstraints = [...selectedConstraints.value]
  
  if (customConstraints.value.trim()) {
    allConstraints.push(customConstraints.value.trim())
  }
  
  // Store constraints data
  localStorage.setItem('onboarding-constraints', JSON.stringify(allConstraints))
  
  // Navigate to next step
  router.push('/onboarding/detailed-goals')
}
</script>
