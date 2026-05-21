import { defineConfig, devices } from '@playwright/test'
import { config as dotenvConfig } from 'dotenv'

// Load E2E env vars before config is evaluated
dotenvConfig({ path: '.env.e2e' })

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? process.env.NEXT_PUBLIC_URL ?? 'http://localhost:3000'

export default defineConfig({
  testDir: './e2e/tests',
  outputDir: './e2e/results',
  timeout: 60_000,
  expect: { timeout: 12_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // 1 worker local: dev server reinicia por memória com requests concorrentes
  workers: process.env.CI ? 2 : 1,

  reporter: [
    ['html', { outputFolder: 'e2e/report', open: 'never' }],
    ...(process.env.CI ? [['junit', { outputFile: 'e2e/results/junit.xml' }] as [string, object]] : []),
    ['list'],
  ],

  use: {
    baseURL: BASE_URL,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
  },

  projects: [
    // Auth setup — runs first, produces stored auth state
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },

    // Desktop — main test matrix
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      dependencies: ['setup'],
    },

    // Mobile — iPhone 14 Pro (375×812, devicePixelRatio 3)
    {
      name: 'mobile-iphone',
      testMatch: /mobile\.spec\.ts/,
      use: { ...devices['iPhone 14 Pro'] },
      dependencies: ['setup'],
    },

    // Mobile — Android Pixel 7 (412×892)
    {
      name: 'mobile-android',
      testMatch: /mobile\.spec\.ts/,
      use: { ...devices['Pixel 7'] },
      dependencies: ['setup'],
    },

    // Tablet — iPad Pro (1024×1366)
    {
      name: 'tablet',
      testMatch: /mobile\.spec\.ts/,
      use: { ...devices['iPad Pro'] },
      dependencies: ['setup'],
    },
  ],

  webServer: {
    // Em CI usa next start (build já feito antes), local usa dev server
    command: process.env.CI ? 'npx next start' : 'npm run dev',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: 'ignore',
    stderr: 'pipe',
    // Supabase local TLS certificate chain não é trusted neste ambiente
    env: { ...process.env, NODE_TLS_REJECT_UNAUTHORIZED: '0' },
  },
})
