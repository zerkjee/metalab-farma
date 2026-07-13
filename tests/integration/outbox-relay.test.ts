/**
 * Integration tests for POST /api/jobs/outbox-relay — fecha a janela §6.2.
 * QStash auth, Prisma, qstash e logger mockados. Verifica claim atômico,
 * republicação, corrida entre relays, payload inválido e o filtro de idade.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    outboxEvent: { findMany: vi.fn(), updateMany: vi.fn() },
    integrationFailure: { create: vi.fn() },
  },
}))
const { mockEnqueueOrderEmail, mockEnqueueTinySync } = vi.hoisted(() => ({
  mockEnqueueOrderEmail: vi.fn(),
  mockEnqueueTinySync: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))
vi.mock('@/lib/logger', () => ({
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))
vi.mock('@/lib/qstashAuth', () => ({
  verifyQStashRequest: vi.fn().mockResolvedValue({ valid: true }),
}))
vi.mock('@/lib/qstash', () => ({
  enqueueOrderEmail: mockEnqueueOrderEmail,
  enqueueTinySync: mockEnqueueTinySync,
}))

import { POST } from '@/app/api/jobs/outbox-relay/route'

const validPayload = {
  pedidoId: 'ped-1',
  numero: 'MTL-2026-XYZ',
  compradorNome: 'Pedro',
  compradorEmail: 'pedro@test.com',
  total: 110,
  metodoPagamento: 'PIX',
  itens: [{ nome: 'Whey', quantidade: 1, precoUnit: 100 }],
}

function orderRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'ob-1',
    eventId: 'evt-1',
    eventType: 'order.paid.v1',
    payload: validPayload,
    idempotencyKey: 'order.paid:ped-1',
    ...overrides,
  }
}

function req(): NextRequest {
  return new NextRequest('http://localhost/api/jobs/outbox-relay', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Upstash-Signature': 'sig' },
    body: JSON.stringify({}),
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  delete process.env.ORDER_OUTBOX_ENABLED
  delete process.env.TINY_AUTO_SEND_ORDERS
  mockPrisma.outboxEvent.findMany.mockResolvedValue([])
  mockPrisma.outboxEvent.updateMany.mockResolvedValue({ count: 1 })
  mockPrisma.integrationFailure.create.mockResolvedValue({})
  mockEnqueueOrderEmail.mockResolvedValue(undefined)
  mockEnqueueTinySync.mockResolvedValue(undefined)
})

describe('POST /api/jobs/outbox-relay', () => {
  it('flag OFF: retorna skipped e NÃO toca no banco', async () => {
    const res = await POST(req())
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true, skipped: 'flag-off' })
    expect(mockPrisma.outboxEvent.findMany).not.toHaveBeenCalled()
    expect(mockPrisma.outboxEvent.updateMany).not.toHaveBeenCalled()
  })

  describe('flag ON', () => {
    beforeEach(() => {
      process.env.ORDER_OUTBOX_ENABLED = 'true'
    })

    it('2 linhas order.paid PENDING antigas: cada uma reivindicada, e-mail enfileirado, published=2', async () => {
      mockPrisma.outboxEvent.findMany.mockResolvedValueOnce([
        orderRow({ id: 'ob-1', idempotencyKey: 'order.paid:ped-1' }),
        orderRow({ id: 'ob-2', idempotencyKey: 'order.paid:ped-2' }),
      ])

      const res = await POST(req())
      expect(res.status).toBe(200)
      expect(await res.json()).toEqual({ ok: true, published: 2, failed: 0 })

      // claim atômico PENDING→PUBLISHED em cada linha
      expect(mockPrisma.outboxEvent.updateMany).toHaveBeenCalledWith({
        where: { id: 'ob-1', status: 'PENDING' },
        data: { status: 'PUBLISHED', publishedAt: expect.any(Date) },
      })
      expect(mockPrisma.outboxEvent.updateMany).toHaveBeenCalledWith({
        where: { id: 'ob-2', status: 'PENDING' },
        data: { status: 'PUBLISHED', publishedAt: expect.any(Date) },
      })

      // enqueue com a idempotencyKey da linha
      expect(mockEnqueueOrderEmail).toHaveBeenCalledTimes(2)
      expect(mockEnqueueOrderEmail).toHaveBeenCalledWith(validPayload, 'order.paid:ped-1')
      expect(mockEnqueueOrderEmail).toHaveBeenCalledWith(validPayload, 'order.paid:ped-2')
    })

    it('enfileira Tiny quando TINY_AUTO_SEND_ORDERS=true', async () => {
      process.env.TINY_AUTO_SEND_ORDERS = 'true'
      mockPrisma.outboxEvent.findMany.mockResolvedValueOnce([orderRow()])
      await POST(req())
      expect(mockEnqueueTinySync).toHaveBeenCalledWith('ped-1')
    })

    it('corrida entre relays: claim retorna count 0 → pula, sem enqueue', async () => {
      mockPrisma.outboxEvent.findMany.mockResolvedValueOnce([orderRow()])
      mockPrisma.outboxEvent.updateMany.mockResolvedValueOnce({ count: 0 })

      const res = await POST(req())
      expect(await res.json()).toEqual({ ok: true, published: 0, failed: 0 })
      expect(mockEnqueueOrderEmail).not.toHaveBeenCalled()
    })

    it('payload inválido: registra integrationFailure, marca FAILED, batch continua (failed=1)', async () => {
      mockPrisma.outboxEvent.findMany.mockResolvedValueOnce([
        orderRow({ id: 'ob-bad', payload: { pedidoId: 'x' } }),
      ])

      const res = await POST(req())
      expect(await res.json()).toEqual({ ok: true, published: 0, failed: 1 })
      expect(mockEnqueueOrderEmail).not.toHaveBeenCalled()
      expect(mockPrisma.integrationFailure.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ source: 'outbox-relay', eventId: 'evt-1' }),
        }),
      )
      // marca a linha FAILED (updateMany após o claim)
      expect(mockPrisma.outboxEvent.updateMany).toHaveBeenCalledWith({
        where: { id: 'ob-bad' },
        data: { status: 'FAILED' },
      })
    })

    it('aplica o filtro de idade: passa createdAt lt para o findMany', async () => {
      await POST(req())
      const where = mockPrisma.outboxEvent.findMany.mock.calls[0]?.[0]?.where
      expect(where.status).toBe('PENDING')
      expect(where.createdAt.lt).toBeInstanceOf(Date)
      expect(where.createdAt.lt.getTime()).toBeLessThan(Date.now())
    })
  })
})
