import type { DataSyncErrorCode } from '@/services/dataSync'

export interface GoogleSyncErrorMessages {
  notConfigured: string
  invalidClientId: string
  unavailable: string
  cancelled: string
  signIn: string
  notAuthenticated: string
  sessionExpired: string
  offline: string
  networkError: string
  timeout: string
  permissionDenied: string
  fileNotFound: string
  fileTooLarge: string
  invalidFile: string
  busy: string
  upload: string
  download: string
  provider: string
}

export function getGoogleSyncErrorMessage(
  code: DataSyncErrorCode | null,
  messages: GoogleSyncErrorMessages,
  fallback: string
): string {
  switch (code) {
    case 'NOT_CONFIGURED':
      return messages.notConfigured
    case 'INVALID_CLIENT_ID':
      return messages.invalidClientId
    case 'GIS_UNAVAILABLE':
      return messages.unavailable
    case 'AUTH_CANCELLED':
      return messages.cancelled
    case 'AUTH_FAILED':
      return messages.signIn
    case 'AUTH_REQUIRED':
      return messages.notAuthenticated
    case 'AUTH_EXPIRED':
      return messages.sessionExpired
    case 'OFFLINE':
      return messages.offline
    case 'NETWORK_ERROR':
      return messages.networkError
    case 'TIMEOUT':
      return messages.timeout
    case 'PERMISSION_DENIED':
      return messages.permissionDenied
    case 'FILE_NOT_FOUND':
      return messages.fileNotFound
    case 'FILE_TOO_LARGE':
      return messages.fileTooLarge
    case 'INVALID_RESPONSE':
    case 'INVALID_SYNC_DATA':
      return messages.invalidFile
    case 'OPERATION_IN_PROGRESS':
      return messages.busy
    case 'DATA_EXPORT_FAILED':
      return messages.upload
    case 'DATA_IMPORT_FAILED':
      return messages.download
    case 'PROVIDER_ERROR':
      return messages.provider
    default:
      return fallback
  }
}
