import React, { useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { Download, Loader2, RefreshCw, Upload } from 'lucide-react'
import {
  getDataSyncErrorCode,
  type DataSyncErrorCode
} from '@/services/dataSync'
import { useGoogleAuthStore } from '@/stores/googleAuth.store'
import { useSyncStore } from '@/stores/sync.store'
import { useTranslations } from '@/stores/i18n.store'
import { getGoogleSyncErrorMessage } from '@/utils/googleSyncError'
import Button from '@/ui/atoms/Button'

interface SyncButtonsProps {
  className?: string
  showFileInfo?: boolean
}

export const SyncButtons: React.FC<SyncButtonsProps> = ({
  className = '',
  showFileInfo = true
}) => {
  const { isAuthenticated } = useGoogleAuthStore()
  const {
    isUploading,
    isDownloading,
    isCheckingFile,
    syncFileExists,
    syncFileInfo,
    uploadData,
    downloadAndMergeData,
    checkSyncFile,
    error,
    errorCode
  } = useSyncStore()
  const t = useTranslations()

  const getErrorMessage = (
    code: DataSyncErrorCode | null,
    fallback: string
  ) => getGoogleSyncErrorMessage(code, t.googleSync.error, fallback)

  useEffect(() => {
    if (isAuthenticated) {
      void checkSyncFile().catch(() => undefined)
    }
  }, [isAuthenticated, checkSyncFile])

  const handleUpload = async () => {
    if (!isAuthenticated) {
      toast.error(t.googleSync.error.notAuthenticated)
      return
    }
    if (!window.confirm(t.googleSync.confirm.upload)) {
      return
    }

    try {
      await uploadData()
      toast.success(t.googleSync.success.upload)
    } catch (caughtError) {
      toast.error(getErrorMessage(
        getDataSyncErrorCode(caughtError),
        t.googleSync.error.upload
      ))
    }
  }

  const handleDownload = async () => {
    if (!isAuthenticated) {
      toast.error(t.googleSync.error.notAuthenticated)
      return
    }
    if (!window.confirm(t.googleSync.confirm.download)) {
      return
    }

    try {
      const stats = await downloadAndMergeData()
      const statsMessage = [
        stats.profileReplaced && t.googleSync.stats.profile,
        stats.workoutsUpserted > 0 && `${t.googleSync.stats.workouts}: ${stats.workoutsUpserted}`,
        stats.foodUpserted > 0 && `${t.googleSync.stats.foodLogs}: ${stats.foodUpserted}`,
        stats.checkinsUpserted > 0 && `${t.googleSync.stats.checkins}: ${stats.checkinsUpserted}`,
        stats.aiUpserted > 0 && `${t.googleSync.stats.aiMessages}: ${stats.aiUpserted}`,
        stats.plansUpserted > 0 && `${t.googleSync.stats.aiPlans}: ${stats.plansUpserted}`
      ].filter(Boolean).join(', ')

      toast.success(
        statsMessage
          ? `${t.googleSync.success.download}: ${statsMessage}`
          : t.googleSync.success.noChanges
      )
    } catch (caughtError) {
      toast.error(getErrorMessage(
        getDataSyncErrorCode(caughtError),
        t.googleSync.error.download
      ))
    }
  }

  const handleRefresh = async () => {
    try {
      await checkSyncFile()
    } catch (caughtError) {
      toast.error(getErrorMessage(
        getDataSyncErrorCode(caughtError),
        t.googleSync.error.provider
      ))
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) {
      return `0 ${t.googleSync.bytes}`
    }

    const units = [t.googleSync.bytes, t.googleSync.kb, t.googleSync.mb]
    const unitIndex = Math.min(
      Math.floor(Math.log(bytes) / Math.log(1024)),
      units.length - 1
    )
    const value = bytes / Math.pow(1024, unitIndex)
    return `${Number(value.toFixed(2))} ${units[unitIndex]}`
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return Number.isNaN(date.getTime())
      ? dateString
      : date.toLocaleString()
  }

  if (!isAuthenticated) {
    return (
      <div className={`text-center text-gray-500 ${className}`}>
        <p className="text-sm">{t.googleSync.error.notAuthenticated}</p>
      </div>
    )
  }

  const isBusy = isUploading || isDownloading || isCheckingFile

  return (
    <div className={`space-y-4 ${className}`}>
      {showFileInfo && (
        <div className="rounded-lg bg-gray-50 p-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <div>
              <h3 className="font-medium text-gray-900">
                {syncFileExists
                  ? t.googleSync.syncFileExists
                  : t.googleSync.syncFileNotFound}
              </h3>
              <p className="text-xs text-gray-500">
                {t.googleSync.hiddenFile}
              </p>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={isBusy}
              variant="ghost"
              size="sm"
              className="flex items-center gap-1"
              aria-label={t.googleSync.refreshStatus}
            >
              {isCheckingFile ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
              )}
            </Button>
          </div>

          {syncFileInfo && (
            <div className="space-y-1 text-sm text-gray-600">
              <div>
                {t.googleSync.lastModified}: {formatDate(syncFileInfo.lastModified)}
              </div>
              <div>
                {t.googleSync.fileSize}: {formatFileSize(syncFileInfo.size)}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Button
          onClick={handleUpload}
          disabled={isBusy}
          variant="primary"
          className="flex items-center justify-center gap-2"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Upload className="h-4 w-4" aria-hidden="true" />
          )}
          {isUploading ? t.googleSync.uploading : t.googleSync.uploadData}
        </Button>

        <Button
          onClick={handleDownload}
          disabled={isBusy || !syncFileExists}
          variant="ghost"
          className="flex items-center justify-center gap-2"
        >
          {isDownloading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Download className="h-4 w-4" aria-hidden="true" />
          )}
          {isDownloading ? t.googleSync.downloading : t.googleSync.downloadData}
        </Button>
      </div>

      <p className="text-xs text-gray-500">
        {t.googleSync.mergeHint}
      </p>

      {error && (
        <div
          className="rounded-lg border border-red-200 bg-red-50 p-3"
          role="alert"
        >
          <p className="text-sm text-red-600">
            {getErrorMessage(errorCode, t.googleSync.error.provider)}
          </p>
        </div>
      )}
    </div>
  )
}
