// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { googleDriveService } from '@/services/googleDrive'
import { useGoogleAuthStore } from '@/stores/googleAuth.store'
import { useI18nStore } from '@/stores/i18n.store'
import { GoogleDriveSync } from './GoogleDriveSync'

describe('GoogleDriveSync OAuth configuration', () => {
  beforeEach(async () => {
    localStorage.clear()
    await googleDriveService.clearClientIdOverride()
    useI18nStore.setState({
      currentLanguage: 'en',
      hasSelectedLanguage: true
    })
    useGoogleAuthStore.setState({
      isAuthenticated: false,
      expiresAt: null,
      isLoading: false,
      isSigningIn: false,
      isSigningOut: false,
      error: null,
      errorCode: null
    })
  })

  afterEach(async () => {
    await googleDriveService.clearClientIdOverride()
    localStorage.clear()
  })

  it('validates, saves, and resets a browser Client ID without rebuilding', async () => {
    render(<GoogleDriveSync />)

    expect(screen.queryByRole('button', {
      name: 'Authorize Google Drive'
    })).toBeNull()

    const input = screen.getByLabelText('Google OAuth Client ID')
    fireEvent.change(input, {
      target: { value: 'invalid-client-id' }
    })
    fireEvent.click(screen.getByRole('button', {
      name: 'Save Client ID'
    }))

    expect((await screen.findByRole('alert')).textContent).toContain(
      'Enter a valid Google OAuth Client ID'
    )
    expect(localStorage.getItem('ai-trainer:google-client-id')).toBeNull()

    fireEvent.change(input, {
      target: { value: 'browser-client.apps.googleusercontent.com' }
    })
    fireEvent.click(screen.getByRole('button', {
      name: 'Save Client ID'
    }))

    expect((await screen.findByRole('status')).textContent).toContain(
      'Google OAuth Client ID saved'
    )
    expect(localStorage.getItem('ai-trainer:google-client-id')).toBe(
      'browser-client.apps.googleusercontent.com'
    )
    expect(screen.getByRole('button', {
      name: 'Authorize Google Drive'
    })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', {
      name: 'Remove local Client ID'
    }))

    await waitFor(() => {
      expect(localStorage.getItem('ai-trainer:google-client-id')).toBeNull()
    })
    expect(screen.queryByRole('button', {
      name: 'Authorize Google Drive'
    })).toBeNull()
  })
})
