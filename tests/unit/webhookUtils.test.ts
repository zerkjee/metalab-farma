import { describe, it, expect } from 'vitest'
import crypto from 'crypto'
import { verifyMPSignature } from '@/lib/webhookUtils'

const SECRET = 'test-secret-key'
const PAYMENT_ID = 'PAY123456'
const REQUEST_ID = 'req-uuid-abc'

function nowTs(offsetSeconds = 0) {
  return Math.floor(Date.now() / 1000) + offsetSeconds
}

function buildSignature(paymentId: string, requestId: string, ts: number, secret: string) {
  const manifest = `id:${paymentId};request-id:${requestId};ts:${ts};`
  const hmac = crypto.createHmac('sha256', secret).update(manifest).digest('hex')
  return `ts=${ts},v1=${hmac}`
}

function validInput(overrides: Partial<Parameters<typeof verifyMPSignature>[0]> = {}) {
  const ts = nowTs()
  return {
    xSignature: buildSignature(PAYMENT_ID, REQUEST_ID, ts, SECRET),
    xRequestId: REQUEST_ID,
    paymentId: PAYMENT_ID,
    secret: SECRET,
    isProd: false,
    skipVerify: false,
    ...overrides,
  }
}

// ─── Assinatura válida ────────────────────────────────────────────────────────

describe('verifyMPSignature — assinatura válida', () => {
  it('aceita assinatura HMAC correta', () => {
    expect(verifyMPSignature(validInput())).toEqual({ valid: true })
  })

  it('aceita timestamp nos últimos 5 minutos', () => {
    const ts = nowTs(-100)
    const sig = buildSignature(PAYMENT_ID, REQUEST_ID, ts, SECRET)
    expect(verifyMPSignature(validInput({ xSignature: sig }))).toEqual({ valid: true })
  })
})

// ─── HMAC incorreto ───────────────────────────────────────────────────────────

describe('verifyMPSignature — HMAC inválido', () => {
  it('rejeita HMAC com segredo errado', () => {
    const ts = nowTs()
    const sig = buildSignature(PAYMENT_ID, REQUEST_ID, ts, 'wrong-secret')
    const result = verifyMPSignature(validInput({ xSignature: sig }))
    expect(result.valid).toBe(false)
    expect((result as { reason: string }).reason).toMatch(/HMAC/)
  })

  it('rejeita HMAC com paymentId diferente do manifest', () => {
    const ts = nowTs()
    // Assina com PAYMENT_ID mas o input usa um paymentId diferente
    const sig = buildSignature('OTHER_ID', REQUEST_ID, ts, SECRET)
    const result = verifyMPSignature(validInput({ xSignature: sig }))
    expect(result.valid).toBe(false)
  })
})

// ─── Anti-replay (timestamp) ──────────────────────────────────────────────────

describe('verifyMPSignature — anti-replay', () => {
  it('rejeita request expirado (>5min atrás)', () => {
    const ts = nowTs(-400)
    const sig = buildSignature(PAYMENT_ID, REQUEST_ID, ts, SECRET)
    const result = verifyMPSignature(validInput({ xSignature: sig }))
    expect(result.valid).toBe(false)
    expect((result as { reason: string }).reason).toMatch(/expirado|replay/i)
  })

  it('rejeita timestamp muito no futuro (>5min à frente)', () => {
    const ts = nowTs(400)
    const sig = buildSignature(PAYMENT_ID, REQUEST_ID, ts, SECRET)
    const result = verifyMPSignature(validInput({ xSignature: sig }))
    expect(result.valid).toBe(false)
  })

  it('rejeita ts=0 (inválido)', () => {
    const sig = buildSignature(PAYMENT_ID, REQUEST_ID, 0, SECRET)
    const result = verifyMPSignature(validInput({ xSignature: sig }))
    expect(result.valid).toBe(false)
  })
})

// ─── Headers ausentes ─────────────────────────────────────────────────────────

describe('verifyMPSignature — headers ausentes', () => {
  it('rejeita quando x-signature é null', () => {
    const result = verifyMPSignature(validInput({ xSignature: null }))
    expect(result.valid).toBe(false)
    expect((result as { reason: string }).reason).toMatch(/ausentes/i)
  })

  it('rejeita quando x-request-id é null', () => {
    const result = verifyMPSignature(validInput({ xRequestId: null }))
    expect(result.valid).toBe(false)
  })

  it('rejeita x-signature com formato inválido (sem ts=)', () => {
    const result = verifyMPSignature(validInput({ xSignature: 'malformed' }))
    expect(result.valid).toBe(false)
  })
})

// ─── Configuração de segredo ──────────────────────────────────────────────────

describe('verifyMPSignature — sem segredo configurado', () => {
  it('rejeita em produção sem MP_WEBHOOK_SECRET', () => {
    const result = verifyMPSignature(validInput({ secret: undefined, isProd: true }))
    expect(result.valid).toBe(false)
    expect((result as { httpStatus: number }).httpStatus).toBe(503)
  })

  it('rejeita em dev sem segredo e sem skipVerify', () => {
    const result = verifyMPSignature(validInput({ secret: undefined, isProd: false, skipVerify: false }))
    expect(result.valid).toBe(false)
    expect((result as { httpStatus: number }).httpStatus).toBe(503)
  })

  it('permite em dev com MP_WEBHOOK_SKIP_VERIFY=1', () => {
    const result = verifyMPSignature(validInput({ secret: undefined, isProd: false, skipVerify: true }))
    expect(result.valid).toBe(true)
  })
})
