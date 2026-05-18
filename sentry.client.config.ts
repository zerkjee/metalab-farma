import * as Sentry from '@sentry/nextjs'
import { sentryBeforeSend } from './lib/sentryUtils'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.05,
  sendDefaultPii: false,
  beforeSend: sentryBeforeSend,
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications',
    /Loading chunk \d+ failed/,
    /Failed to fetch dynamically imported module/,
    'Non-Error promise rejection captured',
    'Network request failed',
    'Load failed',
  ],
})
