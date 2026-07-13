/**
 * Integration tests for POST /api/jobs/email-pedido — dedup via inbox.
 * QStash auth e Prisma mockados; verifica o fix do reenvio em reentregas.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { Prisma } from '@prisma/client'

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    inboxEvent: { create: vi.fn(), update: vi.fn(), findUnique: vi.fn() },
  },
}))
const { mockSend } = vi.hoisted(() => ({ mockSend: vi.fn() }))

vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))
vi.mock('@/lib/resend', () => ({ sendOrderConfirmationEmail: mockSend }))
vi.mock('@/lib/logger', () => ({
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))
vi.mock('@/lib/qstashAuth', () => ({
  verifyQStashRequest: vi.fn().mockResolvedValue({ valid: true }),
}))

import { POST } from '@/app/api/jobs/email-pedido/route'

const basePayload = {
  numero: 'MTL-2026-XYZ',
  compradorNome: 'Pedro',
  compradorEmail: 'pedro@test.com',
  total: 110,
  metodoPagamento: 'PIX',
  itens: [{ nome: 'Whey', quantidade: 1, precoUnit: 100 }],
}

function req(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/jobs/email-pedido', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Upstash-Signature': 'sig' },
    body: JSON.stringify(body),
  })
}

const P2002 = new Prisma.PrismaClientKnownRequestError('unique', {
  code: 'P2002',
  clientVersion: 'test',
})

beforeEach(() => {
  vi.clearAllMocks()
  delete process.env.ORDER_OUTBOX_ENABLED
  mockPrisma.inboxEvent.create.mockResolvedValue({})
  mockPrisma.inboxEvent.update.mockResolvedValue({})
  mockPrisma.inboxEvent.findUnique.mockResolvedValue(null)
  mockSend.mockResolvedValue(undefined)
})

describe('POST /api/jobs/email-pedido — flag ON + idempotencyKey', () => {
  beforeEach(() => {
    process.env.ORDER_OUTBOX_ENABLED = 'true'
  })

  it('primeira entrega: reivindica o inbox, envia e marca processado', async () => {
    const res = await POST(req({ ...basePayload, idempotencyKey: 'order.paid:ped-1' }))
    expect(res.status).toBe(200)
    expect(mockPrisma.inboxEvent.create).toHaveBeenCalledOnce()
    expect(mockPrisma.inboxEvent.create.mock.calls[0]?.[0]?.data).toMatchObject({
      eventId: 'order.paid:ped-1',
      consumer: 'email-pedido',
      status: 'RECEIVED',
    })
    expect(mockSend).toHaveBeenCalledOnce()
    expect(mockPrisma.inboxEvent.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { eventId: 'order.paid:ped-1' } }),
    )
  })

  it('reentrega com envio já CONFIRMADO (P2002 + PROCESSED): deduplica, não reenvia', async () => {
    mockPrisma.inboxEvent.create.mockRejectedValueOnce(P2002)
    mockPrisma.inboxEvent.findUnique.mockResolvedValueOnce({ status: 'PROCESSED' })
    const res = await POST(req({ ...basePayload, idempotencyKey: 'order.paid:ped-1' }))
    expect(res.status).toBe(200)
    expect(mockSend).not.toHaveBeenCalled()
    expect(mockPrisma.inboxEvent.update).not.toHaveBeenCalled()
  })

  it('reentrega reivindicada mas NÃO confirmada (P2002 + RECEIVED): reenvia', async () => {
    // Janela crash-entre-claim-e-envio: a linha existe mas ficou RECEIVED.
    // Deve reenviar (at-least-once), não deduplicar.
    mockPrisma.inboxEvent.create.mockRejectedValueOnce(P2002)
    mockPrisma.inboxEvent.findUnique.mockResolvedValueOnce({ status: 'RECEIVED' })
    const res = await POST(req({ ...basePayload, idempotencyKey: 'order.paid:ped-1' }))
    expect(res.status).toBe(200)
    expect(mockSend).toHaveBeenCalledOnce()
    expect(mockPrisma.inboxEvent.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { eventId: 'order.paid:ped-1' } }),
    )
  })
})

describe('POST /api/jobs/email-pedido — legado (flag OFF ou sem key)', () => {
  it('flag OFF: envia incondicionalmente, sem tocar no inbox', async () => {
    const res = await POST(req({ ...basePayload, idempotencyKey: 'order.paid:ped-1' }))
    expect(res.status).toBe(200)
    expect(mockPrisma.inboxEvent.create).not.toHaveBeenCalled()
    expect(mockSend).toHaveBeenCalledOnce()
  })

  it('flag ON mas sem idempotencyKey: envia incondicionalmente, sem tocar no inbox', async () => {
    process.env.ORDER_OUTBOX_ENABLED = 'true'
    const res = await POST(req(basePayload))
    expect(res.status).toBe(200)
    expect(mockPrisma.inboxEvent.create).not.toHaveBeenCalled()
    expect(mockSend).toHaveBeenCalledOnce()
  })
})
