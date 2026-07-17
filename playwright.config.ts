import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: 0,
  reporter: 'line',
  use: {
    baseURL: 'http://127.0.0.1:4175',
    trace: 'retain-on-failure'
  },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'], timezoneId: 'Pacific/Kiritimati' } },
    { name: 'mobile-320', use: { ...devices['Pixel 7'], viewport: { width: 320, height: 720 }, timezoneId: 'America/Los_Angeles' } },
    { name: 'mobile-375', use: { ...devices['Pixel 7'], viewport: { width: 375, height: 812 }, timezoneId: 'Europe/Belgrade' } },
    { name: 'tablet-768', use: { ...devices['Desktop Chrome'], viewport: { width: 768, height: 1024 }, hasTouch: true, timezoneId: 'UTC' } }
  ],
  webServer: {
    command: 'npm run build && npm run preview -- --host 127.0.0.1 --port 4175',
    url: 'http://127.0.0.1:4175',
    reuseExistingServer: true,
    timeout: 120_000
  }
})
