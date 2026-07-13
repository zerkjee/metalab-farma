import { describe, it, expect, vi } from 'vitest'
import { writeOutbox } from '@/lib/outbox'
import { makeEnvelope, EVENT_TYPES } from '@/lib/contracts'
import type { OrderPaidV1Payload } from '@/lib/contracts'
import type { Prisma } from '@prisma/client'

const payload: OrderPaidV1Payload = {
  pedidoId: 'ped_1',
  numero: '1001',
  compradorNome: 'Ana Silva',
  compradorEmail: 'ana@example.com',
  total: 199.9,
  metodoPagamento: 'PIX',
  itens: [{ nome: 'Creatina', quantidade: 2, precoUnit: 99.95 }],
}

function makeTx() {
  const create = vi.fn().mockResolvedValue(undefined)
  const tx = { outboxEvent: { create } } as unknown as Prisma.TransactionClient
  return { tx, create }
}

describe('writeOutbox', () => {
  it('insere uma linha mapeada do envelope, com status PENDING', async () => {
    const { tx, create } = makeTx()
    const event = makeEnvelope<OrderPaidV1Payload>({
      eventType: EVENT_TYPES.ORDER_PAID,
      eventVersion: '1',
      correlationId: 'corr_1',
      producer: 'test',
      idempotencyKey: 'idem_1',
      occurredAt: '2026-07-12T12:00:00.000Z',
      causationId: 'cause_1',
      payload,
    })

    await writeOutbox(tx, event)

    expect(create).toHaveBeenCalledTimes(1)
    const arg = create.mock.calls[0][0]
    expect(arg).toEqual({
      data: {
        eventId: event.eventId,
        eventType: EVENT_TYPES.ORDER_PAID,
        eventVersion: '1',
        payload,
        correlationId: 'corr_1',
        causationId: 'cause_1',
        idempotencyKey: 'idem_1',
        producer: 'test',
        status: 'PENDING',
        occurredAt: new Date('2026-07-12T12:00:00.000Z'),
      },
    })
  })

  it('mapeia causationId ausente para null', async () => {
    const { tx, create } = makeTx()
    const event = makeEnvelope<OrderPaidV1Payload>({
      eventType: EVENT_TYPES.ORDER_PAID,
      eventVersion: '1',
      correlationId: 'corr_2',
      producer: 'test',
      idempotencyKey: 'idem_2',
      payload,
    })

    await writeOutbox(tx, event)

    const arg = create.mock.calls[0][0]
    expect(arg.data.causationId).toBeNull()
    expect(arg.data.status).toBe('PENDING')
    expect(arg.data.occurredAt).toBeInstanceOf(Date)
  })
})
