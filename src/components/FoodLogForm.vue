<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Calories -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Calories *
      </label>
      <input
        v-model.number="formData.calories"
        type="number"
        min="0"
        max="10000"
        class="input-field"
        required
      />
              <p class="text-xs text-gray-500 mt-1">
          {{ t.enterTotalCalories }}
        </p>
    </div>

    <!-- Macronutrients (Optional) -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Protein (g)
        </label>
        <input
          v-model.number="formData.protein"
          type="number"
          min="0"
          max="1000"
          class="input-field"
          :placeholder="t.optional"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Carbs (g)
        </label>
        <input
          v-model.number="formData.carbs"
          type="number"
          min="0"
          max="1000"
          class="input-field"
          :placeholder="t.optional"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Fat (g)
        </label>
        <input
          v-model.number="formData.fat"
          type="number"
          min="0"
          max="1000"
          class="input-field"
          :placeholder="t.optional"
        />
      </div>
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

    <!-- Notes -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Notes (optional)
      </label>
      <textarea
        v-model="formData.notes"
        rows="3"
        class="input-field"
        :placeholder="t.foodNotesPlaceholder"
      ></textarea>
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
        :disabled="isSubmitting"
        class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="isSubmitting">{{ t.saving }}</span>
        <span v-else>{{ editMode ? t.update : t.save }} {{ t.foodLog }}</span>
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useFoodStore } from '@/stores/food.store'
import { useI18nStore } from '@/stores/i18n.store'
import type { FoodLog } from '@/types/models'

const i18nStore = useI18nStore()
const { t } = i18nStore

interface Props {
  foodLog?: FoodLog
  editMode?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  editMode: false
})

const emit = defineEmits<{
  saved: [foodLog: FoodLog]
  cancel: []
}>()

const foodStore = useFoodStore()
const isSubmitting = ref(false)

// Form data
const formData = ref({
  calories: 0,
  protein: undefined as number | undefined,
  carbs: undefined as number | undefined,
  fat: undefined as number | undefined,
  date: new Date().toISOString().split('T')[0],
  notes: ''
})

// Initialize form with food log data if editing
onMounted(() => {
  if (props.foodLog) {
    formData.value = {
      calories: props.foodLog.calories,
      protein: props.foodLog.protein,
      carbs: props.foodLog.carbs,
      fat: props.foodLog.fat,
      date: new Date(props.foodLog.date).toISOString().split('T')[0],
      notes: props.foodLog.notes || ''
    }
  }
})

// Handle form submission
async function handleSubmit() {
  if (isSubmitting.value) return

  isSubmitting.value = true

  try {
    const foodData = {
      calories: formData.value.calories,
      protein: formData.value.protein,
      carbs: formData.value.carbs,
      fat: formData.value.fat,
      date: new Date(formData.value.date),
      notes: formData.value.notes || undefined
    }

    let foodLog: FoodLog

    if (props.editMode && props.foodLog) {
      foodLog = await foodStore.updateFoodLog(props.foodLog.id, foodData)
    } else {
      foodLog = await foodStore.addFoodLog(foodData)
    }

    emit('saved', foodLog)

    // Show success toast
    if ((window as any).showToast) {
      ;(window as any).showToast({
        type: 'success',
        message: props.editMode ? t.foodLogUpdated : t.foodLogSaved
      })
    }
  } catch (error) {
    console.error('Error saving food log:', error)
    
    // Show error toast
    if ((window as any).showToast) {
      ;(window as any).showToast({
        type: 'error',
        message: t.foodLogSaveFailed
      })
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>
