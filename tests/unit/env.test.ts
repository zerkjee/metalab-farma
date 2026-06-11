import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('@/lib/logger', () => ({
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

import { checkEnv, validateEnv } from '@/lib/env'
import { logger } from '@/lib/logger'

const CRITICAS = ['DATABASE_URL', 'AUTH_SECRET', 'NEXTAUTH_URL', 'MERCADOPAGO_ACCESS_TOKEN', 'MP_WEBHOOK_SECRET', 'RESEND_API_KEY', 'EMAIL_FROM']
const OPERACIONAIS = ['MELHOR_ENVIO_TOKEN', 'MELHOR_ENVIO_ORIGIN_CEP', 'UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN', 'QSTASH_CURRENT_SIGNING_KEY', 'QSTASH_TOKEN']
const EXTRAS = ['NEXTAUTH_SECRET', 'NEXT_PUBLIC_URL', 'NODE_ENV', 'VERCEL_ENV']

const ALL = [...CRITICAS, ...OPERACIONAIS, ...EXTRAS]
let saved: Record<string, string | undefined>

function setAllPresent() {
  for (const k of [...CRITICAS, ...OPERACIONAIS]) process.env[k] = 'x'
}

function setNodeEnv(v: string) {
  ;(process.env as Record<string, string | undefined>).NODE_ENV = v
}

// Simula produção REAL na Vercel (NODE_ENV=production + VERCEL_ENV=production).
function setRealProd() {
  setNodeEnv('production')
  process.env.VERCEL_ENV = 'production'
}

beforeEach(() => {
  vi.clearAllMocks()
  saved = {}
  for (const k of ALL) saved[k] = process.env[k]
})

afterEach(() => {
  for (const k of ALL) {
    if (saved[k] === undefined) delete process.env[k]
    else process.env[k] = saved[k]
  }
})

describe('checkEnv', () => {
  it('não reporta ausências quando tudo está presente', () => {
    setAllPresent()
    const r = checkEnv()
    expect(r.criticasAusentes).toEqual([])
    expect(r.operacionaisAusentes).toEqual([])
  })

  it('reporta a crítica ausente pelo nome', () => {
    setAllPresent()
    delete process.env.DATABASE_URL
    expect(checkEnv().criticasAusentes).toContain('DATABASE_URL')
  })

  it('aceita "uma das alternativas" (NEXTAUTH_SECRET cobre AUTH_SECRET)', () => {
    setAllPresent()
    delete process.env.AUTH_SECRET
    process.env.NEXTAUTH_SECRET = 'x'
    expect(checkEnv().criticasAusentes).not.toContain('AUTH_SECRET ou NEXTAUTH_SECRET')
  })

  it('reporta o par ausente quando nenhuma alternativa existe', () => {
    setAllPresent()
    delete process.env.AUTH_SECRET
    delete process.env.NEXTAUTH_SECRET
    expect(checkEnv().criticasAusentes).toContain('AUTH_SECRET ou NEXTAUTH_SECRET')
  })
})

describe('validateEnv', () => {
  it('lança em produção REAL (VERCEL_ENV=production) quando falta variável crítica', () => {
    setAllPresent()
    setRealProd()
    delete process.env.EMAIL_FROM
    expect(() => validateEnv()).toThrow(/EMAIL_FROM/)
  })

  it('a mensagem de erro lista nomes, nunca valores/segredos', () => {
    setAllPresent()
    setRealProd()
    process.env.DATABASE_URL = 'postgres://user:SUPERSECRET@host/db'
    delete process.env.EMAIL_FROM
    try {
      validateEnv()
      throw new Error('deveria ter lançado')
    } catch (e) {
      const msg = (e as Error).message
      expect(msg).toContain('EMAIL_FROM')
      expect(msg).not.toContain('SUPERSECRET')
    }
  })

  it('NÃO derruba CI/preview (NODE_ENV=production sem VERCEL_ENV=production) — só loga', () => {
    setAllPresent()
    setNodeEnv('production')          // CI/E2E: next start, mas não é prod real
    delete process.env.VERCEL_ENV
    delete process.env.MERCADOPAGO_ACCESS_TOKEN
    delete process.env.EMAIL_FROM
    expect(() => validateEnv()).not.toThrow()
    expect(logger.error).toHaveBeenCalled()
  })

  it('preview da Vercel (VERCEL_ENV=preview) também não derruba', () => {
    setAllPresent()
    setNodeEnv('production')
    process.env.VERCEL_ENV = 'preview'
    delete process.env.RESEND_API_KEY
    expect(() => validateEnv()).not.toThrow()
  })

  it('NÃO lança quando só faltam operacionais (apenas loga)', () => {
    setAllPresent()
    setRealProd()
    delete process.env.UPSTASH_REDIS_REST_URL
    expect(() => validateEnv()).not.toThrow()
    expect(logger.error).toHaveBeenCalled()
  })

  it('NÃO lança em desenvolvimento mesmo faltando crítica', () => {
    setNodeEnv('development')
    for (const k of [...CRITICAS, ...OPERACIONAIS]) delete process.env[k]
    expect(() => validateEnv()).not.toThrow()
  })
})
