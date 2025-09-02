<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Weight -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        {{ t.currentWeight }} (kg) *
      </label>
      <input
        v-model.number="formData.weight"
        type="number"
        min="30"
        max="250"
        step="0.1"
        class="input-field"
        required
      />
    </div>

    <!-- Waist (optional) -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        {{ t.waistCircumference }} (cm) - {{ t.optional }}
      </label>
      <input
        v-model.number="formData.waist"
        type="number"
        min="50"
        max="200"
        step="0.1"
        class="input-field"
        :placeholder="t.optional"
      />
    </div>

    <!-- Notes -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        {{ t.notes }} ({{ t.optional }})
      </label>
      <textarea
        v-model="formData.notes"
        rows="3"
        class="input-field"
        :placeholder="t.weeklyNotesPlaceholder"
      ></textarea>
    </div>

    <!-- Photo Section -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        {{ t.progressPhoto }} ({{ t.optional }})
      </label>
      <div class="space-y-3">
        <div v-if="formData.photo" class="relative">
          <img 
            :src="formData.photo" 
            :alt="t.progressPhoto" 
            class="w-full h-48 object-cover rounded-lg"
          />
          <button
            type="button"
            @click="removePhoto"
            class="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <button
          v-if="!formData.photo"
          type="button"
          @click="capturePhoto"
          class="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors"
        >
          <div class="text-center">
            <svg class="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            <span class="text-sm">{{ t.takePhoto }}</span>
          </div>
        </button>
      </div>
    </div>

    <!-- Photo Privacy Settings -->
    <div v-if="formData.photo" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <svg class="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-yellow-800">{{ t.photoPrivacy }}</h3>
          <div class="mt-2 text-sm text-yellow-700">
            <p class="mb-2">{{ t.photoPrivacyDescription }}</p>
            <label class="flex items-center">
              <input
                v-model="formData.allowPhotoInAI"
                type="checkbox"
                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span class="ml-2 text-sm">{{ t.allowPhotoInAIDescription }}</span>
            </label>
            <p class="mt-2 text-xs">{{ t.photoPrivacyNote }}</p>
          </div>
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
        :disabled="isSubmitting"
        class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="isSubmitting">{{ t.saving }}</span>
        <span v-else>{{ t.saveCheckin }}</span>
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCheckinsStore } from '@/stores/checkins.store'
import { useI18nStore } from '@/stores/i18n.store'
import { photoService } from '@/services/photo'
import type { WeeklyCheckin } from '@/types/models'

const i18nStore = useI18nStore()
const { t } = i18nStore

interface Props {
  checkin?: WeeklyCheckin
  editMode?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  editMode: false
})

const emit = defineEmits<{
  saved: [checkin: WeeklyCheckin]
  cancel: []
}>()

const checkinsStore = useCheckinsStore()
const isSubmitting = ref(false)

// Form data
const formData = ref({
  weight: 0,
  waist: undefined as number | undefined,
  notes: '',
  photo: '',
  allowPhotoInAI: false
})

// Initialize form with checkin data if editing
onMounted(() => {
  if (props.checkin) {
    formData.value = {
      weight: props.checkin.weight,
      waist: props.checkin.waist,
      notes: props.checkin.notes || '',
      photo: props.checkin.photo || '',
      allowPhotoInAI: props.checkin.allowPhotoInAI
    }
  }
})

// Methods
async function capturePhoto() {
  try {
    const photo = await photoService.capturePhoto()
    formData.value.photo = photo
  } catch (error) {
    console.error('Error capturing photo:', error)
    
    if ((window as any).showToast) {
      ;(window as any).showToast({
        type: 'error',
        message: t.photoCaptureFailed
      })
    }
  }
}

function removePhoto() {
  formData.value.photo = ''
  formData.value.allowPhotoInAI = false
}

async function handleSubmit() {
  if (isSubmitting.value) return

  isSubmitting.value = true

  try {
    const weekStart = checkinsStore.getCurrentWeekStart()
    
    const checkinData = {
      weekStart,
      weight: formData.value.weight,
      waist: formData.value.waist,
      notes: formData.value.notes || undefined,
      photo: formData.value.photo || undefined,
      allowPhotoInAI: formData.value.allowPhotoInAI
    }

    let checkin: WeeklyCheckin

    if (props.editMode && props.checkin) {
      checkin = await checkinsStore.updateCheckin(props.checkin.id, checkinData)
    } else {
      checkin = await checkinsStore.addCheckin(checkinData)
    }

    emit('saved', checkin)

    // Show success toast
    if ((window as any).showToast) {
      ;(window as any).showToast({
        type: 'success',
        message: props.editMode ? 'Check-in updated successfully!' : 'Check-in saved successfully!'
      })
    }
  } catch (error) {
    console.error('Error saving check-in:', error)
    
    // Show error toast
    if ((window as any).showToast) {
      ;(window as any).showToast({
        type: 'error',
        message: 'Failed to save check-in. Please try again.'
      })
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>
