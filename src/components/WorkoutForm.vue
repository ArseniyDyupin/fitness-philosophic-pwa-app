<template>
  <div class="w-full" style="min-width: 100%">
    <!-- Header -->
    <div class="mb-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">
        {{ props.editMode ? t.update : t.addWorkout }}
      </h2>

      <!-- Mode Toggle -->
      <div class="flex items-center space-x-2">
        <span class="text-sm text-gray-600">{{ t.workoutMode }}:</span>
        <div class="flex bg-gray-100 rounded-lg p-1">
          <button
            @click="setMode('form')"
            :class="[
              'px-3 py-1 text-sm font-medium rounded-md transition-colors',
              mode === 'form'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            ]"
          >
            {{ t.formMode }}
          </button>
          <button
            @click="setMode('text')"
            :class="[
              'px-3 py-1 text-sm font-medium rounded-md transition-colors',
              mode === 'text'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            ]"
          >
            {{ t.textMode }}
          </button>
        </div>
      </div>
    </div>

    <!-- Text Mode -->
    <div v-if="mode === 'text'" class="space-y-6">
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 class="text-sm font-medium text-blue-800 mb-2">{{ t.textModeDescription }}</h3>
        <p class="text-sm text-blue-700 mb-4">{{ t.textModeExample }}</p>

        <textarea
          v-model="workoutText"
          :placeholder="t.workoutDescriptionPlaceholder"
          class="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        ></textarea>

        <div class="mt-3 flex justify-between items-center">
          <p class="text-xs text-blue-600">{{ t.workoutDescriptionHelp }}</p>
          <button
            @click="parseWorkoutText"
            :disabled="!workoutText.trim() || isParsing"
            class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="isParsing">{{ t.parsing }}</span>
            <span v-else>{{ t.parseWorkout }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Form Mode -->
    <div v-if="mode === 'form'" class="space-y-6">
      <!-- Date and RPE -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">{{ t.date }}</label>
          <input
            v-model="formData.date"
            type="date"
            class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ t.rpe }} ({{ formData.rpe }}/10)
          </label>
          <div class="relative">
            <input
              v-model="formData.rpe"
              type="range"
              min="1"
              max="10"
              class="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <!-- RPE Visual Indicator -->
            <div class="mt-2 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                class="h-full transition-all duration-200 rounded-full"
                :class="getRPEColorClass(formData.rpe)"
                :style="{ width: (formData.rpe / 10) * 100 + '%' }"
              ></div>
            </div>
            <div class="flex justify-between text-xs text-gray-500 mt-1">
              <span>{{ t.rpeVeryEasy }}</span>
              <span>{{ t.rpeAbsoluteMax }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Exercises List -->
      <div class="space-y-4">
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-medium text-gray-900">{{ t.exercises }}</h3>
          <button @click="addExercise" class="btn-secondary flex items-center space-x-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              ></path>
            </svg>
            <span>{{ t.addExercise }}</span>
          </button>
        </div>

        <!-- Exercise Cards -->
        <div
          v-for="(exercise, index) in exercises"
          :key="index"
          class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
        >
          <!-- Exercise Header -->
          <div class="flex justify-between items-center mb-4">
            <h4 class="text-lg font-medium text-gray-900">
              {{ t.exercise }} {{ exercises.length - index }} —
              {{ getExerciseTypeLabel(exercise.type) }}
            </h4>
            <div class="flex items-center space-x-2">
              <button
                @click="cloneExercise(index)"
                class="text-gray-400 hover:text-blue-600 transition-colors p-1"
                :title="t.cloneExercise"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  ></path>
                </svg>
              </button>
              <button
                @click="removeExercise(index)"
                class="text-gray-400 hover:text-red-600 transition-colors p-1"
                :title="t.removeExercise"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  ></path>
                </svg>
              </button>
            </div>
          </div>

          <!-- Exercise Type -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ t.workoutType }}</label>
            <select
              v-model="exercise.type"
              @change="onExerciseTypeChange(index)"
              class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="run">{{ t.run }}</option>
              <option value="pullups">{{ t.pullups }}</option>
              <option value="pushups">{{ t.pushups }}</option>
              <option value="plank">{{ t.plank }}</option>
              <option value="custom">{{ t.custom }}</option>
            </select>
          </div>

          <!-- Exercise Details -->
          <div class="space-y-4">
            <!-- Run Type -->
            <div v-if="exercise.type === 'run'" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">{{
                  t.durationMinutes
                }}</label>
                <input
                  v-model.number="exercise.details.durationMin"
                  type="number"
                  min="1"
                  class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">{{
                  t.distanceKm
                }}</label>
                <input
                  v-model.number="exercise.details.distanceKm"
                  type="number"
                  step="0.1"
                  min="0"
                  class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <!-- Strength Type -->
            <div
              v-if="exercise.type === 'pullups' || exercise.type === 'pushups'"
              class="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">{{ t.sets }}</label>
                <input
                  v-model.number="exercise.details.sets"
                  type="number"
                  min="1"
                  class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">{{
                  t.repsPerSet
                }}</label>
                <div class="space-y-2">
                  <div
                    v-for="(rep, repIndex) in exercise.details.repsPerSet"
                    :key="repIndex"
                    class="flex items-center space-x-2"
                  >
                    <input
                      v-model.number="exercise.details.repsPerSet[repIndex]"
                      type="number"
                      min="1"
                      class="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <button
                      @click="removeRep(index, repIndex)"
                      class="text-red-500 hover:text-red-700 p-1"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M6 18L18 6M6 6l12 12"
                        ></path>
                      </svg>
                    </button>
                  </div>
                  <button
                    @click="addRep(index)"
                    class="text-sm text-primary-600 hover:text-primary-800 flex items-center space-x-1"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      ></path>
                    </svg>
                    <span>{{ t.addRep }}</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Plank Type -->
            <div v-if="exercise.type === 'plank'" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">{{
                  t.plankReps
                }}</label>
                <div class="space-y-2">
                  <div
                    v-for="(second, repIndex) in exercise.details.seconds"
                    :key="repIndex"
                    class="flex items-center space-x-2"
                  >
                    <input
                      v-model.number="exercise.details.seconds[repIndex]"
                      type="number"
                      min="1"
                      class="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <span class="text-sm text-gray-500">{{ t.seconds }}</span>
                    <button
                      @click="removePlankRep(index, repIndex)"
                      class="text-red-500 hover:text-red-700 p-1"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M6 18L18 6M6 6l12 12"
                        ></path>
                      </svg>
                    </button>
                  </div>
                  <button
                    @click="addPlankRep(index)"
                    class="text-sm text-primary-600 hover:text-primary-800 flex items-center space-x-1"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      ></path>
                    </svg>
                    <span>{{ t.addPlankRep }}</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Custom Type -->
            <div v-if="exercise.type === 'custom'" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">{{
                  t.exerciseName
                }}</label>
                <input
                  v-model="exercise.details.customExercise"
                  type="text"
                  :placeholder="t.exerciseNamePlaceholder"
                  class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <!-- Custom Exercise Mode Selection -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-3">{{
                  t.customExerciseMode
                }}</label>
                <div class="flex space-x-4">
                  <label class="flex items-center">
                    <input
                      v-model="exercise.details.customMode"
                      type="radio"
                      value="time_distance"
                      class="mr-2 text-primary-600 focus:ring-primary-500"
                    />
                    <span class="text-sm text-gray-700">{{ t.timeDistanceMode }}</span>
                  </label>
                  <label class="flex items-center">
                    <input
                      v-model="exercise.details.customMode"
                      type="radio"
                      value="sets_reps"
                      class="mr-2 text-primary-600 focus:ring-primary-500"
                    />
                    <span class="text-sm text-gray-700">{{ t.setsRepsMode }}</span>
                  </label>
                </div>
              </div>

              <!-- Time/Distance Mode Fields -->
              <div
                v-if="exercise.details.customMode === 'time_distance'"
                class="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">{{
                    t.durationMinutes
                  }}</label>
                  <input
                    v-model.number="exercise.details.durationMin"
                    type="number"
                    min="1"
                    class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">{{
                    t.distanceKm
                  }}</label>
                  <input
                    v-model.number="exercise.details.distanceKm"
                    type="number"
                    step="0.1"
                    min="0"
                    class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <!-- Sets/Reps Mode Fields -->
              <div
                v-if="exercise.details.customMode === 'sets_reps'"
                class="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">{{ t.sets }}</label>
                  <input
                    v-model.number="exercise.details.sets"
                    type="number"
                    min="1"
                    class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">{{
                    t.repsPerSet
                  }}</label>
                  <div class="space-y-2">
                    <div
                      v-for="(rep, repIndex) in exercise.details.repsPerSet"
                      :key="repIndex"
                      class="flex items-center space-x-2"
                    >
                      <input
                        v-model.number="exercise.details.repsPerSet[repIndex]"
                        type="number"
                        min="1"
                        class="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      <button
                        @click="removeRep(index, repIndex)"
                        class="text-red-500 hover:text-red-700 p-1"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M6 18L18 6M6 6l12 12"
                          ></path>
                        </svg>
                      </button>
                    </div>
                    <button
                      @click="addRep(index)"
                      class="text-sm text-primary-600 hover:text-primary-800 flex items-center space-x-1"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        ></path>
                      </svg>
                      <span>{{ t.addRep }}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Exercise Notes (Collapsible) -->
            <div class="border-t pt-4">
              <button
                @click="toggleExerciseNotes(index)"
                class="flex items-center justify-between w-full text-left text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                <span>{{ t.notes }}</span>
                <svg
                  :class="['w-4 h-4 transition-transform', exercise.showNotes ? 'rotate-180' : '']"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </button>
              <div v-if="exercise.showNotes" class="mt-3">
                <textarea
                  v-model="exercise.details.notes"
                  :placeholder="t.notesPlaceholder"
                  rows="3"
                  class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                ></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Summary Block -->
      <div class="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-6">{{ t.workoutSummary }}</h3>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="text-center">
            <div class="text-2xl font-bold text-primary-600">{{ exercises.length }}</div>
            <div class="text-sm text-gray-600">{{ t.exercises }}</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-green-600">{{ totalDuration }}</div>
            <div class="text-sm text-gray-600">{{ t.minutes }}</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-orange-600">{{ totalCalories }}</div>
            <div class="text-sm text-gray-600">{{ t.calories }}</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-purple-600">{{ formData.rpe }}</div>
            <div class="text-sm text-gray-600">{{ t.rpe }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Submit Button -->
    <div class="flex justify-end space-x-4 pt-8 border-t">
      <button @click="$emit('cancel')" class="btn-secondary">
        {{ t.cancel }}
      </button>
      <button
        @click="handleSubmit"
        :disabled="!isFormValid || isSubmitting"
        class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="isSubmitting">{{ t.saving }}</span>
        <span v-else>{{ props.editMode ? t.update : t.save }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useWorkoutsStore } from '@/stores/workouts.store'
import { useAIStore } from '@/stores/ai.store'
import { useI18nStore } from '@/stores/i18n.store'
import type { Workout, WorkoutExercise, WorkoutType } from '@/types/models'

const props = defineProps<{
  workout?: Workout
  editMode?: boolean
}>()

const emit = defineEmits<{
  saved: [workout: Workout]
  cancel: []
}>()

const workoutsStore = useWorkoutsStore()
const aiStore = useAIStore()
const i18nStore = useI18nStore()

const { t } = i18nStore

// State
const mode = ref<'form' | 'text'>('form')
const workoutText = ref('')
const isParsing = ref(false)
const isSubmitting = ref(false)

// Form data
const formData = ref({
  date: new Date().toISOString().split('T')[0],
  rpe: 5
})

// Exercises array
const exercises = ref<
  Array<
    WorkoutExercise & {
      showNotes?: boolean
      customMode?: 'time_distance' | 'sets_reps'
    }
  >
>([])

// Initialize form
onMounted(() => {
  if (props.editMode && props.workout) {
    // Edit mode - load existing workout
    formData.value.date = new Date(props.workout.date).toISOString().split('T')[0]
    formData.value.rpe = props.workout.rpe || 5

    exercises.value = props.workout.exercises.map((ex) => ({
      ...ex,
      showNotes: false,
      customMode:
        ex.type === 'custom' ? (ex.details.durationMin ? 'time_distance' : 'sets_reps') : undefined
    }))
  } else {
    // Add mode - create default exercise
    addExercise()
  }
})

// Computed properties
const isFormValid = computed(() => {
  if (mode.value === 'text') {
    return workoutText.value.trim().length > 0
  }

  return (
    exercises.value.length > 0 &&
    exercises.value.every((ex) => {
      if (ex.type === 'run') {
        return ex.details.durationMin && ex.details.durationMin > 0
      } else if (ex.type === 'pullups' || ex.type === 'pushups') {
        return (
          ex.details.sets &&
          ex.details.sets > 0 &&
          ex.details.repsPerSet &&
          ex.details.repsPerSet.length > 0
        )
      } else if (ex.type === 'plank') {
        return ex.details.seconds && ex.details.seconds.length > 0
      } else if (ex.type === 'custom') {
        if (!ex.details.customExercise || !ex.details.customExercise.trim()) return false
        if (ex.details.customMode === 'time_distance') {
          return ex.details.durationMin && ex.details.durationMin > 0
        } else if (ex.details.customMode === 'sets_reps') {
          return (
            ex.details.sets &&
            ex.details.sets > 0 &&
            ex.details.repsPerSet &&
            ex.details.repsPerSet.length > 0
          )
        }
        return false
      }
      return false
    })
  )
})

const totalDuration = computed(() => {
  return exercises.value.reduce((total, ex) => {
    if (ex.type === 'run') {
      return total + (ex.details.durationMin || 0)
    } else if (ex.type === 'pullups' || ex.type === 'pushups') {
      return total + (ex.details.sets || 0) * 2 // Estimate 2 minutes per set
    } else if (ex.type === 'plank') {
      return total + Math.ceil((ex.details.seconds || []).reduce((sum, sec) => sum + sec, 0) / 60)
    } else if (ex.type === 'custom') {
      if (ex.details.customMode === 'time_distance') {
        return total + (ex.details.durationMin || 0)
      } else if (ex.details.customMode === 'sets_reps') {
        return total + (ex.details.sets || 0) * 2
      }
    }
    return total + 5 // Default 5 minutes for other exercises
  }, 0)
})

const totalCalories = computed(() => {
  return exercises.value.reduce((total, ex) => {
    return total + (ex.kcalEstimated || 0)
  }, 0)
})

// Methods
function setMode(newMode: 'form' | 'text') {
  mode.value = newMode
  if (newMode === 'text') {
    exercises.value = []
  } else if (exercises.value.length === 0) {
    addExercise()
  }
}

function addExercise() {
  const newExercise: WorkoutExercise & {
    showNotes?: boolean
    customMode?: 'time_distance' | 'sets_reps'
  } = {
    type: 'run',
    details: {
      durationMin: 30,
      distanceKm: undefined,
      sets: undefined,
      repsPerSet: undefined,
      seconds: undefined,
      notes: '',
      customExercise: undefined
    },
    kcalEstimated: undefined,
    showNotes: false,
    customMode: undefined
  }
  // Add to the beginning of the array (newest first)
  exercises.value.unshift(newExercise)
}

function removeExercise(index: number) {
  exercises.value.splice(index, 1)
}

function cloneExercise(index: number) {
  const exercise = exercises.value[index]
  const cloned = JSON.parse(JSON.stringify(exercise))
  cloned.showNotes = false
  // Add cloned exercise to the beginning (newest first)
  exercises.value.unshift(cloned)
}

function onExerciseTypeChange(index: number) {
  const exercise = exercises.value[index]
  // Reset details when type changes
  exercise.details = {
    durationMin: exercise.type === 'run' ? 30 : undefined,
    distanceKm: undefined,
    sets: undefined,
    repsPerSet: exercise.type === 'pullups' || exercise.type === 'pushups' ? [10] : undefined,
    seconds: exercise.type === 'plank' ? [60] : undefined,
    notes: exercise.details.notes || '',
    customExercise: exercise.type === 'custom' ? '' : undefined
  }
  exercise.kcalEstimated = undefined
  exercise.customMode = exercise.type === 'custom' ? 'time_distance' : undefined
}

function addRep(exerciseIndex: number) {
  const exercise = exercises.value[exerciseIndex]
  if (!exercise.details.repsPerSet) {
    exercise.details.repsPerSet = []
  }
  exercise.details.repsPerSet.push(10)
}

function removeRep(exerciseIndex: number, repIndex: number) {
  const exercise = exercises.value[exerciseIndex]
  if (exercise.details.repsPerSet) {
    exercise.details.repsPerSet.splice(repIndex, 1)
  }
}

function addPlankRep(exerciseIndex: number) {
  const exercise = exercises.value[exerciseIndex]
  if (!exercise.details.seconds) {
    exercise.details.seconds = []
  }
  exercise.details.seconds.push(60)
}

function removePlankRep(exerciseIndex: number, repIndex: number) {
  const exercise = exercises.value[exerciseIndex]
  if (exercise.details.seconds) {
    exercise.details.seconds.splice(repIndex, 1)
  }
}

function toggleExerciseNotes(index: number) {
  exercises.value[index].showNotes = !exercises.value[index].showNotes
}

function getExerciseTypeLabel(type: WorkoutType): string {
  const typeMap: Record<WorkoutType, string> = {
    run: t.run,
    pullups: t.pullups,
    pushups: t.pushups,
    plank: t.plank,
    custom: t.custom
  }
  return typeMap[type] || type
}

function getRPEColorClass(rpe: number): string {
  if (rpe <= 2) return 'bg-green-500'
  if (rpe <= 4) return 'bg-blue-500'
  if (rpe <= 6) return 'bg-yellow-500'
  if (rpe <= 8) return 'bg-orange-500'
  return 'bg-red-500'
}

async function parseWorkoutText() {
  if (!workoutText.value.trim()) return

  isParsing.value = true

  try {
    const parsedExercises = await aiStore.parseWorkoutText(workoutText.value)

    // Transform parsed exercises to match our format
    exercises.value = parsedExercises.map((exercise: any) => {
      const cleanExercise: WorkoutExercise & {
        showNotes?: boolean
        customMode?: 'time_distance' | 'sets_reps'
      } = {
        type: exercise.type as WorkoutType,
        details: {
          distanceKm: exercise.details?.distanceKm || undefined,
          durationMin: exercise.details?.durationMin || 30,
          sets: exercise.details?.sets || undefined,
          repsPerSet: exercise.details?.repsPerSet ? [...exercise.details.repsPerSet] : undefined,
          seconds: Array.isArray(exercise.details?.seconds)
            ? [...exercise.details.seconds]
            : exercise.details?.seconds
              ? [exercise.details.seconds]
              : undefined,
          notes: exercise.details?.notes || '',
          customExercise: exercise.details?.customExercise || undefined
        },
        kcalEstimated: exercise.kcalEstimated || undefined,
        showNotes: false,
        customMode:
          exercise.type === 'custom'
            ? exercise.details?.durationMin
              ? 'time_distance'
              : 'sets_reps'
            : undefined
      }
      return cleanExercise
    })

    // Switch to form mode to show parsed exercises
    mode.value = 'form'

    // Show success message
    if ((window as any).showToast) {
      ;(window as any).showToast({
        type: 'success',
        message: t.workoutParsedSuccess
      })
    }
  } catch (error) {
    console.error('Error parsing workout text:', error)

    if ((window as any).showToast) {
      ;(window as any).showToast({
        type: 'error',
        message: t.workoutParsedFailed
      })
    }
  } finally {
    isParsing.value = false
  }
}

async function handleSubmit() {
  if (!isFormValid.value) return

  isSubmitting.value = true

  try {
    let workoutData: any

    if (mode.value === 'text') {
      // In text mode, we need to parse the text first
      if (!workoutText.value.trim()) {
        throw new Error('Workout text is required')
      }

      const parsedExercises = await aiStore.parseWorkoutText(workoutText.value)

      // Transform parsed exercises to match our format
      const exercises = parsedExercises.map((exercise: any) => {
        const cleanExercise: WorkoutExercise = {
          type: exercise.type as WorkoutType,
          details: {
            distanceKm: exercise.details?.distanceKm || undefined,
            durationMin: exercise.details?.durationMin || 30,
            sets: exercise.details?.sets || undefined,
            repsPerSet: exercise.details?.repsPerSet ? [...exercise.details.repsPerSet] : undefined,
            seconds: Array.isArray(exercise.details?.seconds)
              ? [...exercise.details.seconds]
              : exercise.details?.seconds
                ? [exercise.details.seconds]
                : undefined,
            notes: exercise.details?.notes || '',
            customExercise: exercise.details?.customExercise || undefined
          },
          kcalEstimated: exercise.kcalEstimated || undefined
        }
        return cleanExercise
      })

      workoutData = {
        date: new Date(formData.value.date),
        exercises,
        rpe: formData.value.rpe
      }
          } else {
        // In form mode, use existing exercises
      workoutData = {
        date: new Date(formData.value.date),
        exercises: exercises.value.map((exercise) => {
          // Create clean exercise object without UI-specific fields and reactivity
          const cleanExercise: WorkoutExercise = {
            type: exercise.type,
            details: {
              distanceKm: exercise.details.distanceKm || undefined,
              durationMin: exercise.details.durationMin || undefined,
              sets: exercise.details.sets || undefined,
              repsPerSet: exercise.details.repsPerSet ? [...exercise.details.repsPerSet] : undefined,
              seconds: exercise.details.seconds ? [...exercise.details.seconds] : undefined,
              notes: exercise.details.notes || '',
              customExercise: exercise.details.customExercise || undefined
            },
            kcalEstimated: exercise.kcalEstimated || undefined
          }
          return cleanExercise
        }),
        rpe: formData.value.rpe
      }
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

    if ((window as any).showToast) {
      ;(window as any).showToast({
        type: 'error',
        message: t.workoutSaveFailed
      })
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.slider::-webkit-slider-thumb {
  appearance: none;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
}

.slider::-moz-range-thumb {
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: none;
}
</style>
