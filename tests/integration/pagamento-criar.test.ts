/**
 * Integration tests for POST /api/pagamento/criar — rollback do PIX (P0).
 * Mocks: Prisma, mercadopago, rateLimit, qstash, logger.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const { mockPrisma, mockTx } = vi.hoisted(() => {
  const mockTx = {
    pedido: { updateMany: vi.fn() },
    produto: { update: vi.fn() },
  }
  const mockPrisma = {
    pedido: { findUnique: vi.fn(), update: vi.fn() },
    $transaction: vi.fn(),
  }
  return { mockPrisma, mockTx }
})
const { mockPaymentCreate } = vi.hoisted(() => ({ mockPaymentCreate: vi.fn() }))
const { mockEnqueueJob } = vi.hoisted(() => ({ mockEnqueueJob: vi.fn() }))
const { mockRateLimit } = vi.hoisted(() => ({ mockRateLimit: vi.fn() }))

vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))
vi.mock('@/lib/rateLimit', () => ({ pagamentoRatelimit: { limit: mockRateLimit } }))
vi.mock('@/lib/qstash', () => ({ enqueueJob: mockEnqueueJob }))
vi.mock('@/lib/logger', () => ({
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))
vi.mock('mercadopago', () => ({
  MercadoPagoConfig: vi.fn(function () { return {} }),
  Payment: vi.fn(function () { return { create: mockPaymentCreate } }),
}))

import { POST } from '@/app/api/pagamento/criar/route'

const PEDIDO = {
  id: 'order-1',
  numero: 'MTL-2026-XY9999',
  total: 110,
  pago: false,
  metodoPagamento: 'PIX',
  compradorNome: 'Ana Silva',
  compradorEmail: 'ana@test.com',
  compradorCpf: '12345678909',
  itens: [{ produtoId: 'prod-1', quantidade: 2 }],
}

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost/api/pagamento/criar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  mockRateLimit.mockResolvedValue({ success: true })
  mockPrisma.pedido.findUnique.mockResolvedValue(PEDIDO)
  mockPrisma.pedido.update.mockResolvedValue({})
  mockPrisma.$transaction.mockImplementation((fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx))
  mockTx.pedido.updateMany.mockResolvedValue({ count: 1 })
  mockTx.produto.update.mockResolvedValue({})
})

describe('POST /api/pagamento/criar — rollback ao falhar o PIX', () => {
  it('cancela o pedido e restaura o estoque quando payment.create falha', async () => {
    mockPaymentCreate.mockRejectedValue(new Error('MP indisponível'))

    const res = await POST(makeRequest({ pedidoId: 'order-1' }))
    expect(res.status).toBe(502)
    expect((await res.json()).erro).toMatch(/não foi possível gerar o pagamento/i)

    // Cancelou com guard de status
    expect(mockTx.pedido.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'order-1', pago: false, status: 'AGUARDANDO_PAGAMENTO' },
        data: { status: 'CANCELADO' },
      }),
    )
    // Restaurou o estoque exatamente uma vez (1 item)
    expect(mockTx.produto.update).toHaveBeenCalledTimes(1)
    expect(mockTx.produto.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'prod-1' },
        data: { estoque: { increment: 2 } },
      }),
    )
    // Não salvou dados de PIX nem agendou jobs
    expect(mockPrisma.pedido.update).not.toHaveBeenCalled()
    expect(mockEnqueueJob).not.toHaveBeenCalled()
  })

  it('idempotente: se o pedido já não estava AGUARDANDO_PAGAMENTO, não restaura estoque', async () => {
    mockPaymentCreate.mockRejectedValue(new Error('MP indisponível'))
    mockTx.pedido.updateMany.mockResolvedValue({ count: 0 })

    const res = await POST(makeRequest({ pedidoId: 'order-1' }))
    expect(res.status).toBe(502)
    expect(mockTx.produto.update).not.toHaveBeenCalled()
  })

  it('happy path: PIX criado com sucesso retorna QR e agenda jobs', async () => {
    mockPaymentCreate.mockResolvedValue({
      id: 999,
      point_of_interaction: { transaction_data: { qr_code: 'qr', qr_code_base64: 'b64' } },
    })

    const res = await POST(makeRequest({ pedidoId: 'order-1' }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.tipo).toBe('PIX')
    expect(body.qrCode).toBe('qr')
    expect(mockPrisma.pedido.update).toHaveBeenCalled()
    expect(mockEnqueueJob).toHaveBeenCalledTimes(2)
    // Não houve rollback
    expect(mockTx.pedido.updateMany).not.toHaveBeenCalled()
  })
})
