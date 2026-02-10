import { defineConfig, devices } from 'playwright/test'

const PORT = process.env.E2E_PORT ? Number(process.env.E2E_PORT) : 3100

export default defineConfig({
  testDir: './e2e',
  testIgnore: ['**/pages.spec.ts'],
  timeout: 60_000,
  expect: {
    timeout: 10_000,
    // Allow tiny subpixel/font rasterization differences across machines.
    toHaveScreenshot: { maxDiffPixelRatio: 0.01 },
  },
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
  webServer: {
    command: `yarn next dev -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
