import { create } from 'zustand'
import {
  GoogleDriveError,
  googleDriveService,
  type GoogleDriveErrorCode
} from '@services/googleDrive'

interface GoogleAuthState {
  isAuthenticated: boolean
  expiresAt: string | null
  isLoading: boolean
  isSigningIn: boolean
  isSigningOut: boolean
  error: string | null
  errorCode: GoogleDriveErrorCode | null
  signIn: () => Promise<void>
  signOut: () => Promise<void>
  checkAuthState: () => void
  clearError: () => void
}

function getErrorCode(error: unknown): GoogleDriveErrorCode | null {
  return error instanceof GoogleDriveError ? error.code : null
}

export const useGoogleAuthStore = create<GoogleAuthState>((set) => ({
  isAuthenticated: false,
  expiresAt: null,
  isLoading: false,
  isSigningIn: false,
  isSigningOut: false,
  error: null,
  errorCode: null,

  signIn: async () => {
    set({
      isSigningIn: true,
      error: null,
      errorCode: null
    })

    try {
      await googleDriveService.signIn()
      const authState = googleDriveService.getAuthState()

      set({
        ...authState,
        isSigningIn: false
      })
    } catch (error) {
      set({
        isAuthenticated: false,
        expiresAt: null,
        error: error instanceof Error ? error.message : 'AUTH_FAILED',
        errorCode: getErrorCode(error),
        isSigningIn: false
      })
      throw error
    }
  },

  signOut: async () => {
    set({
      isSigningOut: true,
      error: null,
      errorCode: null
    })

    try {
      await googleDriveService.signOut()
      set({
        isAuthenticated: false,
        expiresAt: null,
        isSigningOut: false
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'AUTH_FAILED',
        errorCode: getErrorCode(error),
        isSigningOut: false
      })
      throw error
    }
  },

  checkAuthState: () => {
    set({
      ...googleDriveService.getAuthState(),
      isLoading: false
    })
  },

  clearError: () => {
    set({
      error: null,
      errorCode: null
    })
  }
}))

googleDriveService.subscribeAuthState(authState => {
  useGoogleAuthStore.setState({
    ...authState,
    isLoading: false
  })
})
