import { googleDriveService, type SyncData } from './googleDrive'
import { z } from 'zod'

// Validation schema for sync data
const SyncDataSchema = z.object({
  schemaVersion: z.number(),
  exportedAt: z.string(),
  profile: z.object({
    id: z.string(),
    name: z.string(),
    age: z.number(),
    gender: z.enum(['male', 'female', 'other']),
    height: z.number(),
    weight: z.number(),
    goal: z.string(),
    constraints: z.array(z.string()),
    equipment: z.array(z.string()),
    frequency: z.number(),
    duration: z.number(),
    language: z.enum(['en', 'ru']),
    goalsDetailed: z.string(),
    createdAt: z.string(),
    updatedAt: z.string()
  }).optional(),
  workouts: z.array(z.any()),
  foodLogs: z.array(z.any()),
  checkins: z.array(z.any()),
  aiPlans: z.array(z.any())
})

export interface SyncStats {
  profile: { updated: boolean; created: boolean }
  workouts: { added: number; updated: number; skipped: number }
  foodLogs: { added: number; updated: number; skipped: number }
  checkins: { added: number; updated: number; skipped: number }
  aiPlans: { added: number; updated: number; skipped: number }
}

class DataSyncService {
  private _isUploading = false
  private _isDownloading = false

  // Upload data to Google Drive
  async uploadData(): Promise<void> {
    if (this._isUploading) {
      throw new Error('Upload already in progress')
    }

    if (!googleDriveService.isAuthenticated()) {
      throw new Error('Not authenticated with Google Drive')
    }

    this._isUploading = true

    try {
      // Collect all data from stores
      const syncData = await this.collectAllData()
      
      // Upload to Google Drive
      await googleDriveService.uploadSyncData(syncData)
      
      console.log('Data uploaded successfully')
    } catch (error) {
      console.error('Upload failed:', error)
      throw error
    } finally {
      this._isUploading = false
    }
  }

  // Download and merge data from Google Drive
  async downloadAndMergeData(): Promise<SyncStats> {
    if (this._isDownloading) {
      throw new Error('Download already in progress')
    }

    if (!googleDriveService.isAuthenticated()) {
      throw new Error('Not authenticated with Google Drive')
    }

    this._isDownloading = true

    try {
      // Download data from Google Drive
      const remoteData = await googleDriveService.downloadSyncData()
      
      // Validate data
      const validatedData = SyncDataSchema.parse(remoteData)
      
      // Merge with local data
      const stats = await this.mergeData(validatedData)
      
      console.log('Data downloaded and merged successfully', stats)
      return stats
    } catch (error) {
      console.error('Download and merge failed:', error)
      throw error
    } finally {
      this._isDownloading = false
    }
  }

  // Check if sync file exists on Google Drive
  async checkSyncFileExists(): Promise<boolean> {
    try {
      if (!googleDriveService.isAuthenticated()) {
        return false
      }

      const fileInfo = await googleDriveService.getSyncFileInfo()
      return fileInfo?.exists || false
    } catch (error) {
      console.error('Failed to check sync file existence:', error)
      return false
    }
  }

  // Get sync file info
  async getSyncFileInfo(): Promise<{ lastModified: string; size: number } | null> {
    try {
      if (!googleDriveService.isAuthenticated()) {
        return null
      }

      const fileInfo = await googleDriveService.getSyncFileInfo()
      if (!fileInfo?.exists || !fileInfo.lastModified || !fileInfo.size) {
        return null
      }

      return {
        lastModified: fileInfo.lastModified,
        size: parseInt(fileInfo.size) || 0
      }
    } catch (error) {
      console.error('Failed to get sync file info:', error)
      return null
    }
  }

  // Private methods
  private async collectAllData(): Promise<SyncData> {
    // Dynamic imports to avoid SSR issues
    const { useProfileStore } = await import('@/stores/profile.store')
    const { useWorkoutStore } = await import('@/stores/workout.store')
    const { useFoodStore } = await import('@/stores/food.store')
    const { useWeeklyStore } = await import('@/stores/weekly.store')
    const { useAIStore } = await import('@/stores/ai.store')

    const profileStore = useProfileStore.getState()
    const workoutStore = useWorkoutStore.getState()
    const foodStore = useFoodStore.getState()
    const weeklyStore = useWeeklyStore.getState()
    const aiStore = useAIStore.getState()

    return {
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      profile: profileStore.profile || undefined,
      workouts: workoutStore.workouts,
      foodLogs: foodStore.foodLogs,
      checkins: weeklyStore.checkins,
      aiPlans: aiStore.plans || []
    }
  }

  private async mergeData(remoteData: SyncData): Promise<SyncStats> {
    const stats: SyncStats = {
      profile: { updated: false, created: false },
      workouts: { added: 0, updated: 0, skipped: 0 },
      foodLogs: { added: 0, updated: 0, skipped: 0 },
      checkins: { added: 0, updated: 0, skipped: 0 },
      aiPlans: { added: 0, updated: 0, skipped: 0 }
    }

    // Dynamic imports to avoid SSR issues
    const { useProfileStore } = await import('@/stores/profile.store')
    const profileStore = useProfileStore.getState()

    // Merge profile
    if (remoteData.profile) {
      const localProfile = profileStore.profile
      
      if (!localProfile) {
        // Create new profile
        await profileStore.createProfile(remoteData.profile)
        stats.profile.created = true
      } else {
        // Update existing profile if remote is newer
        const localTime = new Date(localProfile.updatedAt).getTime()
        const remoteTime = new Date(remoteData.profile.updatedAt).getTime()
        
        if (remoteTime > localTime) {
          await profileStore.saveProfile(remoteData.profile)
          stats.profile.updated = true
        }
      }
    }

    // Merge workouts
    stats.workouts = await this.mergeWorkouts(remoteData.workouts)

    // Merge food logs
    stats.foodLogs = await this.mergeFoodLogs(remoteData.foodLogs)

    // Merge checkins
    stats.checkins = await this.mergeCheckins(remoteData.checkins)

    // Merge AI plans
    stats.aiPlans = await this.mergeAIPlans(remoteData.aiPlans)

    return stats
  }

  private async mergeWorkouts(remoteWorkouts: any[]): Promise<{ added: number; updated: number; skipped: number }> {
    const { useWorkoutStore } = await import('@/stores/workout.store')
    const workoutStore = useWorkoutStore.getState()
    const localWorkouts = workoutStore.workouts
    const stats = { added: 0, updated: 0, skipped: 0 }

    for (const remoteWorkout of remoteWorkouts) {
      const localWorkout = localWorkouts.find(w => w.id === remoteWorkout.id)
      
      if (!localWorkout) {
        // Add new workout
        await workoutStore.addWorkout(remoteWorkout)
        stats.added++
      } else {
        // Update if remote is newer
        const localTime = new Date(localWorkout.updatedAt).getTime()
        const remoteTime = new Date(remoteWorkout.updatedAt).getTime()
        
        if (remoteTime > localTime) {
          await workoutStore.updateWorkout(remoteWorkout.id, remoteWorkout)
          stats.updated++
        } else {
          stats.skipped++
        }
      }
    }

    return stats
  }

  private async mergeFoodLogs(remoteFoodLogs: any[]): Promise<{ added: number; updated: number; skipped: number }> {
    const { useFoodStore } = await import('@/stores/food.store')
    const foodStore = useFoodStore.getState()
    const localFoodLogs = foodStore.foodLogs
    const stats = { added: 0, updated: 0, skipped: 0 }

    for (const remoteFoodLog of remoteFoodLogs) {
      const localFoodLog = localFoodLogs.find(f => f.id === remoteFoodLog.id)
      
      if (!localFoodLog) {
        // Add new food log
        await foodStore.addFoodLog(remoteFoodLog)
        stats.added++
      } else {
        // Update if remote is newer
        const localTime = new Date(localFoodLog.updatedAt).getTime()
        const remoteTime = new Date(remoteFoodLog.updatedAt).getTime()
        
        if (remoteTime > localTime) {
          await foodStore.updateFoodLog(remoteFoodLog.id, remoteFoodLog)
          stats.updated++
        } else {
          stats.skipped++
        }
      }
    }

    return stats
  }

  private async mergeCheckins(remoteCheckins: any[]): Promise<{ added: number; updated: number; skipped: number }> {
    const { useWeeklyStore } = await import('@/stores/weekly.store')
    const weeklyStore = useWeeklyStore.getState()
    const localCheckins = weeklyStore.checkins
    const stats = { added: 0, updated: 0, skipped: 0 }

    for (const remoteCheckin of remoteCheckins) {
      const localCheckin = localCheckins.find(c => c.id === remoteCheckin.id)
      
      if (!localCheckin) {
        // Add new checkin
        await weeklyStore.addCheckin(remoteCheckin)
        stats.added++
      } else {
        // Update if remote is newer
        const localTime = new Date(localCheckin.createdAt).getTime()
        const remoteTime = new Date(remoteCheckin.createdAt).getTime()
        
        if (remoteTime > localTime) {
          await weeklyStore.updateCheckin(remoteCheckin.id, remoteCheckin)
          stats.updated++
        } else {
          stats.skipped++
        }
      }
    }

    return stats
  }

  private async mergeAIPlans(remoteAIPlans: any[]): Promise<{ added: number; updated: number; skipped: number }> {
    const { useAIStore } = await import('@/stores/ai.store')
    const aiStore = useAIStore.getState()
    const localPlans = aiStore.plans || []
    const stats = { added: 0, updated: 0, skipped: 0 }

    for (const remotePlan of remoteAIPlans) {
      const localPlan = localPlans.find(p => p.id === remotePlan.id)
      
      if (!localPlan) {
        // Add new AI plan
        await aiStore.addPlan(remotePlan)
        stats.added++
      } else {
        // Update if remote is newer
        const localTime = new Date(localPlan.createdAt).getTime()
        const remoteTime = new Date(remotePlan.createdAt).getTime()
        
        if (remoteTime > localTime) {
          await aiStore.updatePlan(remotePlan.id, remotePlan)
          stats.updated++
        } else {
          stats.skipped++
        }
      }
    }

    return stats
  }

  // Utility methods
  isUploading(): boolean {
    return this._isUploading
  }

  isDownloading(): boolean {
    return this._isDownloading
  }
}

// Create singleton instance
export const dataSyncService = new DataSyncService()
