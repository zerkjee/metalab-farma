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

// ─── Correlação (aditivo, edge-safe) ────────────────────────────────────────
// Enriquece o log estruturado com correlationId/requestId QUANDO houver um
// contexto ativo (lib/observability/correlation). Import é dinâmico e lazy para
// não puxar node:async_hooks para o bundle edge; se falhar (edge/qualquer erro),
// o logger segue exatamente como antes. Nada é ligado a rotas — os handlers só
// passam a ter contexto quando PRs futuros usarem runWithCorrelation.
type CorrGetter = () => { correlationId?: string; requestId?: string } | undefined
let corrGetter: CorrGetter | null = null
let corrLoadStarted = false

function ensureCorrLoaded() {
  if (corrLoadStarted) return
  corrLoadStarted = true
  void import('./observability/correlation')
    .then((m) => {
      corrGetter = m.getContext
    })
    .catch(() => {
      corrGetter = null
    })
}

function correlationCtx(): Ctx | undefined {
  try {
    ensureCorrLoaded()
    const c = corrGetter?.()
    if (!c) return undefined
    const out: Ctx = {}
    if (c.correlationId) out.correlationId = c.correlationId
    if (c.requestId) out.requestId = c.requestId
    return Object.keys(out).length ? out : undefined
  } catch {
    return undefined
  }
}

function emit(level: Level, msg: string, ctx?: Ctx) {
  const fn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log
  if (prod) {
    const corr = correlationCtx()
    fn(JSON.stringify({ level, ts: new Date().toISOString(), msg, ...corr, ...ctx }))
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
