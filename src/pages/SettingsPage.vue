<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <div class="flex items-center">
            <router-link 
              to="/" 
              class="p-2 text-gray-400 hover:text-gray-600 transition-colors mr-2"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </router-link>
            <h1 class="text-2xl font-bold text-gray-900">{{ t.settings }}</h1>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="space-y-8">
        <!-- Language Settings -->
        <div class="card">
          <h2 class="text-lg font-semibold text-gray-900 mb-6">{{ t.language }}</h2>
          <div class="flex space-x-4">
            <button
              @click="setLanguage('en')"
              :class="[
                'px-4 py-2 rounded-lg font-medium transition-colors',
                currentLanguage === 'en' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              ]"
            >
              {{ t.english }}
            </button>
            <button
              @click="setLanguage('ru')"
              :class="[
                'px-4 py-2 rounded-lg font-medium transition-colors',
                currentLanguage === 'ru' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              ]"
            >
              {{ t.russian }}
            </button>
          </div>
        </div>

        <!-- Profile Section -->
        <div class="card">
          <h2 class="text-lg font-semibold text-gray-900 mb-6">{{ t.profile }}</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ t.name }}</label>
              <input
                v-model="profileData.name"
                type="text"
                class="input-field"
                :placeholder="t.name"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ t.age }}</label>
              <input
                v-model.number="profileData.age"
                type="number"
                min="12"
                max="90"
                class="input-field"
                :placeholder="t.age"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ t.gender }}</label>
              <select v-model="profileData.gender" class="input-field">
                <option value="male">{{ t.male }}</option>
                <option value="female">{{ t.female }}</option>
                <option value="other">{{ t.other }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ t.height }}</label>
              <input
                v-model.number="profileData.height"
                type="number"
                min="100"
                max="250"
                class="input-field"
                :placeholder="t.height"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ t.weight }}</label>
              <input
                v-model.number="profileData.weight"
                type="number"
                min="30"
                max="250"
                class="input-field"
                :placeholder="t.weight"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ t.goal }}</label>
              <select v-model="profileData.goal.type" class="input-field">
                <option value="weight_loss">{{ t.weightLoss }}</option>
                <option value="muscle_gain">{{ t.muscleGain }}</option>
                <option value="endurance">{{ t.endurance }}</option>
                <option value="strength">{{ t.strength }}</option>
                <option value="general_fitness">{{ t.generalFitness }}</option>
              </select>
            </div>
          </div>
          <div class="mt-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ t.goalDescription }}</label>
            <textarea
              v-model="profileData.goal.description"
              rows="3"
              class="input-field"
              :placeholder="t.goalDescription"
            ></textarea>
          </div>
          <div class="mt-6 flex justify-end">
            <button
              @click="saveProfile"
              :disabled="isSaving"
              class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isSaving ? t.saving : t.saveProfile }}
            </button>
          </div>
        </div>

        <!-- AI Settings -->
        <div class="card">
          <h2 class="text-lg font-semibold text-gray-900 mb-6">{{ t.aiSettings }}</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ t.openaiApiKey }}
              </label>
              <div class="flex space-x-2">
                <input
                  v-model="aiApiKey"
                  type="password"
                  class="input-field flex-1"
                  placeholder="sk-..."
                />
                <button
                  @click="testConnection"
                  :disabled="!aiApiKey || isTesting"
                  class="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ isTesting ? t.testing : t.test }}
                </button>
              </div>
              <p class="text-xs text-gray-500 mt-1">
                Your API key is stored locally and never sent to our servers
              </p>
            </div>
            <div class="flex justify-between items-center">
              <div>
                <h3 class="text-sm font-medium text-gray-900">{{ t.connectionStatus }}</h3>
                <p class="text-xs text-gray-500">
                  {{ connectionStatus }}
                </p>
              </div>
              <button
                v-if="aiApiKey"
                @click="clearApiKey"
                class="text-sm text-red-600 hover:text-red-700"
              >
                {{ t.clearKey }}
              </button>
            </div>
          </div>
        </div>

        <!-- Profile Export -->
        <div class="card">
          <h2 class="text-lg font-semibold text-gray-900 mb-6">Profile Export</h2>
          <div class="space-y-4">
            <div>
              <p class="text-sm text-gray-600 mb-4">
                Export your profile data as a JSON file that you can import on another device.
              </p>
              <button
                @click="exportProfile"
                :disabled="isExporting"
                class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ isExporting ? 'Exporting...' : 'Export Profile' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Data Management -->
        <div class="card">
          <h2 class="text-lg font-semibold text-gray-900 mb-6">{{ t.dataManagement }}</h2>
          <JsonFileButtons @imported="handleDataImported" />
        </div>

        <!-- Danger Zone -->
        <div class="card border-red-200 bg-red-50">
          <h2 class="text-lg font-semibold text-red-900 mb-6">{{ t.resetAllData }}</h2>
          <div class="space-y-4">
            <div>
              <h3 class="text-sm font-medium text-red-900">{{ t.resetAllData }}</h3>
              <p class="text-sm text-red-700 mb-4">
                {{ t.resetDescription }}
              </p>
              <button
                @click="showResetModal = true"
                class="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                {{ t.resetAllData }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Reset Confirmation Modal -->
    <div v-if="showResetModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3 text-center">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            {{ t.confirmReset }}
          </h3>
          <div class="text-sm text-gray-500 mb-6">
            <p class="mb-2">{{ t.resetDescription }}</p>
            <ul class="text-left list-disc list-inside space-y-1">
              <li v-for="item in t.resetItems" :key="item">{{ item }}</li>
            </ul>
            <p class="font-medium text-red-600 mt-4">{{ t.resetWarning }}</p>
          </div>
          <div class="flex justify-center space-x-3">
            <button
              @click="showResetModal = false"
              class="btn-secondary"
            >
              {{ t.cancel }}
            </button>
            <button
              @click="resetAllData"
              :disabled="isResetting"
              class="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isResetting ? t.resetting : t.resetAllData }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useProfileStore } from '@/stores/profile.store'
import { useAIStore } from '@/stores/ai.store'
import { useI18nStore } from '@/stores/i18n.store'
import { dbHelpers } from '@/services/db'
import JsonFileButtons from '@/components/JsonFileButtons.vue'

const profileStore = useProfileStore()
const aiStore = useAIStore()
const i18nStore = useI18nStore()

const { t, currentLanguage, setLanguage } = i18nStore

const isSaving = ref(false)
const isTesting = ref(false)
const isResetting = ref(false)
const isExporting = ref(false)
const showResetModal = ref(false)

// Profile data
const profileData = ref({
  name: '',
  age: 25,
  gender: 'male' as 'male' | 'female' | 'other',
  height: 170,
  weight: 70,
  goal: {
    type: 'general_fitness' as any,
    description: ''
  }
})

// AI settings
const aiApiKey = ref('')
const connectionStatus = ref('Not configured')

// Load data on mount
onMounted(async () => {
  await profileStore.loadProfile()
  await aiStore.loadApiKey()
  
  if (profileStore.profile) {
    profileData.value = {
      name: profileStore.profile.name,
      age: profileStore.profile.age,
      gender: profileStore.profile.gender,
      height: profileStore.profile.height,
      weight: profileStore.profile.weight,
      goal: {
        type: profileStore.profile.goal.type,
        description: profileStore.profile.goal.description
      }
    }
  }
  
  aiApiKey.value = aiStore.apiKey || ''
  updateConnectionStatus()
})

// Update connection status
function updateConnectionStatus() {
  if (!aiApiKey.value) {
    connectionStatus.value = t.notConfigured
  } else {
    connectionStatus.value = t.apiKeySet
  }
}

// Save profile
async function saveProfile() {
  isSaving.value = true
  try {
    if (!profileStore.profile) {
      // Create new profile if none exists
      await profileStore.createProfile({
        name: profileData.value.name,
        age: profileData.value.age,
        gender: profileData.value.gender,
        height: profileData.value.height,
        weight: profileData.value.weight,
        goal: profileData.value.goal
      })
    } else {
      // Update existing profile
      const updatedProfile = {
        ...profileStore.profile,
        name: profileData.value.name,
        age: profileData.value.age,
        gender: profileData.value.gender,
        height: profileData.value.height,
        weight: profileData.value.weight,
        goal: profileData.value.goal,
        constraints: [...profileStore.profile.constraints], // Clone readonly array
        equipment: [...profileStore.profile.equipment], // Clone readonly array
        updatedAt: new Date()
      }
      
      await profileStore.saveProfile(updatedProfile)
    }
    
    if ((window as any).showToast) {
      ;(window as any).showToast({
        type: 'success',
        message: t.profileUpdated
      })
    }
  } catch (error) {
    console.error('Error saving profile:', error)
    
    if ((window as any).showToast) {
      ;(window as any).showToast({
        type: 'error',
        message: t.profileUpdateFailed
      })
    }
  } finally {
    isSaving.value = false
  }
}

// Export profile
async function exportProfile() {
  isExporting.value = true
  try {
    const profileData = await profileStore.exportProfile()
    const blob = new Blob([JSON.stringify(profileData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `profile-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    if ((window as any).showToast) {
      ;(window as any).showToast({
        type: 'success',
        message: 'Profile exported successfully!'
      })
    }
  } catch (error) {
    console.error('Error exporting profile:', error)
    
    if ((window as any).showToast) {
      ;(window as any).showToast({
        type: 'error',
        message: 'Failed to export profile'
      })
    }
  } finally {
    isExporting.value = false
  }
}

// Test AI connection
async function testConnection() {
  if (!aiApiKey.value) return
  
  isTesting.value = true
  
  try {
    await aiStore.setApiKey(aiApiKey.value)
    const isConnected = await aiStore.testConnection()
    
    if (isConnected) {
      connectionStatus.value = t.connected
      if ((window as any).showToast) {
        ;(window as any).showToast({
          type: 'success',
          message: t.aiConnectionSuccess
        })
      }
    } else {
      connectionStatus.value = t.connectionFailed
      if ((window as any).showToast) {
        ;(window as any).showToast({
          type: 'error',
          message: t.aiConnectionFailed
        })
      }
    }
  } catch (error) {
    connectionStatus.value = t.connectionFailed
    if ((window as any).showToast) {
      ;(window as any).showToast({
        type: 'error',
        message: t.aiConnectionFailed
      })
    }
  } finally {
    isTesting.value = false
  }
}

// Clear API key
async function clearApiKey() {
  await aiStore.clearApiKey()
  aiApiKey.value = ''
  updateConnectionStatus()
  
  if ((window as any).showToast) {
    ;(window as any).showToast({
      type: 'success',
      message: t.apiKeyCleared
    })
  }
}

// Reset all data
async function resetAllData() {
  isResetting.value = true
  
  try {
    await dbHelpers.clearAllData()
    
    // Reload stores
    await profileStore.loadProfile()
    
    if ((window as any).showToast) {
      ;(window as any).showToast({
        type: 'success',
        message: t.allDataReset
      })
    }
    
    showResetModal.value = false
  } catch (error) {
    console.error('Error resetting data:', error)
    
    if ((window as any).showToast) {
      ;(window as any).showToast({
        type: 'error',
        message: t.resetFailed
      })
    }
  } finally {
    isResetting.value = false
  }
}

// Handle data imported
function handleDataImported() {
  // Reload all stores after import
  profileStore.loadProfile()
}
</script>
