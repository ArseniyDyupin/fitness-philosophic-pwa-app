// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  GoogleDriveError,
  GoogleDriveService
} from './googleDrive'
import type { ExportBundle } from '@/types/export'

interface TestTokenConfig {
  scope: string
  callback: (response: {
    access_token?: string
    expires_in?: number
    error?: string
  }) => void
  error_callback?: (error: { type?: string }) => void
}

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

function installGoogleOAuth(
  onRequest: (config: TestTokenConfig) => void
) {
  let tokenConfig: TestTokenConfig | null = null
  const requestAccessToken = vi.fn(() => {
    if (!tokenConfig) {
      throw new Error('Token client was not initialized')
    }
    onRequest(tokenConfig)
  })
  const initTokenClient = vi.fn((config: TestTokenConfig) => {
    tokenConfig = config
    return { requestAccessToken }
  })
  const revoke = vi.fn((_token: string, callback: () => void) => callback())

  window.google = {
    accounts: {
      oauth2: {
        initTokenClient,
        revoke
      }
    }
  }

  return {
    initTokenClient,
    requestAccessToken,
    revoke
  }
}

describe('GoogleDriveService', () => {
  beforeEach(() => {
    localStorage.clear()
    Object.defineProperty(window.navigator, 'onLine', {
      configurable: true,
      value: true
    })
    window.google = undefined
  })

  it('authorizes with the OAuth token model and keeps the token out of storage', async () => {
    const oauth = installGoogleOAuth(config => {
      config.callback({
        access_token: 'drive-access-token',
        expires_in: 3600
      })
    })
    const service = new GoogleDriveService({
      clientId: 'client.apps.googleusercontent.com'
    })

    await service.signIn()

    expect(service.getAuthState().isAuthenticated).toBe(true)
    expect(localStorage.length).toBe(0)
    expect(oauth.initTokenClient).toHaveBeenCalledWith(
      expect.objectContaining({
        client_id: 'client.apps.googleusercontent.com',
        scope: 'https://www.googleapis.com/auth/drive.appdata'
      })
    )
    expect(oauth.requestAccessToken).toHaveBeenCalledOnce()
  })

  it('reports a closed OAuth popup as cancellation', async () => {
    installGoogleOAuth(config => {
      config.error_callback?.({ type: 'popup_closed' })
    })
    const service = new GoogleDriveService({
      clientId: 'client.apps.googleusercontent.com'
    })

    await expect(service.signIn()).rejects.toMatchObject({
      code: 'AUTH_CANCELLED'
    })
    expect(service.isAuthenticated()).toBe(false)
  })

  it('creates multipart content once and later updates the same file with media upload', async () => {
    installGoogleOAuth(config => {
      config.callback({
        access_token: 'drive-access-token',
        expires_in: 3600
      })
    })
    const fetchMock = vi.fn(
      async (
        _input: RequestInfo | URL,
        _init?: RequestInit
      ): Promise<Response> => {
        void _input
        void _init
        return new Response()
      }
    )
      .mockResolvedValueOnce(new Response(JSON.stringify({ files: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        id: 'file-1',
        name: 'ai-trainer-sync.json',
        modifiedTime: '2026-07-16T12:01:00.000Z',
        size: '250'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        files: [{
          id: 'file-1',
          name: 'ai-trainer-sync.json',
          modifiedTime: '2026-07-16T12:01:00.000Z',
          size: '250'
        }]
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        id: 'file-1',
        name: 'ai-trainer-sync.json',
        modifiedTime: '2026-07-16T12:02:00.000Z',
        size: '260'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }))
    const service = new GoogleDriveService({
      clientId: 'client.apps.googleusercontent.com',
      fetchImpl: fetchMock as unknown as typeof fetch
    })
    await service.signIn()

    await service.uploadSyncData(createBundle())
    await service.uploadSyncData(createBundle())

    const [listUrl, listInit] = fetchMock.mock.calls[0]
    expect(String(listUrl)).toContain('spaces=appDataFolder')
    expect(String(listUrl)).toContain('pageSize=1')
    expect(new Headers(listInit?.headers).get('Authorization'))
      .toBe('Bearer drive-access-token')

    const [createUrl, createInit] = fetchMock.mock.calls[1]
    expect(String(createUrl)).toContain('uploadType=multipart')
    expect(createInit?.method).toBe('POST')
    expect(new Headers(createInit?.headers).get('Content-Type'))
      .toContain('multipart/related')
    expect(String(createInit?.body)).toContain('"parents":["appDataFolder"]')
    expect(String(createInit?.body)).toContain('"schemaVersion":1')

    const [updateUrl, updateInit] = fetchMock.mock.calls[3]
    expect(String(updateUrl)).toContain('/files/file-1?')
    expect(String(updateUrl)).toContain('uploadType=media')
    expect(updateInit?.method).toBe('PATCH')
    expect(updateInit?.body).toBe(JSON.stringify(createBundle()))
  })

  it('clears authorization after Drive returns 401', async () => {
    installGoogleOAuth(config => {
      config.callback({
        access_token: 'drive-access-token',
        expires_in: 3600
      })
    })
    const fetchMock = vi.fn(
      async (
        _input: RequestInfo | URL,
        _init?: RequestInit
      ): Promise<Response> => {
        void _input
        void _init
        return new Response('', { status: 401 })
      }
    )
    const service = new GoogleDriveService({
      clientId: 'client.apps.googleusercontent.com',
      fetchImpl: fetchMock as unknown as typeof fetch
    })
    await service.signIn()

    await expect(service.findSyncFile()).rejects.toBeInstanceOf(GoogleDriveError)
    await expect(service.findSyncFile()).rejects.toMatchObject({
      code: 'AUTH_REQUIRED'
    })
    expect(service.isAuthenticated()).toBe(false)
  })
})
