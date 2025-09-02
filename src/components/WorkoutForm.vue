<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Combined Workout Header -->
    <div class="bg-blue-50 p-4 rounded-lg">
      <h3 class="text-lg font-medium text-blue-900 mb-2">{{ t.combinedWorkout }}</h3>
      <p class="text-sm text-blue-700">
        {{ t.combinedWorkoutDescription || 'Add multiple exercises to create a comprehensive workout session.' }}
      </p>
    </div>

    <!-- Exercises List -->
    <div class="space-y-4">
      <div class="flex justify-between items-center">
        <h4 class="text-md font-medium text-gray-900">{{ t.exercises }}</h4>
        <button
          type="button"
          @click="addExercise"
          class="btn-secondary text-sm"
        >
          {{ t.addExercise }}
        </button>
      </div>

      <div v-for="(exercise, index) in exercises" :key="index" class="border rounded-lg p-4 bg-gray-50">
        <div class="flex justify-between items-start mb-3">
          <h5 class="font-medium text-gray-900">{{ t.exercise }} {{ index + 1 }}</h5>
          <button
            type="button"
            @click="removeExercise(index)"
            class="text-red-600 hover:text-red-700 text-sm"
            :disabled="exercises.length === 1"
          >
            {{ t.removeExercise }}
          </button>
        </div>

        <!-- Exercise Type -->
        <div class="mb-3">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ t.workoutType }}
          </label>
          <select
            v-model="exercise.type"
            class="input-field"
            required
          >
            <option value="">{{ t.selectWorkoutType }}</option>
            <option value="run">{{ t.run }}</option>
            <option value="pullups">{{ t.pullups }}</option>
            <option value="pushups">{{ t.pushups }}</option>
            <option value="plank">{{ t.plank }}</option>
            <option value="custom">{{ t.custom }}</option>
          </select>
        </div>

        <!-- Exercise Duration -->
        <div class="mb-3">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ t.durationMinutes }}
          </label>
          <input
            v-model.number="exercise.details.durationMin"
            type="number"
            min="1"
            max="480"
            class="input-field"
            required
          />
        </div>

        <!-- Dynamic Fields Based on Type -->
        <div v-if="exercise.type === 'run'" class="mb-3">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ t.distanceKm }}
          </label>
          <input
            v-model.number="exercise.details.distanceKm"
            type="number"
            step="0.1"
            min="0.1"
            max="100"
            class="input-field"
          />
          <p class="text-xs text-gray-500 mt-1">
            {{ t.distanceDescription }}
          </p>
        </div>

        <div v-if="exercise.type === 'pullups' || exercise.type === 'pushups'" class="mb-3">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ t.sets }}
              </label>
              <input
                v-model.number="exercise.details.sets"
                type="number"
                min="1"
                max="100"
                class="input-field"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ t.reps }}
              </label>
              <input
                v-model.number="exercise.details.repsPerSet"
                type="number"
                min="1"
                max="1000"
                class="input-field"
                placeholder="Reps per set"
              />
            </div>
          </div>
        </div>

        <div v-if="exercise.type === 'plank'" class="mb-3">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ t.seconds }}
          </label>
          <input
            v-model.number="exercise.details.seconds"
            type="number"
            min="10"
            max="3600"
            class="input-field"
          />
        </div>

        <div v-if="exercise.type === 'custom'" class="mb-3">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ t.exerciseName }}
          </label>
          <input
            v-model="exercise.details.notes"
            type="text"
            class="input-field"
            :placeholder="t.exerciseNamePlaceholder"
            required
          />
        </div>

        <!-- Exercise Notes -->
        <div class="mb-3">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ t.notes }} ({{ t.optional }})
          </label>
          <textarea
            v-model="exercise.details.notes"
            rows="2"
            class="input-field"
            :placeholder="t.notesPlaceholder"
          ></textarea>
        </div>
      </div>
    </div>

    <!-- Date -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        {{ t.date }}
      </label>
      <input
        v-model="formData.date"
        type="date"
        class="input-field"
        required
      />
    </div>

    <!-- RPE -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        {{ t.rpe }}
      </label>
      <select v-model="formData.rpe" class="input-field">
        <option value="">{{ t.selectRPE || 'Select RPE' }}</option>
        <option v-for="i in 10" :key="i" :value="i">{{ i }} - {{ getRPEDescription(i) }}</option>
      </select>
      <p class="text-xs text-gray-500 mt-1">
        {{ t.rpeDescription }}
      </p>
    </div>

    <!-- Workout Notes -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        {{ t.workoutNotes || 'Workout Notes' }} ({{ t.optional }})
      </label>
      <textarea
        v-model="formData.notes"
        rows="3"
        class="input-field"
        :placeholder="t.workoutNotesPlaceholder || 'How did the workout feel overall? Any observations?'"
      ></textarea>
    </div>

    <!-- Summary -->
    <div v-if="totalCalories > 0 || totalDuration > 0" class="bg-gray-50 rounded-lg p-4">
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span class="text-gray-600">{{ t.totalCalories }}:</span>
          <span class="font-semibold text-primary-600 ml-2">{{ totalCalories }} kcal</span>
        </div>
        <div>
          <span class="text-gray-600">{{ t.totalDuration }}:</span>
          <span class="font-semibold text-primary-600 ml-2">{{ totalDuration }} {{ t.minutes || 'min' }}</span>
        </div>
      </div>
    </div>

    <!-- Submit Button -->
    <div class="flex justify-end space-x-3">
      <button
        type="button"
        @click="$emit('cancel')"
        class="btn-secondary"
      >
        {{ t.cancel }}
      </button>
      <button
        type="submit"
        :disabled="isSubmitting || !isFormValid"
        class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="isSubmitting">{{ t.saving }}</span>
        <span v-else>{{ editMode ? t.update : t.save }} {{ t.workout }}</span>
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useWorkoutsStore } from '@/stores/workouts.store'
import { useProfileStore } from '@/stores/profile.store'
import { useI18nStore } from '@/stores/i18n.store'
import type { Workout, WorkoutExercise, WorkoutType } from '@/types/models'

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
const i18nStore = useI18nStore()

const { t } = i18nStore

const isSubmitting = ref(false)

// Form data
const formData = ref({
  date: new Date().toISOString().split('T')[0],
  notes: '',
  rpe: undefined as number | undefined
})

// Exercises array
const exercises = ref<WorkoutExercise[]>([
  {
    type: 'run',
    details: {
      durationMin: 30,
      distanceKm: undefined,
      sets: undefined,
      repsPerSet: undefined,
      seconds: undefined,
      notes: ''
    },
    kcalEstimated: undefined
  }
])

// Initialize form with workout data if editing
onMounted(() => {
  if (props.workout) {
    formData.value = {
      date: new Date(props.workout.date).toISOString().split('T')[0],
      notes: props.workout.exercises[0]?.details.notes || '',
      rpe: props.workout.rpe
    }
    exercises.value = [...props.workout.exercises]
  }
})

// Computed properties
const totalCalories = computed(() => {
  return exercises.value.reduce((total, exercise) => {
    return total + (exercise.kcalEstimated || 0)
  }, 0)
})

const totalDuration = computed(() => {
  return exercises.value.reduce((total, exercise) => {
    return total + (exercise.details.durationMin || 0)
  }, 0)
})

const isFormValid = computed(() => {
  return exercises.value.length > 0 && 
         exercises.value.every(exercise => 
           exercise.type && 
           exercise.details.durationMin && 
           exercise.details.durationMin > 0
         ) &&
         formData.value.date
})

// Methods
function addExercise() {
  exercises.value.push({
    type: 'run',
    details: {
      durationMin: 30,
      distanceKm: undefined,
      sets: undefined,
      repsPerSet: undefined,
      seconds: undefined,
      notes: ''
    },
    kcalEstimated: undefined
  })
}

function removeExercise(index: number) {
  if (exercises.value.length > 1) {
    exercises.value.splice(index, 1)
  }
}

function getRPEDescription(rpe: number): string {
  const descriptions: Record<number, string> = {
    1: t.rpeVeryEasy,
    2: t.rpeEasy,
    3: t.rpeLight,
    4: t.rpeModerate,
    5: t.rpeSomewhatHard,
    6: t.rpeHard,
    7: t.rpeVeryHard,
    8: t.rpeExtremelyHard,
    9: t.rpeMaximumEffort,
    10: t.rpeAbsoluteMaximum
  }
  return descriptions[rpe] || ''
}

async function handleSubmit() {
  if (!isFormValid.value) return

  isSubmitting.value = true

  try {
    const workoutData = {
      date: new Date(formData.value.date),
      exercises: exercises.value,
      rpe: formData.value.rpe,
      notes: formData.value.notes
    }

    let savedWorkout: Workout
    if (props.editMode && props.workout) {
      savedWorkout = await workoutsStore.updateWorkout(props.workout.id, workoutData)
    } else {
      savedWorkout = await workoutsStore.addWorkout(workoutData)
    }

    emit('saved', savedWorkout)
  } catch (error) {
    console.error('Error saving workout:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>
