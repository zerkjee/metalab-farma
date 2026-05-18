type Level = 'debug' | 'info' | 'warn' | 'error'
type Ctx = Record<string, unknown>

const prod = process.env.NODE_ENV === 'production'

function toCtx(val: unknown): Ctx | undefined {
  if (val === undefined || val === null) return undefined
  if (val instanceof Error) {
    return { err: val.message, ...(prod ? {} : { stack: val.stack }) }
  }
  if (typeof val === 'object' && !Array.isArray(val)) return val as Ctx
  return { raw: String(val) }
}

function emit(level: Level, msg: string, ctx?: Ctx) {
  const fn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log
  if (prod) {
    fn(JSON.stringify({ level, ts: new Date().toISOString(), msg, ...ctx }))
  } else {
    fn(`[${level.toUpperCase()}] ${msg}`, ctx ?? '')
  }
}

function captureSentry(msg: string, err?: unknown) {
  if (typeof window !== 'undefined' || !process.env.SENTRY_DSN) return
  void import('@sentry/nextjs')
    .then(({ captureException, captureMessage }) => {
      if (err instanceof Error) {
        captureException(err, { extra: { logMsg: msg } })
      } else {
        captureMessage(msg, 'error')
      }
    })
    .catch(() => {})
}

export const logger = {
  debug: (msg: string, ctx?: Ctx) => emit('debug', msg, ctx),
  info:  (msg: string, ctx?: Ctx) => emit('info',  msg, ctx),
  warn:  (msg: string, ctx?: Ctx) => emit('warn',  msg, ctx),
  error: (msg: string, err?: unknown) => {
    emit('error', msg, toCtx(err))
    captureSentry(msg, err)
  },
}
