import { expect, test, type Page } from '@playwright/test'

async function seedProfileAndWorkout(page: Page) {
  await page.goto('/')
  await page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('AITrainerDB')
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    const transaction = database.transaction(['profiles', 'workouts'], 'readwrite')
    transaction.objectStore('profiles').put({
      id: 'me', name: 'QA User', age: 30, gender: 'other', height: 175, weight: 75,
      goal: 'Stay healthy', constraints: [], equipment: [], frequency: 3, duration: 40,
      language: 'en', goalsDetailed: '', createdAt: '2026-07-17T08:00:00.000Z',
      updatedAt: '2026-07-17T08:00:00.000Z'
    })
    transaction.objectStore('workouts').put({
      id: 'qa-workout', name: 'QA Workout', date: '2026-07-17', status: 'completed',
      isPlan: false, rpe: 6, exercises: [{ type: 'run', details: { durationMin: 20 } }],
      createdAt: '2026-07-17T08:00:00.000Z', updatedAt: '2026-07-17T08:00:00.000Z'
    })
    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
    database.close()
    localStorage.setItem('language', 'en')
    localStorage.setItem('ai-trainer:has-launched', 'true')
  })
}

test('language CTA works and whitespace-only onboarding name is rejected', async ({ page }) => {
  await page.goto('/')
  const continueButton = page.getByRole('button', { name: 'Continue' })
  await expect(continueButton).toBeDisabled()
  await page.getByRole('button', { name: /English/ }).click()
  await continueButton.click()
  await expect(page).toHaveURL(/\/entry$/)

  await page.getByRole('button', { name: /Begin Onboarding/i }).click()
  await page.getByLabel(/name/i).fill('   ')
  const nextButton = page.getByRole('button', { name: /next/i })
  await expect(nextButton).toBeDisabled()
  await expect(page.getByRole('alert')).toContainText(/name/i)
})

test('cold workout route, weekly review and full reset survive reload', async ({ page }) => {
  await seedProfileAndWorkout(page)
  await page.goto('/workouts/qa-workout')
  await expect(page.getByRole('heading', { name: /Workout Details/i })).toBeVisible()
  await page.reload()
  await expect(page.getByText('Friday, July 17, 2026')).toBeVisible()

  await page.goto('/weekly-review')
  await expect(page.getByRole('heading', { name: 'Weekly review' })).toBeVisible()
  await expect(page.locator('body')).toHaveCSS('overflow-x', /visible|auto|hidden/)

  await page.goto('/settings')
  page.once('dialog', dialog => dialog.accept())
  await page.getByRole('button', { name: 'Delete all local data' }).click()
  await expect(page.getByRole('button', { name: /English/ })).toBeVisible()
})

test('language change persists and replace import refreshes live application state', async ({ page }) => {
  await seedProfileAndWorkout(page)
  await page.goto('/settings')

  await page.getByRole('button', { name: 'Edit language' }).click()
  await page.getByLabel('Русский').check()
  await page.getByRole('button', { name: 'Save' }).first().click()
  await expect(page.getByRole('heading', { name: 'Настройки', level: 1 })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Настройки', level: 1 })).toBeVisible()

  await page.getByRole('button', { name: 'Редактировать язык' }).click()
  await page.getByLabel('English').check()
  await page.getByRole('button', { name: 'Сохранить' }).first().click()
  await expect(page.getByRole('heading', { name: 'Settings', level: 1 })).toBeVisible()

  const backup = {
    schemaVersion: 1,
    exportedAt: '2026-07-17T12:00:00.000Z',
    profile: {
      id: 'me', name: 'Imported QA', age: 31, gender: 'other', height: 176, weight: 74,
      goal: 'Imported goal', constraints: [], equipment: [], frequency: 4, duration: 45,
      language: 'en', goalsDetailed: '', createdAt: '2026-07-17T08:00:00.000Z',
      updatedAt: '2026-07-17T12:00:00.000Z'
    },
    workouts: [{
      id: 'imported-workout', name: 'Imported Workout', date: '2026-07-16', status: 'completed',
      isPlan: false, exercises: [], createdAt: '2026-07-16T08:00:00.000Z',
      updatedAt: '2026-07-16T08:00:00.000Z'
    }]
  }
  await page.locator('input[type="file"][accept*="json"]').first().setInputFiles({
    name: 'backup.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(backup))
  })
  await expect(page.getByText('Schema Version: 1')).toBeVisible()
  await expect(page.getByText(/SHA-256:/)).toBeVisible()
  await page.getByRole('button', { name: 'Import', exact: true }).click()
  await expect(page).toHaveURL(/\/$/)

  await page.goto('/workouts/imported-workout')
  await expect(page.getByText('Imported Workout')).toBeVisible()
  await page.reload()
  await expect(page.getByText('Imported Workout')).toBeVisible()
})

test('weekly review persists decline and applies an accepted plan change', async ({ page }) => {
  await seedProfileAndWorkout(page)
  await page.goto('/weekly-review')
  await page.getByLabel('Energy').fill('2')
  await page.getByRole('button', { name: 'Save and get recommendation' }).click()
  await expect(page.getByRole('heading', { name: 'Next-week recommendation' })).toBeVisible()

  await page.getByRole('button', { name: 'Preview plan changes' }).click()
  await page.getByRole('button', { name: 'Keep current plan' }).click()
  await expect(page.getByRole('main').getByText('Current plan kept', { exact: true })).toBeVisible()

  await page.reload()
  await page.getByRole('button', { name: 'Preview plan changes' }).click()
  await expect(page.getByRole('main').getByText('Current plan kept', { exact: true })).toBeVisible()

  await page.getByRole('button', { name: 'Save and get recommendation' }).click()
  await page.getByRole('button', { name: 'Preview plan changes' }).click()
  page.once('dialog', dialog => dialog.accept())
  await page.getByRole('button', { name: 'Apply changes' }).click()
  await expect(page.getByRole('main').getByText('Changes accepted', { exact: true })).toBeVisible()

  const profilePlan = await page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('AITrainerDB')
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    const transaction = database.transaction('profiles', 'readonly')
    const request = transaction.objectStore('profiles').get('me')
    const profile = await new Promise<{ frequency: number; duration: number }>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    database.close()
    return { frequency: profile.frequency, duration: profile.duration }
  })
  expect(profilePlan).toEqual({ frequency: 2, duration: 30 })
})

test('installed app shell opens offline', async ({ page, context }) => {
  await seedProfileAndWorkout(page)
  await page.goto('/')
  await page.evaluate(() => navigator.serviceWorker.ready)
  await page.reload()

  await context.setOffline(true)
  try {
    await page.reload()
    await expect(page.getByRole('link', { name: 'AI Trainer' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Add Workout' }).first()).toBeVisible()
  } finally {
    await context.setOffline(false)
  }
})
