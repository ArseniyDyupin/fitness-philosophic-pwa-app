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

  async function createProfile(profileData: Partial<Profile>) {
    isLoading.value = true
    error.value = null
    
    try {
      const newProfile: Profile = {
        id: 'me',
        name: profileData.name || '',
        age: profileData.age || 25,
        gender: profileData.gender || 'male',
        height: profileData.height || 170,
        weight: profileData.weight || 70,
        goal: profileData.goal || {
          type: 'general_fitness',
          description: ''
        },
        constraints: profileData.constraints || [],
        equipment: profileData.equipment || [],
        frequency: profileData.frequency || 3,
        duration: profileData.duration || 30,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      await dbHelpers.saveProfile(newProfile)
      profile.value = newProfile
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create profile'
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

  async function importProfile(importedProfile: any) {
    isLoading.value = true
    error.value = null
    
    try {
      // Validate required fields
      if (!importedProfile.id || !importedProfile.gender || !importedProfile.age || 
          !importedProfile.height || !importedProfile.weight || !importedProfile.goal) {
        throw new Error('Invalid profile data: missing required fields')
      }

      // Transform imported profile to match our schema
      const transformedProfile: Profile = {
        id: importedProfile.id,
        name: importedProfile.name || '',
        age: importedProfile.age,
        gender: importedProfile.gender,
        height: importedProfile.height,
        weight: importedProfile.weight,
        goal: importedProfile.goal,
        constraints: importedProfile.constraints || [],
        equipment: importedProfile.equipment || [],
        frequency: importedProfile.frequency || 3,
        duration: importedProfile.duration || 30,
        createdAt: importedProfile.createdAt || new Date(),
        updatedAt: new Date()
      }

      await dbHelpers.saveProfile(transformedProfile)
      profile.value = transformedProfile
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to import profile'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function exportProfile(): Promise<any> {
    if (!profile.value) {
      throw new Error('No profile to export')
    }

    return {
      ...profile.value,
      schemaVersion: 1,
      exportedAt: new Date()
    }
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
    createProfile,
    updateProfile,
    updateGoal,
    updateWeight,
    updateConstraints,
    updateEquipment,
    updateFrequency,
    updateDuration,
    importProfile,
    exportProfile,
    clearError
  }
})
