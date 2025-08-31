<template>
  <div class="bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg p-6 border border-primary-200">
    <!-- Analysis Section -->
    <div class="mb-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-2">AI Analysis</h3>
      <p class="text-gray-700 leading-relaxed">{{ plan.analysis }}</p>
    </div>

    <!-- Next Workout Section -->
    <div class="bg-white rounded-lg p-4 border border-gray-200">
      <h4 class="text-md font-semibold text-gray-900 mb-3">Next Workout</h4>
      
      <div class="space-y-3">
        <!-- Workout Type and Duration -->
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <span class="text-xs font-medium text-primary-600">
                {{ getWorkoutTypeIcon(plan.nextWorkout.type) }}
              </span>
            </div>
            <div class="ml-3">
              <div class="text-sm font-medium text-gray-900">
                {{ formatWorkoutType(plan.nextWorkout.type) }}
              </div>
              <div class="text-xs text-gray-500">
                {{ plan.nextWorkout.durationMin }} minutes
              </div>
            </div>
          </div>
          <button
            @click="startWorkout"
            class="btn-primary text-sm px-4 py-2"
          >
            Start
          </button>
        </div>

        <!-- Description -->
        <div class="text-sm text-gray-700 bg-gray-50 rounded p-3">
          {{ plan.nextWorkout.description }}
        </div>

        <!-- Tips -->
        <div v-if="plan.nextWorkout.tips.length > 0">
          <h5 class="text-sm font-medium text-gray-900 mb-2">Tips:</h5>
          <ul class="space-y-1">
            <li
              v-for="(tip, index) in plan.nextWorkout.tips"
              :key="index"
              class="text-sm text-gray-600 flex items-start"
            >
              <span class="text-primary-500 mr-2">•</span>
              {{ tip }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AIPlan } from '@/types/models'

interface Props {
  plan: AIPlan | any
}

defineProps<Props>()

// Methods
function formatWorkoutType(type: string): string {
  const types: Record<string, string> = {
    run: 'Running',
    pullups: 'Pull-ups',
    pushups: 'Push-ups',
    plank: 'Plank',
    custom: 'Custom Exercise'
  }
  return types[type] || type
}

function getWorkoutTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    run: '🏃',
    pullups: '💪',
    pushups: '🏋️',
    plank: '🧘',
    custom: '⚡'
  }
  return icons[type] || '⚡'
}

function startWorkout() {
  // This would navigate to the workout form with pre-filled data
  // For now, we'll just show a toast
  if ((window as any).showToast) {
    ;(window as any).showToast({
      type: 'info',
      message: 'Starting workout...',
      duration: 3000
    })
  }
}
</script>
