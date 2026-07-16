import React from 'react'
import { toast } from 'react-hot-toast'
import { CheckCircle2, Loader2, LogIn, LogOut } from 'lucide-react'
import { GoogleDriveError } from '@/services/googleDrive'
import { useGoogleAuthStore } from '@/stores/googleAuth.store'
import { useTranslations } from '@/stores/i18n.store'
import { getGoogleSyncErrorMessage } from '@/utils/googleSyncError'
import Button from '@/ui/atoms/Button'

interface GoogleSignInButtonProps {
  className?: string
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  className = '',
  variant = 'ghost',
  size = 'md'
}) => {
  const {
    isAuthenticated,
    isSigningIn,
    isSigningOut,
    signIn,
    signOut,
    error,
    errorCode
  } = useGoogleAuthStore()
  const t = useTranslations()

  const getErrorMessage = (
    code: typeof errorCode,
    fallback: string
  ) => getGoogleSyncErrorMessage(code, t.googleSync.error, fallback)

  const handleSignIn = async () => {
    try {
      await signIn()
      toast.success(t.googleSync.success.signIn)
    } catch (caughtError) {
      const code = caughtError instanceof GoogleDriveError
        ? caughtError.code
        : null
      toast.error(getErrorMessage(code, t.googleSync.error.signIn))
    }
  }

  const handleSignOut = async () => {
    if (!window.confirm(t.googleSync.confirm.signOut)) {
      return
    }

    try {
      await signOut()
      toast.success(t.googleSync.success.signOut)
    } catch {
      toast.error(t.googleSync.error.signOut)
    }
  }

  if (isAuthenticated) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="flex items-center gap-2 text-sm text-green-700">
          <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" />
          <div>
            <div className="font-medium">{t.googleSync.authorized}</div>
            <div className="text-xs text-gray-500">
              {t.googleSync.sessionOnly}
            </div>
          </div>
        </div>
        <Button
          onClick={handleSignOut}
          disabled={isSigningOut}
          variant={variant}
          size={size}
          className="flex w-full items-center justify-center gap-2"
        >
          {isSigningOut ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <LogOut className="h-4 w-4" aria-hidden="true" />
          )}
          {t.googleSync.signOut}
        </Button>
      </div>
    )
  }

  return (
    <div className={className}>
      <Button
        onClick={handleSignIn}
        disabled={isSigningIn}
        variant={variant}
        size={size}
        className="flex w-full items-center justify-center gap-2"
      >
        {isSigningIn ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <LogIn className="h-4 w-4" aria-hidden="true" />
        )}
        {isSigningIn ? t.googleSync.authorizing : t.googleSync.signIn}
      </Button>
      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {getErrorMessage(errorCode, t.googleSync.error.signIn)}
        </p>
      )}
    </div>
  )
}
