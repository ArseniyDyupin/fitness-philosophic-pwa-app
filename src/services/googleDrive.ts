import type { ExportBundle } from '@/types/export'

const GOOGLE_DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3'
const GOOGLE_DRIVE_UPLOAD_BASE = 'https://www.googleapis.com/upload/drive/v3'
const GOOGLE_DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.appdata'
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
const SYNC_FILE_NAME = 'ai-trainer-sync.json'
const MAX_SYNC_FILE_SIZE = 20 * 1024 * 1024
const TOKEN_EXPIRY_SKEW_MS = 30_000

interface GoogleTokenResponse {
  access_token?: string
  expires_in?: number | string
  error?: string
}

interface GooglePopupError {
  type?: string
}

interface GoogleTokenClient {
  requestAccessToken: (config?: {
    prompt?: '' | 'none' | 'consent' | 'select_account'
  }) => void
}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string
            scope: string
            include_granted_scopes?: boolean
            callback: (response: GoogleTokenResponse) => void
            error_callback?: (error: GooglePopupError) => void
          }) => GoogleTokenClient
          revoke: (accessToken: string, callback: () => void) => void
        }
      }
    }
  }
}

export type GoogleDriveErrorCode =
  | 'NOT_CONFIGURED'
  | 'GIS_UNAVAILABLE'
  | 'AUTH_CANCELLED'
  | 'AUTH_FAILED'
  | 'AUTH_REQUIRED'
  | 'AUTH_EXPIRED'
  | 'OFFLINE'
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'PERMISSION_DENIED'
  | 'FILE_NOT_FOUND'
  | 'FILE_TOO_LARGE'
  | 'INVALID_RESPONSE'
  | 'INVALID_SYNC_DATA'
  | 'PROVIDER_ERROR'

export class GoogleDriveError extends Error {
  constructor(
    public readonly code: GoogleDriveErrorCode,
    public readonly status?: number
  ) {
    super(code)
    this.name = 'GoogleDriveError'
  }
}

export interface GoogleDriveAuthState {
  isAuthenticated: boolean
  expiresAt: string | null
}

export interface GoogleDriveFile {
  id: string
  name: string
  modifiedTime: string
  size?: string
}

interface GoogleDriveServiceOptions {
  clientId?: string
  requestTimeoutMs?: number
  authTimeoutMs?: number
  now?: () => number
  fetchImpl?: typeof fetch
}

type AuthStateListener = (state: GoogleDriveAuthState) => void

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function parseDriveFile(value: unknown): GoogleDriveFile {
  if (
    !isRecord(value) ||
    typeof value.id !== 'string' ||
    typeof value.name !== 'string' ||
    typeof value.modifiedTime !== 'string' ||
    (value.size !== undefined && typeof value.size !== 'string')
  ) {
    throw new GoogleDriveError('INVALID_RESPONSE')
  }

  return {
    id: value.id,
    name: value.name,
    modifiedTime: value.modifiedTime,
    size: value.size
  }
}

export class GoogleDriveService {
  private readonly clientId: string
  private readonly requestTimeoutMs: number
  private readonly authTimeoutMs: number
  private readonly now: () => number
  private readonly fetchImpl: typeof fetch
  private accessToken: string | null = null
  private tokenExpiresAt = 0
  private readonly authStateListeners = new Set<AuthStateListener>()

  constructor(options: GoogleDriveServiceOptions = {}) {
    this.clientId = options.clientId ?? GOOGLE_CLIENT_ID
    this.requestTimeoutMs = options.requestTimeoutMs ?? 30_000
    this.authTimeoutMs = options.authTimeoutMs ?? 60_000
    this.now = options.now ?? Date.now
    this.fetchImpl = options.fetchImpl ?? ((input, init) => fetch(input, init))
  }

  isConfigured(): boolean {
    return Boolean(
      this.clientId &&
      this.clientId !== 'your_google_client_id_here.apps.googleusercontent.com'
    )
  }

  subscribeAuthState(listener: AuthStateListener): () => void {
    this.authStateListeners.add(listener)
    listener(this.getAuthState())

    return () => {
      this.authStateListeners.delete(listener)
    }
  }

  async signIn(): Promise<void> {
    if (this.isAuthenticated()) {
      return
    }

    if (!this.isConfigured()) {
      throw new GoogleDriveError('NOT_CONFIGURED')
    }

    this.assertOnline()
    await this.waitForGoogleIdentityServices()

    const oauth2 = window.google?.accounts.oauth2
    if (!oauth2) {
      throw new GoogleDriveError('GIS_UNAVAILABLE')
    }

    await new Promise<void>((resolve, reject) => {
      let settled = false

      const finish = (callback: () => void) => {
        if (settled) {
          return
        }
        settled = true
        window.clearTimeout(timeoutId)
        callback()
      }

      const timeoutId = window.setTimeout(() => {
        finish(() => reject(new GoogleDriveError('AUTH_CANCELLED')))
      }, this.authTimeoutMs)

      const tokenClient = oauth2.initTokenClient({
        client_id: this.clientId,
        scope: GOOGLE_DRIVE_SCOPE,
        include_granted_scopes: true,
        callback: response => {
          if (response.error || !response.access_token) {
            const code = response.error === 'access_denied'
              ? 'AUTH_CANCELLED'
              : 'AUTH_FAILED'
            finish(() => reject(new GoogleDriveError(code)))
            return
          }

          const expiresInSeconds = Number(response.expires_in)
          const safeExpiresInSeconds = Number.isFinite(expiresInSeconds) && expiresInSeconds > 0
            ? expiresInSeconds
            : 3600

          this.accessToken = response.access_token
          this.tokenExpiresAt = this.now() + safeExpiresInSeconds * 1000
          this.notifyAuthState()
          finish(resolve)
        },
        error_callback: error => {
          const code = error.type === 'popup_closed'
            ? 'AUTH_CANCELLED'
            : 'AUTH_FAILED'
          finish(() => reject(new GoogleDriveError(code)))
        }
      })

      tokenClient.requestAccessToken()
    })
  }

  async signOut(): Promise<void> {
    const token = this.accessToken
    this.clearAuthState()

    const revoke = window.google?.accounts.oauth2.revoke
    if (!token || !revoke) {
      return
    }

    await new Promise<void>(resolve => {
      let settled = false
      const finish = () => {
        if (settled) {
          return
        }
        settled = true
        window.clearTimeout(timeoutId)
        resolve()
      }
      const timeoutId = window.setTimeout(finish, 5_000)
      revoke(token, finish)
    })
  }

  getAuthState(): GoogleDriveAuthState {
    const isAuthenticated = this.isAuthenticated()

    return {
      isAuthenticated,
      expiresAt: isAuthenticated
        ? new Date(this.tokenExpiresAt).toISOString()
        : null
    }
  }

  isAuthenticated(): boolean {
    if (!this.accessToken) {
      return false
    }

    if (this.now() >= this.tokenExpiresAt - TOKEN_EXPIRY_SKEW_MS) {
      this.clearAuthState()
      return false
    }

    return true
  }

  async uploadSyncData(data: ExportBundle): Promise<GoogleDriveFile> {
    const fileContent = JSON.stringify(data)
    const fileSize = new TextEncoder().encode(fileContent).byteLength

    if (fileSize > MAX_SYNC_FILE_SIZE) {
      throw new GoogleDriveError('FILE_TOO_LARGE')
    }

    const existingFile = await this.findSyncFile()

    if (existingFile) {
      const params = new URLSearchParams({
        uploadType: 'media',
        fields: 'id,name,modifiedTime,size'
      })
      const response = await this.makeDriveRequest(
        `${GOOGLE_DRIVE_UPLOAD_BASE}/files/${encodeURIComponent(existingFile.id)}?${params.toString()}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json; charset=UTF-8'
          },
          body: fileContent
        }
      )

      return parseDriveFile(await this.readJson(response))
    }

    const boundary = `ai_trainer_${globalThis.crypto?.randomUUID?.() ?? this.now()}`
    const metadata = JSON.stringify({
      name: SYNC_FILE_NAME,
      mimeType: 'application/json',
      parents: ['appDataFolder']
    })
    const multipartBody = [
      `--${boundary}`,
      'Content-Type: application/json; charset=UTF-8',
      '',
      metadata,
      `--${boundary}`,
      'Content-Type: application/json; charset=UTF-8',
      '',
      fileContent,
      `--${boundary}--`,
      ''
    ].join('\r\n')
    const params = new URLSearchParams({
      uploadType: 'multipart',
      fields: 'id,name,modifiedTime,size'
    })
    const response = await this.makeDriveRequest(
      `${GOOGLE_DRIVE_UPLOAD_BASE}/files?${params.toString()}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': `multipart/related; boundary=${boundary}`
        },
        body: multipartBody
      }
    )

    return parseDriveFile(await this.readJson(response))
  }

  async downloadSyncData(): Promise<unknown> {
    const file = await this.findSyncFile()
    if (!file) {
      throw new GoogleDriveError('FILE_NOT_FOUND', 404)
    }

    const params = new URLSearchParams({ alt: 'media' })
    const response = await this.makeDriveRequest(
      `${GOOGLE_DRIVE_API_BASE}/files/${encodeURIComponent(file.id)}?${params.toString()}`
    )

    try {
      return JSON.parse(await response.text())
    } catch {
      throw new GoogleDriveError('INVALID_SYNC_DATA')
    }
  }

  async findSyncFile(): Promise<GoogleDriveFile | null> {
    const escapedName = SYNC_FILE_NAME.replace(/'/g, "\\'")
    const params = new URLSearchParams({
      spaces: 'appDataFolder',
      q: `name = '${escapedName}' and trashed = false`,
      fields: 'files(id,name,modifiedTime,size)',
      orderBy: 'modifiedTime desc',
      pageSize: '1'
    })
    const response = await this.makeDriveRequest(
      `${GOOGLE_DRIVE_API_BASE}/files?${params.toString()}`
    )
    const data = await this.readJson(response)

    if (!isRecord(data) || !Array.isArray(data.files)) {
      throw new GoogleDriveError('INVALID_RESPONSE')
    }

    return data.files.length > 0
      ? parseDriveFile(data.files[0])
      : null
  }

  async getSyncFileInfo(): Promise<{
    exists: boolean
    lastModified?: string
    size?: string
  }> {
    const file = await this.findSyncFile()
    if (!file) {
      return { exists: false }
    }

    return {
      exists: true,
      lastModified: file.modifiedTime,
      size: file.size
    }
  }

  private async waitForGoogleIdentityServices(): Promise<void> {
    if (typeof window === 'undefined') {
      throw new GoogleDriveError('GIS_UNAVAILABLE')
    }

    const startedAt = this.now()

    while (!window.google?.accounts.oauth2) {
      if (this.now() - startedAt >= this.requestTimeoutMs) {
        throw new GoogleDriveError('GIS_UNAVAILABLE')
      }
      await new Promise(resolve => window.setTimeout(resolve, 50))
    }
  }

  private assertOnline(): void {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      throw new GoogleDriveError('OFFLINE')
    }
  }

  private getAccessToken(): string {
    if (!this.isAuthenticated() || !this.accessToken) {
      throw new GoogleDriveError('AUTH_REQUIRED')
    }

    return this.accessToken
  }

  private async makeDriveRequest(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    this.assertOnline()
    const accessToken = this.getAccessToken()
    const headers = new Headers(options.headers)
    headers.set('Authorization', `Bearer ${accessToken}`)
    const controller = new AbortController()
    const timeoutId = globalThis.setTimeout(
      () => controller.abort(),
      this.requestTimeoutMs
    )

    try {
      const response = await this.fetchImpl(url, {
        ...options,
        headers,
        signal: controller.signal
      })

      if (response.ok) {
        return response
      }

      if (response.status === 401) {
        this.clearAuthState()
        throw new GoogleDriveError('AUTH_EXPIRED', response.status)
      }
      if (response.status === 403) {
        throw new GoogleDriveError('PERMISSION_DENIED', response.status)
      }
      if (response.status === 404) {
        throw new GoogleDriveError('FILE_NOT_FOUND', response.status)
      }

      throw new GoogleDriveError('PROVIDER_ERROR', response.status)
    } catch (error) {
      if (error instanceof GoogleDriveError) {
        throw error
      }
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new GoogleDriveError('TIMEOUT')
      }
      throw new GoogleDriveError('NETWORK_ERROR')
    } finally {
      globalThis.clearTimeout(timeoutId)
    }
  }

  private async readJson(response: Response): Promise<unknown> {
    try {
      return await response.json()
    } catch {
      throw new GoogleDriveError('INVALID_RESPONSE')
    }
  }

  private clearAuthState(): void {
    const hadAuthState = Boolean(this.accessToken || this.tokenExpiresAt)
    this.accessToken = null
    this.tokenExpiresAt = 0

    if (hadAuthState) {
      this.notifyAuthState()
    }
  }

  private notifyAuthState(): void {
    const state = this.getAuthState()
    this.authStateListeners.forEach(listener => listener(state))
  }
}

export const googleDriveService = new GoogleDriveService()
