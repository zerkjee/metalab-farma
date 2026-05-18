import { describe, it, expect } from 'vitest'
import { sentryBeforeSend } from '@/lib/sentryUtils'
import type { ErrorEvent } from '@sentry/nextjs'

function makeEvent(overrides: Partial<ErrorEvent> = {}): ErrorEvent {
  return { type: undefined, ...overrides } as ErrorEvent
}

// ─── Drop de erros não-acionáveis ─────────────────────────────────────────────

describe('sentryBeforeSend — drop de erros não-acionáveis', () => {
  const noop = [
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications',
    'Network request failed',
    'Load failed',
    'cancelled',
    'Loading chunk 42 failed',
  ]

  for (const msg of noop) {
    it(`descarta: "${msg}"`, () => {
      expect(sentryBeforeSend(makeEvent({ message: msg }))).toBeNull()
    })
  }

  it('passa eventos com mensagem não-listada', () => {
    expect(sentryBeforeSend(makeEvent({ message: 'Database timeout' }))).not.toBeNull()
  })

  it('descarta erros pelo value da exception', () => {
    const event = makeEvent({
      exception: { values: [{ value: 'ResizeObserver loop limit exceeded' }] },
    })
    expect(sentryBeforeSend(event)).toBeNull()
  })
})

// ─── Sanitização de headers ───────────────────────────────────────────────────

describe('sentryBeforeSend — sanitização de headers', () => {
  it('remove header authorization', () => {
    const event = makeEvent({
      request: { headers: { authorization: 'Bearer secret-token', 'content-type': 'application/json' } },
    })
    const result = sentryBeforeSend(event)!
    const headers = result.request!.headers as Record<string, unknown>
    expect(headers['authorization']).toBeUndefined()
    expect(headers['content-type']).toBe('application/json')
  })

  it('remove header cookie', () => {
    const event = makeEvent({
      request: { headers: { cookie: 'session=abc123' } },
    })
    const result = sentryBeforeSend(event)!
    const headers = result.request!.headers as Record<string, unknown>
    expect(headers['cookie']).toBeUndefined()
  })

  it('remove cookies do objeto request', () => {
    const event = makeEvent({
      request: { cookies: { 'next-auth.session-token': 'xyz' } },
    })
    const result = sentryBeforeSend(event)!
    expect((result.request as Record<string, unknown>)['cookies']).toBeUndefined()
  })
})

// ─── Sanitização de PII em extra ─────────────────────────────────────────────

describe('sentryBeforeSend — PII em extra', () => {
  it('redact email', () => {
    const event = makeEvent({ extra: { email: 'user@example.com', pedidoId: '123' } })
    const result = sentryBeforeSend(event)!
    expect(result.extra!['email']).toBe('[redacted]')
    expect(result.extra!['pedidoId']).toBe('123')
  })

  it('redact cpf', () => {
    const event = makeEvent({ extra: { cpf: '12345678909' } })
    const result = sentryBeforeSend(event)!
    expect(result.extra!['cpf']).toBe('[redacted]')
  })

  it('redact pixQrCode', () => {
    const event = makeEvent({ extra: { pixQrCode: 'longqrstring...' } })
    const result = sentryBeforeSend(event)!
    expect(result.extra!['pixQrCode']).toBe('[redacted]')
  })

  it('redact token em extra', () => {
    const event = makeEvent({ extra: { token: 'bearer-abc123', route: '/api/pagamento' } })
    const result = sentryBeforeSend(event)!
    expect(result.extra!['token']).toBe('[redacted]')
    expect(result.extra!['route']).toBe('/api/pagamento')
  })

  it('preserva campos não-sensíveis', () => {
    const event = makeEvent({ extra: { pedidoNumero: 'MTL-2026-ABC123', total: 150 } })
    const result = sentryBeforeSend(event)!
    expect(result.extra!['pedidoNumero']).toBe('MTL-2026-ABC123')
    expect(result.extra!['total']).toBe(150)
  })
})
