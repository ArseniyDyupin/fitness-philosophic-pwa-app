<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="max-w-md w-full">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">AI Trainer</h1>
        <p class="text-gray-600">Step 2 of 5</p>
      </div>

      <div class="card">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">Do you have any health constraints?</h2>
        
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-3">Select any that apply:</label>
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
              Other constraints (optional)
            </label>
            <textarea
              v-model="customConstraints"
              rows="3"
              class="input-field"
              placeholder="Describe any other health conditions or limitations..."
            ></textarea>
          </div>

          <!-- Navigation -->
          <div class="flex justify-between">
            <button
              type="button"
              @click="$router.push('/onboarding/goals')"
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

const selectedConstraints = ref<string[]>([])
const customConstraints = ref('')

const constraints = [
  {
    id: 'back_pain',
    title: 'Back Pain',
    description: 'Lower back or spine issues'
  },
  {
    id: 'knee_problems',
    title: 'Knee Problems',
    description: 'Knee pain or injuries'
  },
  {
    id: 'shoulder_issues',
    title: 'Shoulder Issues',
    description: 'Shoulder pain or limited mobility'
  },
  {
    id: 'heart_condition',
    title: 'Heart Condition',
    description: 'Cardiovascular health concerns'
  },
  {
    id: 'diabetes',
    title: 'Diabetes',
    description: 'Type 1 or Type 2 diabetes'
  },
  {
    id: 'asthma',
    title: 'Asthma',
    description: 'Respiratory conditions'
  },
  {
    id: 'pregnancy',
    title: 'Pregnancy',
    description: 'Currently pregnant'
  },
  {
    id: 'recent_surgery',
    title: 'Recent Surgery',
    description: 'Recovering from surgery'
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
  router.push('/onboarding/equipment')
}
</script>
