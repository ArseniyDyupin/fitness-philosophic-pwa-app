import React, { useState } from 'react'
import { ExternalLink, RotateCcw, Save } from 'lucide-react'
import {
  googleDriveService,
  isValidGoogleClientId,
  type GoogleClientIdSource
} from '@/services/googleDrive'
import { useGoogleAuthStore } from '@/stores/googleAuth.store'
import { useSyncStore } from '@/stores/sync.store'
import { useTranslations } from '@/stores/i18n.store'
import Button from '@/ui/atoms/Button'

interface GoogleOAuthConfigProps {
  onConfigurationChange: (clientId: string) => void
}

type ConfigurationMessage = {
  type: 'success' | 'error'
  text: string
}

export const GoogleOAuthConfig: React.FC<GoogleOAuthConfigProps> = ({
  onConfigurationChange
}) => {
  const t = useTranslations()
  const {
    isAuthenticated,
    checkAuthState,
    clearError
  } = useGoogleAuthStore()
  const resetSyncState = useSyncStore(state => state.reset)
  const [clientId, setClientId] = useState(googleDriveService.getClientId())
  const [source, setSource] = useState<GoogleClientIdSource>(
    googleDriveService.getClientIdSource()
  )
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<ConfigurationMessage | null>(null)
  const activeClientId = googleDriveService.getClientId()
  const normalizedClientId = clientId.trim()
  const currentOrigin = typeof window === 'undefined' ? '' : window.location.origin

  const refreshConfiguration = () => {
    const nextClientId = googleDriveService.getClientId()
    setClientId(nextClientId)
    setSource(googleDriveService.getClientIdSource())
    clearError()
    checkAuthState()
    resetSyncState()
    onConfigurationChange(nextClientId)
  }

  const confirmAuthorizedChange = (nextClientId: string): boolean => {
    if (!isAuthenticated || nextClientId === activeClientId) {
      return true
    }

    return window.confirm(t.googleSync.oauthConfig.confirmChange)
  }

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault()
    setMessage(null)

    if (!isValidGoogleClientId(normalizedClientId)) {
      setMessage({
        type: 'error',
        text: t.googleSync.oauthConfig.invalidClientId
      })
      return
    }

    if (!confirmAuthorizedChange(normalizedClientId)) {
      return
    }

    setIsSaving(true)
    try {
      await googleDriveService.setClientId(normalizedClientId)
      refreshConfiguration()
      setMessage({
        type: 'success',
        text: t.googleSync.oauthConfig.saved
      })
    } catch {
      setMessage({
        type: 'error',
        text: t.googleSync.oauthConfig.saveFailed
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = async () => {
    setMessage(null)

    if (!confirmAuthorizedChange(googleDriveService.getEnvironmentClientId())) {
      return
    }

    setIsSaving(true)
    try {
      await googleDriveService.clearClientIdOverride()
      refreshConfiguration()
      setMessage({
        type: 'success',
        text: googleDriveService.isConfigured()
          ? t.googleSync.oauthConfig.resetSuccess
          : t.googleSync.oauthConfig.removed
      })
    } catch {
      setMessage({
        type: 'error',
        text: t.googleSync.oauthConfig.saveFailed
      })
    } finally {
      setIsSaving(false)
    }
  }

  const sourceLabel = source === 'local'
    ? t.googleSync.oauthConfig.sourceLocal
    : source === 'environment'
      ? t.googleSync.oauthConfig.sourceEnvironment
      : t.googleSync.oauthConfig.sourceNone

  const messageClassName = message?.type === 'success'
    ? 'rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800'
    : 'rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700'

  return (
    <form
      onSubmit={handleSave}
      className="space-y-4 rounded-lg border border-blue-100 bg-blue-50/50 p-4 text-left"
    >
      <div>
        <h3 className="text-base font-semibold text-gray-900">
          {t.googleSync.oauthConfig.title}
        </h3>
        <p
          id="google-client-id-description"
          className="mt-1 text-sm text-gray-600"
        >
          {t.googleSync.oauthConfig.description}
        </p>
      </div>

      <div>
        <label
          htmlFor="google-oauth-client-id"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          {t.googleSync.oauthConfig.clientIdLabel}
        </label>
        <input
          id="google-oauth-client-id"
          type="text"
          value={clientId}
          onChange={event => {
            setClientId(event.target.value)
            setMessage(null)
          }}
          placeholder={t.googleSync.oauthConfig.clientIdPlaceholder}
          aria-describedby="google-client-id-description google-client-id-source"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:border-primary-500 focus:ring-primary-500"
        />
        <p id="google-client-id-source" className="mt-2 text-xs text-gray-500">
          {sourceLabel}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          type="submit"
          loading={isSaving}
          className="w-full gap-2 sm:w-auto"
        >
          {!isSaving && <Save className="h-4 w-4" aria-hidden="true" />}
          {isSaving
            ? t.googleSync.oauthConfig.saving
            : t.googleSync.oauthConfig.save}
        </Button>
        {googleDriveService.hasClientIdOverride() && (
          <Button
            type="button"
            variant="secondary"
            onClick={handleReset}
            disabled={isSaving}
            className="w-full gap-2 sm:w-auto"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            {isValidGoogleClientId(googleDriveService.getEnvironmentClientId())
              ? t.googleSync.oauthConfig.reset
              : t.googleSync.oauthConfig.remove}
          </Button>
        )}
      </div>

      {message && (
        <p
          className={messageClassName}
          role={message.type === 'error' ? 'alert' : 'status'}
        >
          {message.text}
        </p>
      )}

      <div className="space-y-2 rounded-lg bg-white/80 p-3 text-xs text-gray-600">
        <p>{t.googleSync.oauthConfig.setupHelp}</p>
        {currentOrigin && (
          <p>
            {t.googleSync.oauthConfig.currentOrigin}:{' '}
            <code className="break-all rounded bg-gray-100 px-1 py-0.5">
              {currentOrigin}
            </code>
          </p>
        )}
        <a
          href="https://console.cloud.google.com/apis/credentials"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 font-medium text-blue-700 hover:text-blue-800 hover:underline"
        >
          {t.googleSync.oauthConfig.openConsole}
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </div>
    </form>
  )
}
