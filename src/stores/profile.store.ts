import { create } from 'zustand'
import type { Profile } from '@/types/models'
import { profileService } from '@/application/profile/profileService'

interface ProfileState {
  profile: Profile | null
  isLoading: boolean
  error: string | null
  
  // Actions
  loadProfile: () => Promise<void>
  saveProfile: (profile: Partial<Profile>) => Promise<void>
  createProfile: (profileData: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  deleteProfile: () => Promise<void>
  importProfile: (jsonData: unknown) => Promise<void>
  exportProfile: () => Promise<{ schemaVersion: number; exportedAt: string; profile: Profile }>
  clearProfile: () => void
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  isLoading: false,
  error: null,

  loadProfile: async () => {
    set({ isLoading: true, error: null })
    try {
      const profile = await profileService.get()
      if (profile) {
        set({ profile })
      }
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to load profile' })
    } finally {
      set({ isLoading: false })
    }
  },

  saveProfile: async (profileData: Partial<Profile>) => {
    const currentProfile = get().profile
    if (!currentProfile) {
      throw new Error('No profile to update')
    }

    set({ isLoading: true, error: null })
    try {
      const updatedProfile = await profileService.update(profileData)
      set({ profile: updatedProfile })
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to save profile' })
      throw err
    } finally {
      set({ isLoading: false })
    }
  },

  createProfile: async (profileData: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>) => {
    set({ isLoading: true, error: null })
    try {
      const newProfile = await profileService.create(profileData)
      set({ profile: newProfile })
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to create profile' })
      throw err
    } finally {
      set({ isLoading: false })
    }
  },

  deleteProfile: async () => {
    set({ isLoading: true, error: null })
    try {
      await profileService.delete()
      set({ profile: null })
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to delete profile' })
      throw err
    } finally {
      set({ isLoading: false })
    }
  },

  importProfile: async (jsonData: unknown) => {
    set({ isLoading: true, error: null })
    try {
      // Validate and transform imported data
      const importedProfile = (jsonData as { profile?: Profile }).profile || jsonData as Profile
      
      if (!importedProfile || typeof importedProfile !== 'object') {
        throw new Error('Invalid profile data')
      }

      const transformedProfile: Profile = {
        ...(importedProfile as any),
        id: 'me', // Always use 'me' as ID
        language: (importedProfile as any).language || 'en',
        goalsDetailed: (importedProfile as any).goalsDetailed || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const profile = await profileService.import(transformedProfile)
      set({ profile })
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to import profile' })
      throw err
    } finally {
      set({ isLoading: false })
    }
  },

  exportProfile: async () => {
    const currentProfile = get().profile
    if (!currentProfile) {
      throw new Error('No profile to export')
    }

    return {
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      profile: currentProfile
    }
  },

  clearProfile: () => {
    set({ profile: null, error: null })
  }
}))
