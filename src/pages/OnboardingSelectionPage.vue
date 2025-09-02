<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="max-w-md w-full">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ t.aiTrainer }}</h1>
        <p class="text-gray-600">{{ t.welcomeToOnboarding }}</p>
      </div>

      <div class="space-y-6">
        <!-- Import Profile Option -->
        <div class="card cursor-pointer hover:shadow-md transition-shadow" @click="showImportModal = true">
          <div class="text-center p-6">
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ t.importProfile }}</h3>
            <p class="text-gray-600">{{ t.importProfileDescription }}</p>
          </div>
        </div>

        <!-- Create New Profile Option -->
        <div class="card cursor-pointer hover:shadow-md transition-shadow" @click="startNewProfile">
          <div class="text-center p-6">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ t.createNewProfile }}</h3>
            <p class="text-gray-600">{{ t.createNewProfileDescription }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Import Modal -->
    <div v-if="showImportModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">{{ t.importProfileTitle }}</h3>
          
          <div class="mb-4">
            <input
              ref="fileInput"
              type="file"
              accept=".json"
              @change="handleFileSelect"
              class="hidden"
            />
            <button
              @click="fileInput?.click()"
              class="w-full btn-secondary mb-2"
            >
              {{ t.chooseJsonFile }}
            </button>
            <p class="text-xs text-gray-500">
              {{ t.selectJsonFile }}
            </p>
          </div>

          <div v-if="selectedFile" class="mb-4 p-3 bg-gray-50 rounded-lg">
            <p class="text-sm text-gray-700">
              {{ t.selected }} {{ selectedFile.name }}
            </p>
          </div>

          <div class="flex justify-end space-x-3">
            <button
              @click="showImportModal = false"
              class="btn-secondary"
            >
              {{ t.cancel }}
            </button>
            <button
              @click="importProfile"
              :disabled="!selectedFile || isImporting"
              class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isImporting ? t.importing : t.import }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useProfileStore } from '@/stores/profile.store'
import { useI18nStore } from '@/stores/i18n.store'

const router = useRouter()
const profileStore = useProfileStore()
const i18nStore = useI18nStore()

const { t } = i18nStore

const showImportModal = ref(false)
const selectedFile = ref<File | null>(null)
const isImporting = ref(false)
const fileInput = ref<HTMLInputElement>()

function startNewProfile() {
  router.push('/onboarding/metrics')
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0]
  }
}

async function importProfile() {
  if (!selectedFile.value) return

  isImporting.value = true

  try {
    // Validate file
    if (selectedFile.value.type !== 'application/json' && !selectedFile.value.name.endsWith('.json')) {
      throw new Error('Invalid file format. Please select a JSON file.')
    }
    
    if (selectedFile.value.size > 10 * 1024 * 1024) {
      throw new Error('File too large. Maximum size is 10MB.')
    }

    // Import the profile data
    const text = await selectedFile.value.text()
    const profileData = JSON.parse(text)
    await profileStore.importProfile(profileData)
    
    // Show success message
          if ((window as any).showToast) {
        ;(window as any).showToast({
          type: 'success',
          message: t.importSuccess
        })
      }

    // Navigate to home
    router.push('/')
  } catch (error) {
    console.error('Import error:', error)
    
    if ((window as any).showToast) {
      ;(window as any).showToast({
        type: 'error',
        message: error instanceof Error ? error.message : t.importFailed
      })
    }
  } finally {
    isImporting.value = false
    showImportModal.value = false
    selectedFile.value = null
  }
}
</script>
