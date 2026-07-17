import {
  GoogleDriveError,
  googleDriveService,
  type GoogleDriveErrorCode
} from './googleDrive'
import {
  db,
  exportAll,
  importData,
  ImportError,
  parseExportBundle
} from './data'
import type { ExportBundle, ImportStats } from '@/types/export'
import { getBackupIntegrity } from '@/services/data/backupIntegrity'

export type SyncStats = ImportStats

export type DataSyncErrorCode =
  | GoogleDriveErrorCode
  | 'OPERATION_IN_PROGRESS'
  | 'DATA_EXPORT_FAILED'
  | 'DATA_IMPORT_FAILED'

export class DataSyncError extends Error {
  constructor(public readonly code: DataSyncErrorCode) {
    super(code)
    this.name = 'DataSyncError'
  }
}

interface DriveSyncClient {
  isAuthenticated: () => boolean
  uploadSyncData: (data: ExportBundle) => Promise<unknown>
  downloadSyncData: () => Promise<unknown>
  getSyncFileInfo: () => Promise<{
    exists: boolean
    lastModified?: string
    size?: string
    schemaVersion?: string
    checksum?: string
  }>
}

interface DataSyncServiceOptions {
  driveService?: DriveSyncClient
  exportData?: typeof exportAll
  parseData?: typeof parseExportBundle
  mergeData?: typeof importData
  reloadStoreMirrors?: () => Promise<void>
}

export function getDataSyncErrorCode(error: unknown): DataSyncErrorCode | null {
  if (
    error instanceof GoogleDriveError ||
    error instanceof DataSyncError
  ) {
    return error.code
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string'
  ) {
    return error.code as DataSyncErrorCode
  }

  return null
}

export class DataSyncService {
  private activeOperation: 'upload' | 'download' | null = null
  private readonly driveService: DriveSyncClient
  private readonly exportData: typeof exportAll
  private readonly parseData: typeof parseExportBundle
  private readonly mergeData: typeof importData
  private readonly reloadMirrors: () => Promise<void>

  constructor(options: DataSyncServiceOptions = {}) {
    this.driveService = options.driveService ?? googleDriveService
    this.exportData = options.exportData ?? exportAll
    this.parseData = options.parseData ?? parseExportBundle
    this.mergeData = options.mergeData ?? importData
    this.reloadMirrors = options.reloadStoreMirrors ?? (() => this.reloadStoreMirrors())
  }

  async uploadData(): Promise<void> {
    return this.runExclusive('upload', async () => {
      this.assertAuthenticated()

      let syncData
      try {
        syncData = await this.exportData()
      } catch {
        throw new DataSyncError('DATA_EXPORT_FAILED')
      }

      await this.driveService.uploadSyncData(syncData)
    })
  }

  async getLocalBackupPreview(): Promise<{
    schemaVersion: number
    exportedAt: string
    size: number
    checksum: string
  }> {
    let data: ExportBundle
    try {
      data = await this.exportData()
    } catch {
      throw new DataSyncError('DATA_EXPORT_FAILED')
    }
    const integrity = await getBackupIntegrity(JSON.stringify(data))
    return {
      schemaVersion: data.schemaVersion,
      exportedAt: data.exportedAt,
      ...integrity
    }
  }

  async downloadAndMergeData(): Promise<SyncStats> {
    return this.runExclusive('download', async () => {
      this.assertAuthenticated()
      const remoteData = await this.driveService.downloadSyncData()

      let validatedData
      try {
        validatedData = this.parseData(remoteData)
      } catch (error) {
        if (error instanceof ImportError) {
          throw new GoogleDriveError('INVALID_SYNC_DATA')
        }
        throw error
      }

      let stats: ImportStats
      try {
        stats = await this.mergeData(validatedData, 'merge')
      } catch {
        throw new DataSyncError('DATA_IMPORT_FAILED')
      }

      await this.reloadMirrors()
      return stats
    })
  }

  async importLocalData(data: unknown, mode: 'replace' | 'merge'): Promise<SyncStats> {
    let validatedData: ExportBundle
    try {
      validatedData = this.parseData(data)
    } catch (error) {
      if (error instanceof ImportError) throw error
      throw new DataSyncError('DATA_IMPORT_FAILED')
    }

    try {
      const stats = await this.mergeData(validatedData, mode)
      await this.reloadMirrors()
      return stats
    } catch (error) {
      if (error instanceof ImportError) throw error
      throw new DataSyncError('DATA_IMPORT_FAILED')
    }
  }

  async checkSyncFileExists(): Promise<boolean> {
    if (!this.driveService.isAuthenticated()) {
      return false
    }

    const fileInfo = await this.driveService.getSyncFileInfo()
    return fileInfo.exists
  }

  async getSyncFileInfo(): Promise<{
    lastModified: string
    size: number
    schemaVersion?: string
    checksum?: string
  } | null> {
    if (!this.driveService.isAuthenticated()) {
      return null
    }

    const fileInfo = await this.driveService.getSyncFileInfo()
    if (!fileInfo.exists || !fileInfo.lastModified) {
      return null
    }

    const parsedSize = fileInfo.size === undefined
      ? 0
      : Number.parseInt(fileInfo.size, 10)

    return {
      lastModified: fileInfo.lastModified,
      size: Number.isFinite(parsedSize) ? parsedSize : 0,
      schemaVersion: fileInfo.schemaVersion,
      checksum: fileInfo.checksum
    }
  }

  isUploading(): boolean {
    return this.activeOperation === 'upload'
  }

  isDownloading(): boolean {
    return this.activeOperation === 'download'
  }

  private assertAuthenticated(): void {
    if (!this.driveService.isAuthenticated()) {
      throw new GoogleDriveError('AUTH_REQUIRED')
    }
  }

  private async runExclusive<T>(
    operation: 'upload' | 'download',
    callback: () => Promise<T>
  ): Promise<T> {
    if (this.activeOperation) {
      throw new DataSyncError('OPERATION_IN_PROGRESS')
    }

    this.activeOperation = operation
    try {
      return await callback()
    } finally {
      this.activeOperation = null
    }
  }

  private async reloadStoreMirrors(): Promise<void> {
    const [
      { useProfileStore },
      { useWorkoutStore },
      { useFoodStore },
      { useWeeklyStore },
      { useI18nStore },
      { useStatsStore }
    ] = await Promise.all([
      import('@/stores/profile.store'),
      import('@/stores/workout.store'),
      import('@/stores/food.store'),
      import('@/stores/weekly.store'),
      import('@/stores/i18n.store'),
      import('@/stores/stats.store')
    ])

    const [profile, workouts, foodLogs, checkins] = await Promise.all([
      db.profiles.get('me'),
      db.workouts.orderBy('date').reverse().toArray(),
      db.food.orderBy('date').reverse().toArray(),
      db.checkins.orderBy('weekStart').reverse().toArray()
    ])

    useProfileStore.setState({
      profile: profile ?? null,
      error: null
    })
    useWorkoutStore.setState({
      workouts,
      error: null
    })
    useFoodStore.setState({
      foodLogs,
      error: null
    })
    useWeeklyStore.setState({
      checkins,
      error: null
    })
    useStatsStore.getState().clearStats()
    useI18nStore.getState().setLanguageFromProfile()
  }
}

export const dataSyncService = new DataSyncService()
