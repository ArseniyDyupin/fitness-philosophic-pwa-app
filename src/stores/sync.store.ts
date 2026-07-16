import { create } from 'zustand'
import {
  dataSyncService,
  getDataSyncErrorCode,
  type DataSyncErrorCode,
  type SyncStats
} from '@services/dataSync'

interface SyncState {
  isUploading: boolean
  isDownloading: boolean
  isCheckingFile: boolean
  syncFileExists: boolean
  syncFileInfo: { lastModified: string; size: number } | null
  lastSyncStats: SyncStats | null
  error: string | null
  errorCode: DataSyncErrorCode | null
  uploadData: () => Promise<void>
  downloadAndMergeData: () => Promise<SyncStats>
  checkSyncFile: () => Promise<void>
  clearError: () => void
  clearSyncStats: () => void
  reset: () => void
}

const initialSyncState = {
  isUploading: false,
  isDownloading: false,
  isCheckingFile: false,
  syncFileExists: false,
  syncFileInfo: null,
  lastSyncStats: null,
  error: null,
  errorCode: null
}

export const useSyncStore = create<SyncState>((set, get) => ({
  ...initialSyncState,

  uploadData: async () => {
    set({
      isUploading: true,
      error: null,
      errorCode: null
    })

    try {
      await dataSyncService.uploadData()
      set({ isUploading: false })

      try {
        await get().checkSyncFile()
      } catch {
        // The backup succeeded; keep the separate metadata-refresh error in state.
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'PROVIDER_ERROR',
        errorCode: getDataSyncErrorCode(error),
        isUploading: false
      })
      throw error
    }
  },

  downloadAndMergeData: async () => {
    set({
      isDownloading: true,
      error: null,
      errorCode: null
    })

    try {
      const stats = await dataSyncService.downloadAndMergeData()
      set({
        lastSyncStats: stats,
        isDownloading: false
      })
      return stats
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'PROVIDER_ERROR',
        errorCode: getDataSyncErrorCode(error),
        isDownloading: false
      })
      throw error
    }
  },

  checkSyncFile: async () => {
    set({
      isCheckingFile: true,
      error: null,
      errorCode: null
    })

    try {
      const exists = await dataSyncService.checkSyncFileExists()
      const info = exists
        ? await dataSyncService.getSyncFileInfo()
        : null

      set({
        syncFileExists: exists,
        syncFileInfo: info,
        isCheckingFile: false
      })
    } catch (error) {
      set({
        syncFileExists: false,
        syncFileInfo: null,
        error: error instanceof Error ? error.message : 'PROVIDER_ERROR',
        errorCode: getDataSyncErrorCode(error),
        isCheckingFile: false
      })
      throw error
    }
  },

  clearError: () => {
    set({
      error: null,
      errorCode: null
    })
  },

  clearSyncStats: () => {
    set({ lastSyncStats: null })
  },

  reset: () => {
    set(initialSyncState)
  }
}))
