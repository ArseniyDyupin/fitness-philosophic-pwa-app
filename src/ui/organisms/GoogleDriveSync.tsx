import React, { useEffect } from 'react'
import {
  AlertCircle,
  Clock3,
  Cloud,
  FolderLock,
  MousePointerClick
} from 'lucide-react'
import { googleDriveService } from '@/services/googleDrive'
import { useGoogleAuthStore } from '@/stores/googleAuth.store'
import { useSyncStore } from '@/stores/sync.store'
import { useTranslations } from '@/stores/i18n.store'
import { GoogleSignInButton } from '@/ui/molecules/GoogleSignInButton'
import { SyncButtons } from '@/ui/molecules/SyncButtons'
import Card from '@/ui/atoms/Card'

interface GoogleDriveSyncProps {
  className?: string
}

export const GoogleDriveSync: React.FC<GoogleDriveSyncProps> = ({
  className = ''
}) => {
  const { isAuthenticated, checkAuthState } = useGoogleAuthStore()
  const resetSyncState = useSyncStore(state => state.reset)
  const t = useTranslations()
  const isConfigured = googleDriveService.isConfigured()

  useEffect(() => {
    checkAuthState()
  }, [checkAuthState])

  useEffect(() => {
    if (!isAuthenticated) {
      resetSyncState()
    }
  }, [isAuthenticated, resetSyncState])

  if (!isConfigured) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-amber-100 p-3">
              <AlertCircle
                className="h-8 w-8 text-amber-700"
                aria-hidden="true"
              />
            </div>
          </div>
          <h2 className="mb-2 text-xl font-semibold text-gray-900">
            {t.googleSync.unavailableTitle}
          </h2>
          <p className="text-sm text-gray-600">
            {t.googleSync.error.notConfigured}
          </p>
        </div>
      </Card>
    )
  }

  const features = [
    {
      icon: FolderLock,
      title: t.googleSync.features.privateTitle,
      description: t.googleSync.features.privateDescription,
      color: 'text-green-600'
    },
    {
      icon: MousePointerClick,
      title: t.googleSync.features.manualTitle,
      description: t.googleSync.features.manualDescription,
      color: 'text-blue-600'
    },
    {
      icon: Clock3,
      title: t.googleSync.features.sessionTitle,
      description: t.googleSync.features.sessionDescription,
      color: 'text-purple-600'
    }
  ]

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-6">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-blue-100 p-3">
              <Cloud className="h-8 w-8 text-blue-600" aria-hidden="true" />
            </div>
          </div>
          <h2 className="mb-2 text-xl font-semibold text-gray-900">
            {t.googleSync.title}
          </h2>
          <p className="text-sm text-gray-600">
            {t.googleSync.description}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {features.map(({ icon: Icon, title, description, color }) => (
            <div key={title} className="text-center">
              <div className="mb-2 flex justify-center">
                <Icon className={`h-6 w-6 ${color}`} aria-hidden="true" />
              </div>
              <h3 className="mb-1 text-sm font-medium text-gray-900">
                {title}
              </h3>
              <p className="text-xs text-gray-500">
                {description}
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="text-xs text-amber-900">
            {t.googleSync.privacyNote}
          </p>
        </div>

        <div className="border-t pt-6">
          <GoogleSignInButton className="w-full" />
        </div>

        {isAuthenticated && (
          <div className="border-t pt-6">
            <SyncButtons />
          </div>
        )}
      </div>
    </Card>
  )
}
