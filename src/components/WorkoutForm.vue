<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Workout Type Selection -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Workout Type
      </label>
      <select
        v-model="formData.type"
        class="input-field"
        required
      >
        <option value="">Select workout type</option>
        <option value="run">Running</option>
        <option value="pullups">Pull-ups</option>
        <option value="pushups">Push-ups</option>
        <option value="plank">Plank</option>
        <option value="custom">Custom Exercise</option>
      </select>
    </div>

    <!-- Duration -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Duration (minutes)
      </label>
      <input
        v-model.number="formData.durationMin"
        type="number"
        min="1"
        max="480"
        class="input-field"
        required
      />
      <p class="text-xs text-gray-500 mt-1">
        Enter duration in minutes (1-480)
      </p>
    </div>

    <!-- Date -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Date
      </label>
      <input
        v-model="formData.date"
        type="date"
        class="input-field"
        required
      />
    </div>

    <!-- Dynamic Fields Based on Type -->
    <div v-if="formData.type === 'run'">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Distance (km)
      </label>
      <input
        v-model.number="formData.distance"
        type="number"
        step="0.1"
        min="0.1"
        max="100"
        class="input-field"
      />
      <p class="text-xs text-gray-500 mt-1">
        Optional: Enter distance for more accurate calorie calculation
      </p>
    </div>

    <div v-if="formData.type === 'pullups' || formData.type === 'pushups'">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Reps
          </label>
          <input
            v-model.number="formData.reps"
            type="number"
            min="1"
            max="1000"
            class="input-field"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Sets
          </label>
          <input
            v-model.number="formData.sets"
            type="number"
            min="1"
            max="100"
            class="input-field"
          />
        </div>
      </div>
    </div>

    <div v-if="formData.type === 'custom'">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Exercise Name
      </label>
      <input
        v-model="formData.customExercise"
        type="text"
        class="input-field"
        placeholder="e.g., Burpees, Mountain Climbers"
        required
      />
    </div>

    <!-- Notes -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Notes (optional)
      </label>
      <textarea
        v-model="formData.notes"
        rows="3"
        class="input-field"
        placeholder="How did the workout feel? Any observations?"
      ></textarea>
    </div>

    <!-- Calorie Preview -->
    <div v-if="estimatedCalories > 0" class="bg-gray-50 rounded-lg p-4">
      <div class="text-sm text-gray-600">
        Estimated calories burned: 
        <span class="font-semibold text-primary-600">{{ estimatedCalories }} kcal</span>
      </div>
    </div>

    <!-- Submit Button -->
    <div class="flex justify-end space-x-3">
      <button
        type="button"
        @click="$emit('cancel')"
        class="btn-secondary"
      >
        Cancel
      </button>
      <button
        type="submit"
        :disabled="isSubmitting"
        class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="isSubmitting">Saving...</span>
        <span v-else>{{ editMode ? 'Update' : 'Save' }} Workout</span>
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useWorkoutsStore } from '@/stores/workouts.store'
import { useProfileStore } from '@/stores/profile.store'
import { calculateWorkoutCalories } from '@/services/kcal'
import type { Workout, WorkoutType } from '@/types/models'

interface Props {
  workout?: Workout
  editMode?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  editMode: false
})

const emit = defineEmits<{
  saved: [workout: Workout]
  cancel: []
}>()

const workoutsStore = useWorkoutsStore()
const profileStore = useProfileStore()

const isSubmitting = ref(false)

// Form data
const formData = ref({
  type: '' as WorkoutType,
  durationMin: 30,
  date: new Date().toISOString().split('T')[0],
  distance: undefined as number | undefined,
  reps: undefined as number | undefined,
  sets: undefined as number | undefined,
  customExercise: '',
  notes: ''
})

// Initialize form with workout data if editing
onMounted(() => {
  if (props.workout) {
    formData.value = {
      type: props.workout.type,
      durationMin: props.workout.durationMin,
      date: new Date(props.workout.date).toISOString().split('T')[0],
      distance: props.workout.distance,
      reps: props.workout.reps,
      sets: props.workout.sets,
      customExercise: props.workout.customExercise || '',
      notes: props.workout.notes || ''
    }
  }
})

// Calculate estimated calories
const estimatedCalories = computed(() => {
  if (!formData.value.type || !formData.value.durationMin || !profileStore.currentWeight) {
    return 0
  }

  try {
    const calculation = calculateWorkoutCalories(
      formData.value.type,
      profileStore.currentWeight,
      formData.value.durationMin,
      {
        distance: formData.value.distance,
        reps: formData.value.reps,
        sets: formData.value.sets
      }
    )
    return calculation.calories
  } catch {
    return 0
  }
})

// Handle form submission
async function handleSubmit() {
  if (isSubmitting.value) return

  isSubmitting.value = true

  try {
    const workoutData = {
      type: formData.value.type,
      durationMin: formData.value.durationMin,
      date: new Date(formData.value.date),
      distance: formData.value.distance,
      reps: formData.value.reps,
      sets: formData.value.sets,
      customExercise: formData.value.customExercise || undefined,
      notes: formData.value.notes || undefined
    }

    let workout: Workout

    if (props.editMode && props.workout) {
      workout = await workoutsStore.updateWorkout(props.workout.id, workoutData)
    } else {
      workout = await workoutsStore.addWorkout(workoutData)
    }

    emit('saved', workout)

    // Show success toast
    if ((window as any).showToast) {
      ;(window as any).showToast({
        type: 'success',
        message: props.editMode ? 'Workout updated successfully!' : 'Workout saved successfully!'
      })
    }
  } catch (error) {
    console.error('Error saving workout:', error)
    
    // Show error toast
    if ((window as any).showToast) {
      ;(window as any).showToast({
        type: 'error',
        message: 'Failed to save workout. Please try again.'
      })
    }
  } finally {
    isSubmitting.value = false
  }
}

// Reset form when type changes
watch(() => formData.value.type, (newType) => {
  // Reset type-specific fields when type changes
  if (newType !== 'run') formData.value.distance = undefined
  if (newType !== 'pullups' && newType !== 'pushups') {
    formData.value.reps = undefined
    formData.value.sets = undefined
  }
  if (newType !== 'custom') formData.value.customExercise = ''
})
</script>
