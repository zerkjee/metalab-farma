import { z } from 'zod'

/**
 * Strangler-Fig FOUNDATION — event contracts.
 *
 * ADDITIVE ONLY. Nada aqui está ligado a rotas/jobs existentes. É andaime para
 * PRs futuros adotarem publicação/consumo de eventos de domínio com envelope
 * versionado, correlação e idempotência. Zero mudança de comportamento hoje.
 */

// ─── Envelope genérico ──────────────────────────────────────────────────────

/**
 * Campos comuns a todo evento de domínio. O `payload` é adicionado por
 * `envelopeSchema(payloadSchema)` para cada tipo específico.
 */
export const envelopeBaseSchema = z.object({
  eventId: z.uuid(),
  eventType: z.string().min(1),
  eventVersion: z.string().min(1),
  occurredAt: z.iso.datetime(),
  correlationId: z.string().min(1),
  causationId: z.string().nullable().optional(),
  producer: z.string().min(1),
  idempotencyKey: z.string().min(1),
})

/** Envelope tipado genérico: campos base + payload arbitrário `T`. */
export type DomainEvent<T> = z.infer<typeof envelopeBaseSchema> & { payload: T }

/** Constrói um schema de envelope completo para um dado schema de payload. */
export function envelopeSchema<T extends z.ZodTypeAny>(payload: T) {
  return envelopeBaseSchema.extend({ payload })
}

// ─── makeEnvelope ───────────────────────────────────────────────────────────

export interface MakeEnvelopeArgs<T> {
  eventType: string
  eventVersion: string
  correlationId: string
  producer: string
  idempotencyKey: string
  payload: T
  /** Gerado via crypto.randomUUID() quando ausente. */
  eventId?: string
  /** Gerado via new Date().toISOString() quando ausente. */
  occurredAt?: string
  causationId?: string | null
}

/**
 * Monta um envelope de evento, preenchendo `eventId` (UUID) e `occurredAt`
 * (ISO) quando não fornecidos. Não valida — use os schemas para validar.
 */
export function makeEnvelope<T>(args: MakeEnvelopeArgs<T>): DomainEvent<T> {
  return {
    eventId: args.eventId ?? crypto.randomUUID(),
    eventType: args.eventType,
    eventVersion: args.eventVersion,
    occurredAt: args.occurredAt ?? new Date().toISOString(),
    correlationId: args.correlationId,
    causationId: args.causationId ?? null,
    producer: args.producer,
    idempotencyKey: args.idempotencyKey,
    payload: args.payload,
  }
}

// ─── Tipos de evento ────────────────────────────────────────────────────────

/** Mapa canônico de `eventType`. Consumidores fazem switch/lookup por aqui. */
export const EVENT_TYPES = {
  ORDER_PAID: 'order.paid.v1',
  PIX_EXPIRED: 'pix.expired.v1',
  CART_ABANDONED: 'cart.abandoned.v1',
} as const

export type EventType = (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES]

// ── order.paid.v1 ──
// Payload espelha OrderEmailData (lib/resend.ts) para ser drop-in no
// app/api/jobs/email-pedido, MAIS pedidoId. Sem CPF nem endereço (least-privilege).
export const orderItemSchema = z.object({
  nome: z.string().min(1),
  quantidade: z.number().int().positive(),
  precoUnit: z.number().nonnegative(),
})
export type OrderItem = z.infer<typeof orderItemSchema>

export const orderPaidV1PayloadSchema = z.object({
  pedidoId: z.string().min(1),
  numero: z.string().min(1),
  compradorNome: z.string().min(1),
  compradorEmail: z.email(),
  total: z.number().nonnegative(),
  metodoPagamento: z.string().min(1),
  itens: z.array(orderItemSchema),
  pixQrCode: z.string().optional(),
})
export type OrderPaidV1Payload = z.infer<typeof orderPaidV1PayloadSchema>

export const orderPaidV1Schema = envelopeSchema(orderPaidV1PayloadSchema).extend({
  eventType: z.literal(EVENT_TYPES.ORDER_PAID),
})
export type OrderPaidV1Event = z.infer<typeof orderPaidV1Schema>

// ── pix.expired.v1 ──
// Alinhado ao app/api/jobs/pix-expiry (recebe {pedidoId, stage}); o payload
// carrega o mínimo para o consumidor agir sem reconsultar dados sensíveis.
export const pixExpiredV1PayloadSchema = z.object({
  pedidoId: z.string().min(1),
  numero: z.string().min(1),
  compradorEmail: z.email(),
})
export type PixExpiredV1Payload = z.infer<typeof pixExpiredV1PayloadSchema>

export const pixExpiredV1Schema = envelopeSchema(pixExpiredV1PayloadSchema).extend({
  eventType: z.literal(EVENT_TYPES.PIX_EXPIRED),
})
export type PixExpiredV1Event = z.infer<typeof pixExpiredV1Schema>

// ── cart.abandoned.v1 ──
// Alinhado ao app/api/jobs/abandoned-cart (recebe {cartSessionId, stage}).
export const cartAbandonedV1PayloadSchema = z.object({
  cartSessionId: z.string().min(1),
  email: z.email(),
  stage: z.enum(['1h', '24h']),
})
export type CartAbandonedV1Payload = z.infer<typeof cartAbandonedV1PayloadSchema>

export const cartAbandonedV1Schema = envelopeSchema(cartAbandonedV1PayloadSchema).extend({
  eventType: z.literal(EVENT_TYPES.CART_ABANDONED),
})
export type CartAbandonedV1Event = z.infer<typeof cartAbandonedV1Schema>

// ─── Registro discriminado ──────────────────────────────────────────────────

/**
 * União discriminada por `eventType` — um consumidor genérico pode validar
 * qualquer evento conhecido com um único parse.
 */
export const domainEventSchema = z.discriminatedUnion('eventType', [
  orderPaidV1Schema,
  pixExpiredV1Schema,
  cartAbandonedV1Schema,
])
export type AnyDomainEvent = z.infer<typeof domainEventSchema>

/** Lookup `eventType` → schema de envelope completo. */
export const EVENT_REGISTRY = {
  [EVENT_TYPES.ORDER_PAID]: orderPaidV1Schema,
  [EVENT_TYPES.PIX_EXPIRED]: pixExpiredV1Schema,
  [EVENT_TYPES.CART_ABANDONED]: cartAbandonedV1Schema,
} as const
