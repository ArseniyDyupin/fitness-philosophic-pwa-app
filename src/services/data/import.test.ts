import { describe, expect, it } from 'vitest'
import {
  ImportError,
  isRemoteRecordNewer,
  parseExportBundle
} from './import'

describe('backup parsing and conflict timestamps', () => {
  it('normalizes omitted optional collections to empty arrays', () => {
    const bundle = parseExportBundle({
      schemaVersion: 1,
      exportedAt: '2026-07-16T12:00:00.000Z'
    })

    expect(bundle.workouts).toEqual([])
    expect(bundle.photo_assets).toEqual([])
    expect(bundle.exercise_estimates).toEqual([])
  })

  it('rejects unsupported schemas and incomplete entities', () => {
    expect(() => parseExportBundle({
      schemaVersion: 2,
      exportedAt: '2026-07-16T12:00:00.000Z'
    })).toThrowError(ImportError)

    expect(() => parseExportBundle({
      schemaVersion: 1,
      exportedAt: '2026-07-16T12:00:00.000Z',
      workouts: [{
        id: 'workout-without-required-fields',
        updatedAt: '2026-07-16T12:00:00.000Z'
      }]
    })).toThrowError(ImportError)
  })

  it('keeps newer or equal local records and accepts strictly newer remote records', () => {
    const local = {
      updatedAt: '2026-07-16T12:00:00.000Z',
      createdAt: '2026-07-15T12:00:00.000Z'
    }

    expect(isRemoteRecordNewer({
      updatedAt: '2026-07-16T11:59:59.000Z'
    }, local, ['updatedAt', 'createdAt'])).toBe(false)

    expect(isRemoteRecordNewer({
      updatedAt: '2026-07-16T12:00:00.000Z'
    }, local, ['updatedAt', 'createdAt'])).toBe(false)

    expect(isRemoteRecordNewer({
      updatedAt: '2026-07-16T12:00:01.000Z'
    }, local, ['updatedAt', 'createdAt'])).toBe(true)

    expect(isRemoteRecordNewer(
      { id: 'remote-without-time' },
      local,
      ['updatedAt', 'createdAt']
    )).toBe(false)
  })
})
