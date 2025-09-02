<template>
  <div class="space-y-4">
    <!-- Export Button -->
    <div>
      <button
        @click="handleExport"
        :disabled="isExporting"
        class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg v-if="isExporting" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <svg v-else class="-ml-1 mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        {{ isExporting ? t.exporting : t.exportData }}
      </button>
      <p class="text-xs text-gray-500 mt-1">
        {{ t.exportDataDescription }}
      </p>
    </div>

    <!-- Import Section -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        {{ t.importData }}
      </label>
      <div class="flex items-center space-x-2">
        <input
          ref="fileInput"
          type="file"
          accept=".json"
          @change="handleFileSelect"
          class="hidden"
        />
        <button
          @click="() => fileInput?.click()"
          :disabled="isImporting"
          class="flex-1 btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg v-if="isImporting" class="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <svg v-else class="-ml-1 mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
          </svg>
          {{ isImporting ? t.importing : t.chooseFile }}
        </button>
      </div>
      <p class="text-xs text-gray-500 mt-1">
        {{ t.importDataDescription }}
      </p>
    </div>

    <!-- Import Confirmation Modal -->
    <div v-if="showImportModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3 text-center">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            {{ t.confirmImport }}
          </h3>
          <div class="text-sm text-gray-500 mb-6">
            <p class="mb-2">{{ t.importWarning }}</p>
            <p class="font-medium text-red-600">{{ t.importCannotUndo }}</p>
          </div>
          <div class="flex justify-center space-x-3">
            <button
              @click="cancelImport"
              class="btn-secondary"
            >
              {{ t.cancel }}
            </button>
            <button
              @click="confirmImport"
              :disabled="isImporting"
              class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isImporting ? t.importing : t.importData }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { exportService } from '@/services/export'
import { useI18nStore } from '@/stores/i18n.store'
import { validateExportData } from '@/utils/json'

const i18nStore = useI18nStore()
const { t } = i18nStore

const isExporting = ref(false)
const isImporting = ref(false)
const showImportModal = ref(false)
const selectedFile = ref<File | null>(null)

const fileInput = ref<HTMLInputElement>()

// Export functionality
async function handleExport() {
  isExporting.value = true
  
  try {
    await exportService.downloadExport()
    
    if ((window as any).showToast) {
      ;(window as any).showToast({
        type: 'success',
        message: 'Data exported successfully!'
      })
    }
  } catch (error) {
    console.error('Export error:', error)
    
    if ((window as any).showToast) {
      ;(window as any).showToast({
        type: 'error',
        message: 'Failed to export data. Please try again.'
      })
    }
  } finally {
    isExporting.value = false
  }
}

// Import functionality
function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  // Validate file
  if (!exportService.validateImportFile(file)) {
    if ((window as any).showToast) {
      ;(window as any).showToast({
        type: 'error',
        message: 'Please select a valid JSON file (max 10MB)'
      })
    }
    return
  }
  
  selectedFile.value = file
  showImportModal.value = true
  
  // Reset file input
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

function cancelImport() {
  showImportModal.value = false
  selectedFile.value = null
}

async function confirmImport() {
  if (!selectedFile.value) return
  
  isImporting.value = true
  
  try {
    await exportService.uploadImport(selectedFile.value)
    
    if ((window as any).showToast) {
      ;(window as any).showToast({
        type: 'success',
        message: 'Data imported successfully!'
      })
    }
    
    // Emit event to parent component to refresh data
    emit('imported')
    
  } catch (error) {
    console.error('Import error:', error)
    
    if ((window as any).showToast) {
      ;(window as any).showToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to import data. Please try again.'
      })
    }
  } finally {
    isImporting.value = false
    showImportModal.value = false
    selectedFile.value = null
  }
}

const emit = defineEmits<{
  imported: []
}>()
</script>
