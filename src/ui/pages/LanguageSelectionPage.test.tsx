// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Navigation } from '@/navigation'
import { useI18nStore } from '@/stores/i18n.store'
import { useOnboardingStore } from '@/stores/onboarding.store'
import { useProfileStore } from '@/stores/profile.store'

describe('LanguageSelectionPage navigation', () => {
  beforeEach(() => {
    localStorage.clear()
    useI18nStore.setState({
      currentLanguage: 'en',
      hasSelectedLanguage: false
    })
    useOnboardingStore.setState({
      draft: {},
      currentStep: 0,
      isComplete: false
    })
    useProfileStore.setState({
      profile: null,
      isLoading: false,
      error: null,
      loadProfile: async () => undefined
    })
  })

  it('opens the onboarding entry screen after choosing a language and continuing', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Navigation />
      </MemoryRouter>
    )

    const englishButton = await screen.findByRole('button', {
      name: /English/
    })
    const continueButton = screen.getByRole('button', {
      name: 'Continue'
    })

    expect((continueButton as HTMLButtonElement).disabled).toBe(true)
    fireEvent.click(englishButton)
    expect((continueButton as HTMLButtonElement).disabled).toBe(false)
    fireEvent.click(continueButton)

    await waitFor(() => {
      expect(screen.getByText('Choose how to get started')).toBeTruthy()
    })
    expect(localStorage.getItem('ai-trainer:has-launched')).toBe('true')
    expect(localStorage.getItem('language')).toBe('en')
    expect(useOnboardingStore.getState().draft.language).toBe('en')
    expect(useProfileStore.getState().profile).toBeNull()
  })
})
