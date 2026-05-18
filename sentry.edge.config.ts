import * as Sentry from '@sentry/nextjs'
import { sentryBeforeSend } from './lib/sentryUtils'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0,
  sendDefaultPii: false,
  beforeSend: sentryBeforeSend,
})
