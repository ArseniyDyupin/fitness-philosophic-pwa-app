import { describe, expect, it, vi } from 'vitest'
import {
  DataSyncService,
  type SyncStats
} from './dataSync'
import { ImportError } from './data'
import type { ExportBundle } from '@/types/export'

function createBundle(): ExportBundle {
  return {
    schemaVersion: 1,
    exportedAt: '2026-07-16T12:00:00.000Z',
    workouts: [],
    food: [],
    checkins: [],
    weeklyData: [],
    ai: [],
    plans: [],
    ai_feedback: [],
    metric_defs: [],
    metric_entries: [],
    photo_assets: [],
    ai_body_evals: [],
    exercise_estimates: []
  }
}

function createStats(): SyncStats {
  return {
    profileReplaced: false,
    workoutsUpserted: 1,
    foodUpserted: 0,
    checkinsUpserted: 0,
    aiUpserted: 0,
    plansUpserted: 0,
    mode: 'merge'
  }
}

function createDriveClient() {
  return {
    isAuthenticated: vi.fn(() => true),
    uploadSyncData: vi.fn(async (): Promise<unknown> => ({ id: 'file-1' })),
    downloadSyncData: vi.fn(async (): Promise<unknown> => createBundle()),
    getSyncFileInfo: vi.fn(async () => ({
      exists: true,
      lastModified: '2026-07-16T12:00:00.000Z',
      size: '123'
    }))
  }
}

describe('DataSyncService', () => {
  it('uploads the canonical export bundle', async () => {
    const bundle = createBundle()
    const driveService = createDriveClient()
    const exportData = vi.fn(async () => bundle)
    const service = new DataSyncService({
      driveService,
      exportData,
      reloadStoreMirrors: vi.fn()
    })

    await service.uploadData()

    expect(exportData).toHaveBeenCalledOnce()
    expect(driveService.uploadSyncData).toHaveBeenCalledWith(bundle)
  })

  it('serializes upload and download operations with one lock', async () => {
    const driveService = createDriveClient()
    let releaseUpload!: () => void
    driveService.uploadSyncData.mockImplementation(
      () => new Promise<unknown>(resolve => {
        releaseUpload = () => resolve({ id: 'file-1' })
      })
    )
    const service = new DataSyncService({
      driveService,
      exportData: vi.fn(async () => createBundle()),
      reloadStoreMirrors: vi.fn()
    })

    const uploadPromise = service.uploadData()
    await Promise.resolve()

    await expect(service.downloadAndMergeData()).rejects.toMatchObject({
      code: 'OPERATION_IN_PROGRESS'
    })

    releaseUpload()
    await uploadPromise
  })

  it('validates, merges, and reloads store mirrors after download', async () => {
    const remotePayload = { remote: true }
    const bundle = createBundle()
    const stats = createStats()
    const driveService = createDriveClient()
    driveService.downloadSyncData.mockResolvedValue(remotePayload)
    const parseData = vi.fn(() => bundle)
    const mergeData = vi.fn(async () => stats)
    const reloadStoreMirrors = vi.fn(async () => undefined)
    const service = new DataSyncService({
      driveService,
      parseData,
      mergeData,
      reloadStoreMirrors
    })

    await expect(service.downloadAndMergeData()).resolves.toEqual(stats)
    expect(parseData).toHaveBeenCalledWith(remotePayload)
    expect(mergeData).toHaveBeenCalledWith(bundle, 'merge')
    expect(reloadStoreMirrors).toHaveBeenCalledOnce()
  })

  it('rejects malformed remote data before merge', async () => {
    const driveService = createDriveClient()
    const mergeData = vi.fn(async () => createStats())
    const service = new DataSyncService({
      driveService,
      parseData: vi.fn(() => {
        throw new ImportError('Invalid backup data', 'VALIDATION_ERROR')
      }),
      mergeData,
      reloadStoreMirrors: vi.fn()
    })

    await expect(service.downloadAndMergeData()).rejects.toMatchObject({
      code: 'INVALID_SYNC_DATA'
    })
    expect(mergeData).not.toHaveBeenCalled()
  })

  it('validates local backup data and reloads mirrors after replace import', async () => {
    const payload = { local: true }
    const bundle = createBundle()
    const stats = { ...createStats(), mode: 'replace' as const }
    const parseData = vi.fn(() => bundle)
    const mergeData = vi.fn(async () => stats)
    const reloadStoreMirrors = vi.fn(async () => undefined)
    const service = new DataSyncService({
      parseData,
      mergeData,
      reloadStoreMirrors
    })

    await expect(service.importLocalData(payload, 'replace')).resolves.toEqual(stats)
    expect(parseData).toHaveBeenCalledWith(payload)
    expect(mergeData).toHaveBeenCalledWith(bundle, 'replace')
    expect(reloadStoreMirrors).toHaveBeenCalledOnce()
  })
})
