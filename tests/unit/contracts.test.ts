import { describe, it, expect } from 'vitest'
import {
  makeEnvelope,
  orderPaidV1Schema,
  orderPaidV1PayloadSchema,
  pixExpiredV1Schema,
  pixExpiredV1PayloadSchema,
  cartAbandonedV1Schema,
  cartAbandonedV1PayloadSchema,
  domainEventSchema,
  EVENT_TYPES,
  EVENT_REGISTRY,
} from '@/lib/contracts'

const goodOrderPayload = {
  pedidoId: 'ped_1',
  numero: '1001',
  compradorNome: 'Ana Silva',
  compradorEmail: 'ana@example.com',
  total: 199.9,
  metodoPagamento: 'pix',
  itens: [{ nome: 'Creatina', quantidade: 2, precoUnit: 99.95 }],
}

const goodPixPayload = {
  pedidoId: 'ped_1',
  numero: '1001',
  compradorEmail: 'ana@example.com',
}

const goodCartPayload = {
  cartSessionId: 'cart_1',
  email: 'ana@example.com',
  stage: '1h' as const,
}

function envelope<T>(eventType: string, payload: T) {
  return makeEnvelope({
    eventType,
    eventVersion: '1',
    correlationId: 'corr_1',
    producer: 'test',
    idempotencyKey: 'idem_1',
    payload,
  })
}

// ─── makeEnvelope ─────────────────────────────────────────────────────────────

describe('makeEnvelope', () => {
  it('preenche eventId (uuid) e occurredAt (ISO) quando ausentes', () => {
    const e = envelope(EVENT_TYPES.ORDER_PAID, goodOrderPayload)
    expect(e.eventId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
    expect(() => new Date(e.occurredAt).toISOString()).not.toThrow()
    expect(new Date(e.occurredAt).toISOString()).toBe(e.occurredAt)
    expect(e.causationId).toBeNull()
  })

  it('respeita eventId/occurredAt/causationId fornecidos', () => {
    const e = makeEnvelope({
      eventType: EVENT_TYPES.ORDER_PAID,
      eventVersion: '1',
      correlationId: 'corr_1',
      producer: 'test',
      idempotencyKey: 'idem_1',
      payload: goodOrderPayload,
      eventId: '11111111-1111-4111-8111-111111111111',
      occurredAt: '2026-07-12T10:00:00.000Z',
      causationId: 'cause_1',
    })
    expect(e.eventId).toBe('11111111-1111-4111-8111-111111111111')
    expect(e.occurredAt).toBe('2026-07-12T10:00:00.000Z')
    expect(e.causationId).toBe('cause_1')
  })
})

// ─── Envelope genérico ────────────────────────────────────────────────────────

describe('envelope (order.paid.v1)', () => {
  it('faz parse de um envelope válido', () => {
    const e = envelope(EVENT_TYPES.ORDER_PAID, goodOrderPayload)
    expect(orderPaidV1Schema.safeParse(e).success).toBe(true)
  })

  it('rejeita quando falta um campo obrigatório do envelope', () => {
    const e = envelope(EVENT_TYPES.ORDER_PAID, goodOrderPayload) as Record<string, unknown>
    delete e.correlationId
    expect(orderPaidV1Schema.safeParse(e).success).toBe(false)
  })

  it('rejeita eventId que não é uuid', () => {
    const e = envelope(EVENT_TYPES.ORDER_PAID, goodOrderPayload)
    expect(orderPaidV1Schema.safeParse({ ...e, eventId: 'nope' }).success).toBe(false)
  })

  it('rejeita occurredAt que não é ISO datetime', () => {
    const e = envelope(EVENT_TYPES.ORDER_PAID, goodOrderPayload)
    expect(orderPaidV1Schema.safeParse({ ...e, occurredAt: '12/07/2026' }).success).toBe(false)
  })

  it('rejeita eventType errado no schema específico', () => {
    const e = envelope(EVENT_TYPES.PIX_EXPIRED, goodOrderPayload)
    expect(orderPaidV1Schema.safeParse(e).success).toBe(false)
  })
})

// ─── Payloads por evento ──────────────────────────────────────────────────────

describe('order.paid.v1 payload', () => {
  it('aceita payload válido', () => {
    expect(orderPaidV1PayloadSchema.safeParse(goodOrderPayload).success).toBe(true)
  })
  it('rejeita e-mail inválido', () => {
    expect(orderPaidV1PayloadSchema.safeParse({ ...goodOrderPayload, compradorEmail: 'nope' }).success).toBe(false)
  })
  it('rejeita quantidade não-positiva', () => {
    const bad = { ...goodOrderPayload, itens: [{ nome: 'X', quantidade: 0, precoUnit: 1 }] }
    expect(orderPaidV1PayloadSchema.safeParse(bad).success).toBe(false)
  })
})

describe('pix.expired.v1 payload', () => {
  it('aceita payload válido', () => {
    expect(pixExpiredV1PayloadSchema.safeParse(goodPixPayload).success).toBe(true)
  })
  it('rejeita quando falta numero', () => {
    const bad = { pedidoId: 'ped_1', compradorEmail: 'ana@example.com' }
    expect(pixExpiredV1PayloadSchema.safeParse(bad).success).toBe(false)
  })
  it('faz parse do envelope completo', () => {
    expect(pixExpiredV1Schema.safeParse(envelope(EVENT_TYPES.PIX_EXPIRED, goodPixPayload)).success).toBe(true)
  })
})

describe('cart.abandoned.v1 payload', () => {
  it('aceita payload válido', () => {
    expect(cartAbandonedV1PayloadSchema.safeParse(goodCartPayload).success).toBe(true)
  })
  it('rejeita stage fora do enum', () => {
    expect(cartAbandonedV1PayloadSchema.safeParse({ ...goodCartPayload, stage: '2h' }).success).toBe(false)
  })
  it('faz parse do envelope completo', () => {
    expect(cartAbandonedV1Schema.safeParse(envelope(EVENT_TYPES.CART_ABANDONED, goodCartPayload)).success).toBe(true)
  })
})

// ─── Registro discriminado ────────────────────────────────────────────────────

describe('domainEventSchema (união discriminada)', () => {
  it('valida qualquer evento conhecido por eventType', () => {
    expect(domainEventSchema.safeParse(envelope(EVENT_TYPES.ORDER_PAID, goodOrderPayload)).success).toBe(true)
    expect(domainEventSchema.safeParse(envelope(EVENT_TYPES.PIX_EXPIRED, goodPixPayload)).success).toBe(true)
    expect(domainEventSchema.safeParse(envelope(EVENT_TYPES.CART_ABANDONED, goodCartPayload)).success).toBe(true)
  })
  it('rejeita eventType desconhecido', () => {
    expect(domainEventSchema.safeParse(envelope('unknown.v1', goodOrderPayload)).success).toBe(false)
  })
  it('EVENT_REGISTRY resolve schema por eventType', () => {
    expect(EVENT_REGISTRY[EVENT_TYPES.ORDER_PAID]).toBe(orderPaidV1Schema)
    expect(EVENT_REGISTRY[EVENT_TYPES.PIX_EXPIRED]).toBe(pixExpiredV1Schema)
    expect(EVENT_REGISTRY[EVENT_TYPES.CART_ABANDONED]).toBe(cartAbandonedV1Schema)
  })
})
