import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import { dbHelpers } from '@/services/db'
import type { Profile, Goal } from '@/types/models'

export const useProfileStore = defineStore('profile', () => {
  const profile = ref<Profile | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed properties
  const hasCompletedOnboarding = computed(() => profile.value !== null)
  const currentWeight = computed(() => profile.value?.weight || 0)
  const currentGoal = computed(() => profile.value?.goal)

  // Actions
  async function loadProfile() {
    isLoading.value = true
    error.value = null
    
    try {
      const loadedProfile = await dbHelpers.getProfile()
      profile.value = loadedProfile || null
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load profile'
    } finally {
      isLoading.value = false
    }
  }

  async function saveProfile(newProfile: Profile) {
    isLoading.value = true
    error.value = null
    
    try {
      await dbHelpers.saveProfile(newProfile)
      profile.value = newProfile
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to save profile'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function updateProfile(updates: Partial<Profile>) {
    if (!profile.value) {
      throw new Error('No profile to update')
    }

    const updatedProfile: Profile = {
      ...profile.value,
      ...updates,
      updatedAt: new Date()
    }

    await saveProfile(updatedProfile)
  }

  async function updateGoal(goal: Goal) {
    await updateProfile({ goal })
  }

  async function updateWeight(weight: number) {
    await updateProfile({ weight })
  }

  async function updateConstraints(constraints: string[]) {
    await updateProfile({ constraints })
  }

  async function updateEquipment(equipment: string[]) {
    await updateProfile({ equipment })
  }

  async function updateFrequency(frequency: number) {
    await updateProfile({ frequency })
  }

  async function updateDuration(duration: number) {
    await updateProfile({ duration })
  }

  function clearError() {
    error.value = null
  }

  return {
    // State
    profile: readonly(profile),
    isLoading: readonly(isLoading),
    error: readonly(error),
    
    // Computed
    hasCompletedOnboarding,
    currentWeight,
    currentGoal,
    
    // Actions
    loadProfile,
    saveProfile,
    updateProfile,
    updateGoal,
    updateWeight,
    updateConstraints,
    updateEquipment,
    updateFrequency,
    updateDuration,
    clearError
  }
})
