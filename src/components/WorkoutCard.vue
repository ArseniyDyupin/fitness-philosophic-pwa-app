<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
    <!-- Debug Info -->
    <div class="bg-red-100 p-2 text-xs text-red-800">
      Debug: {{ JSON.stringify(workout, null, 2) }}
    </div>
    
    <!-- Workout Header -->
    <div class="p-4 border-b border-gray-200">
      <div class="flex items-center justify-between mb-3">
        <div>
          <h3 class="text-lg font-semibold text-gray-900">{{ formatDate(workout.date) }}</h3>
          <div class="text-sm text-gray-600">
            {{ getTotalDuration(workout) }} {{ t.minutes }} •88 {{ getTotalCalories(workout) }} {{ t.calories }}
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <!-- RPE Status -->
          <div v-if="workout.rpe" class="flex items-center space-x-2">
            <div 
              class="w-3 h-3 rounded-full"
              :class="getRPEColorClass(workout.rpe)"
            ></div>
            <span class="text-sm font-medium text-gray-700">RPE {{ workout.rpe }}/10</span>
          </div>
          
          <!-- AI Button -->
          <button
            v-if="aiStore.hasApiKey"
            @click.stop="analyzeWithAI"
            class="btn-secondary text-sm px-3 py-1"
            :disabled="isAnalyzing"
          >
            <span v-if="isAnalyzing">{{ t.analyzing }}</span>
            <span v-else>{{ t.analyzeWithAI }}</span>
          </button>
          
          <!-- Expand/Collapse Button -->
          <button
            @click="toggleExpanded"
            class="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <svg 
              :class="['w-5 h-5 transition-transform', expanded ? 'rotate-180' : '']"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
        </div>
      </div>
      
      <!-- Quick Stats -->
      <div class="flex items-center space-x-4 text-sm text-gray-500">
        <span>{{ workout.exercises.length }} {{ workout.exercises.length === 1 ? t.exercise : t.exercises }}</span>
        <span>{{ formatTime(workout.date) }}</span>
      </div>
    </div>

    <!-- Expanded Content -->
    <div v-if="expanded" class="border-t border-gray-200">
      <!-- Exercises List -->
      <div class="p-4 space-y-3">
        <h4 class="font-medium text-gray-900 mb-3">{{ t.exercises }}</h4>
        <div 
          v-for="(exercise, index) in workout.exercises" 
          :key="index"
          class="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg"
        >
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <span class="text-sm font-medium text-primary-700">{{ getExerciseIcon(exercise.type) }}</span>
            </div>
            <div>
              <div class="font-medium text-gray-900">{{ getExerciseTypeLabel(exercise.type) }}</div>
              <div class="text-sm text-gray-600">{{ getExerciseDetails(exercise) }}</div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-sm font-medium text-gray-900">{{ exercise.kcalEstimated || 0 }} {{ t.calories }}</div>
            <div v-if="exercise.details.notes" class="text-xs text-gray-500 max-w-xs truncate mt-1">
              {{ exercise.details.notes }}
            </div>
          </div>
        </div>
      </div>

      <!-- Workout Notes -->
      <div v-if="hasWorkoutNotes(workout)" class="px-4 pb-4">
        <div class="pt-3 border-t border-gray-200">
          <div class="text-sm text-gray-600">
            <span class="font-medium">{{ t.notes }}:</span>
            <span class="ml-2">{{ getWorkoutNotes(workout) }}</span>
          </div>
        </div>
      </div>

      <!-- View Details Button -->
      <div class="px-4 pb-4">
        <button
          @click="viewDetails"
          class="w-full btn-primary text-sm py-2"
        >
          {{ t.viewDetails }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAIStore } from '@/stores/ai.store'
import { useI18nStore } from '@/stores/i18n.store'
import { format } from 'date-fns'
import type { Workout, WorkoutExercise } from '@/types/models'

const props = defineProps<{
  workout: Workout
}>()

const router = useRouter()
const aiStore = useAIStore()
const i18nStore = useI18nStore()

const { t } = i18nStore

// State
const expanded = ref(false)
const isAnalyzing = ref(false)

// Methods
function toggleExpanded() {
  expanded.value = !expanded.value
}

// Debug: Log workout data when component mounts
console.log('WorkoutCard received workout:', props.workout)
console.log('Workout exercises:', props.workout.exercises)
console.log('Workout date:', props.workout.date)
console.log('Workout RPE:', props.workout.rpe)

function viewDetails() {
  router.push(`/workouts/${props.workout.id}`)
}

function formatDate(date: Date) {
  return format(date, 'dd.MM.yyyy')
}

function formatTime(date: Date) {
  return format(date, 'HH:mm')
}

function getExerciseIcon(type: string): string {
  const iconMap: Record<string, string> = {
    run: '🏃',
    pullups: '💪',
    pushups: '💪',
    plank: '🤸',
    custom: '⚡'
  }
  return iconMap[type] || '⚡'
}

function getExerciseTypeLabel(type: string) {
  const typeMap: Record<string, string> = {
    run: t.run,
    pullups: t.pullups,
    pushups: t.pushups,
    plank: t.plank,
    custom: t.custom
  }
  return typeMap[type] || type
}

function getExerciseDetails(exercise: WorkoutExercise): string {
  switch (exercise.type) {
    case 'run':
      return `${exercise.details.durationMin || 0} ${t.minutes}${exercise.details.distanceKm ? `, ${exercise.details.distanceKm} ${t.km}` : ''}`
    case 'pullups':
    case 'pushups':
      const totalReps = exercise.details.repsPerSet?.reduce((a, b) => a + b, 0) || 0
      return `${exercise.details.sets || 0} ${t.sets} × ${totalReps} ${t.reps}`
    case 'plank':
      const totalSeconds = exercise.details.seconds?.reduce((a, b) => a + b, 0) || 0
      return `${exercise.details.seconds?.length || 0} × ${Math.floor(totalSeconds / 60)}:${(totalSeconds % 60).toString().padStart(2, '0')}`
    case 'custom':
      if (exercise.details.customExercise) {
        if (exercise.details.durationMin) {
          return `${exercise.details.durationMin} ${t.minutes}${exercise.details.distanceKm ? `, ${exercise.details.distanceKm} ${t.km}` : ''}`
        } else if (exercise.details.sets) {
          const totalReps = exercise.details.repsPerSet?.reduce((a, b) => a + b, 0) || 0
          return `${exercise.details.sets} ${t.sets} × ${totalReps} ${t.reps}`
        }
        return exercise.details.customExercise
      }
      return t.custom
    default:
      return ''
  }
}

function getTotalCalories(workout: Workout): number {
  return workout.exercises.reduce((total: number, exercise: WorkoutExercise) => {
    return total + (exercise.kcalEstimated || 0)
  }, 0)
}

function getTotalDuration(workout: Workout): number {
  return workout.exercises.reduce((total: number, exercise: WorkoutExercise) => {
    if (exercise.type === 'run') {
      return total + (exercise.details.durationMin || 0)
    } else if (exercise.type === 'pullups' || exercise.type === 'pushups') {
      return total + (exercise.details.sets || 0) * 2 // Estimate 2 minutes per set
    } else if (exercise.type === 'plank') {
      const totalSeconds = exercise.details.seconds?.reduce((a, b) => a + b, 0) || 0
      return total + Math.ceil(totalSeconds / 60)
    } else if (exercise.type === 'custom') {
      if (exercise.details.durationMin) {
        return total + exercise.details.durationMin
      } else if (exercise.details.sets) {
        return total + (exercise.details.sets * 2)
      }
    }
    return total + 5 // Default 5 minutes for other exercises
  }, 0)
}

function getRPEColorClass(rpe: number): string {
  if (rpe <= 3) return 'bg-green-500'
  if (rpe <= 6) return 'bg-yellow-500'
  return 'bg-red-500'
}

function hasWorkoutNotes(workout: Workout): boolean {
  return workout.exercises.some(exercise => exercise.details.notes && exercise.details.notes.trim())
}

function getWorkoutNotes(workout: Workout): string {
  const notes = workout.exercises
    .map(exercise => exercise.details.notes)
    .filter(note => note && note.trim())
    .join(', ')
  return notes
}

async function analyzeWithAI() {
  if (!props.workout.id) return
  
  isAnalyzing.value = true
  try {
    await aiStore.reviewWorkout(props.workout.id)
    // Redirect to workout details page to see AI analysis
    router.push(`/workouts/${props.workout.id}`)
  } catch (error) {
    console.error('Failed to analyze workout:', error)
  } finally {
    isAnalyzing.value = false
  }
}
</script>
