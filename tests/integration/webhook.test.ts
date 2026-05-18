/**
 * Integration tests for POST /api/pagamento/webhook
 * HMAC real com segredo de teste; Prisma e mercadopago mockados.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import crypto from 'crypto'

// ─── vi.hoisted ───────────────────────────────────────────────────────────────

const { mockPrisma } = vi.hoisted(() => {
  const mockPrisma = {
    pedido:  { findMany: vi.fn(), findFirst: vi.fn(), update: vi.fn(), updateMany: vi.fn() },
    produto: { update: vi.fn() },
    $transaction: vi.fn(),
  }
  return { mockPrisma }
})

const { mockEnqueue } = vi.hoisted(() => ({ mockEnqueue: vi.fn() }))
const { mockPaymentGet } = vi.hoisted(() => ({ mockPaymentGet: vi.fn() }))

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))
vi.mock('@/lib/qstash', () => ({ enqueueOrderEmail: mockEnqueue }))
vi.mock('@/lib/logger', () => ({
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))
vi.mock('mercadopago', () => ({
  // function (não arrow) porque o route usa `new MercadoPagoConfig(...)` e `new Payment(...)`
  MercadoPagoConfig: vi.fn(function() { return {} }),
  Payment: vi.fn(function() { return { get: mockPaymentGet } }),
}))

// ─── Import do handler ────────────────────────────────────────────────────────

import { POST } from '@/app/api/pagamento/webhook/route'

// ─── Helpers de assinatura ────────────────────────────────────────────────────

const TEST_SECRET = 'test-webhook-secret'
const TEST_TOKEN  = 'test-mp-access-token'

function buildSignedRequest(body: unknown, paymentId: string): NextRequest {
  const ts = Math.floor(Date.now() / 1000)
  const requestId = 'test-request-id-abc'
  const manifest = `id:${paymentId};request-id:${requestId};ts:${ts};`
  const v1 = crypto.createHmac('sha256', TEST_SECRET).update(manifest).digest('hex')

  return new NextRequest('http://localhost/api/pagamento/webhook', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-signature':  `ts=${ts},v1=${v1}`,
      'x-request-id': requestId,
    },
    body: JSON.stringify(body),
  })
}

const paymentBody = (id: string) => ({ type: 'payment', data: { id } })

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks()
  process.env.MP_WEBHOOK_SECRET        = TEST_SECRET
  process.env.MERCADOPAGO_ACCESS_TOKEN = TEST_TOKEN

  // $transaction: array (webhook cancel) ou callback (não usado aqui)
  mockPrisma.$transaction.mockImplementation(async (fnOrArray: unknown) => {
    if (Array.isArray(fnOrArray)) return Promise.all(fnOrArray)
    if (typeof fnOrArray === 'function')
      return (fnOrArray as (p: typeof mockPrisma) => unknown)(mockPrisma)
  })

  mockPrisma.pedido.update.mockResolvedValue({})
  mockPrisma.produto.update.mockResolvedValue({})
  mockEnqueue.mockResolvedValue(undefined)
})

// ─── Tipos de evento ──────────────────────────────────────────────────────────

describe('POST /api/pagamento/webhook — tipos de evento', () => {
  it('ignora eventos não-"payment" e retorna 200', async () => {
    const req = buildSignedRequest({ type: 'merchant_order', data: { id: '1' } }, '1')
    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(mockPaymentGet).not.toHaveBeenCalled()
  })

  it('retorna 400 quando body não é JSON válido', async () => {
    const req = new NextRequest('http://localhost/api/pagamento/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid-json',
    })
    expect((await POST(req)).status).toBe(400)
  })

  it('retorna 400 quando paymentId está ausente', async () => {
    const req = buildSignedRequest({ type: 'payment', data: {} }, '')
    expect((await POST(req)).status).toBe(400)
  })
})

// ─── Verificação de assinatura ────────────────────────────────────────────────

describe('POST /api/pagamento/webhook — assinatura HMAC', () => {
  it('retorna 401 para assinatura inválida', async () => {
    const req = new NextRequest('http://localhost/api/pagamento/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-signature':  'ts=1234567890,v1=0000000000000000',
        'x-request-id': 'req-id',
      },
      body: JSON.stringify(paymentBody('PAY123')),
    })
    expect((await POST(req)).status).toBe(401)
  })

  it('retorna 401 sem x-signature', async () => {
    const req = new NextRequest('http://localhost/api/pagamento/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentBody('PAY123')),
    })
    expect((await POST(req)).status).toBe(401)
  })

  it('retorna 503 sem MP_WEBHOOK_SECRET em produção', async () => {
    delete process.env.MP_WEBHOOK_SECRET
    const origEnv = process.env.NODE_ENV
    ;(process.env as Record<string, string | undefined>).NODE_ENV = 'production'

    const res = await POST(buildSignedRequest(paymentBody('PAY123'), 'PAY123'))
    expect(res.status).toBe(503)

    ;(process.env as Record<string, string | undefined>).NODE_ENV = origEnv
    process.env.MP_WEBHOOK_SECRET = TEST_SECRET
  })
})

// ─── Payment approved ─────────────────────────────────────────────────────────

describe('POST /api/pagamento/webhook — payment approved', () => {
  const PAY_ID = 'PAY-APPROVED-001'

  beforeEach(() => {
    mockPaymentGet.mockResolvedValue({ id: PAY_ID, status: 'approved' })
    mockPrisma.pedido.updateMany.mockResolvedValue({ count: 1 })
    mockPrisma.pedido.findFirst.mockResolvedValue({
      id: 'order-uuid', numero: 'MTL-2026-XYZ',
      compradorNome: 'Pedro', compradorEmail: 'pedro@test.com',
      total: 110, metodoPagamento: 'PIX', pagamentoId: PAY_ID,
      itens: [{ produtoNome: 'Whey', quantidade: 1, precoUnit: 100 }],
    })
  })

  it('marca o pedido como pago e retorna 200', async () => {
    const res = await POST(buildSignedRequest(paymentBody(PAY_ID), PAY_ID))
    expect(res.status).toBe(200)
    expect(mockPrisma.pedido.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ pago: false }) }),
    )
  })

  it('enfileira e-mail de confirmação após aprovação', async () => {
    await POST(buildSignedRequest(paymentBody(PAY_ID), PAY_ID))
    await Promise.resolve()
    expect(mockEnqueue).toHaveBeenCalledOnce()
    expect(mockEnqueue.mock.calls[0]?.[0]?.numero).toBe('MTL-2026-XYZ')
  })

  it('idempotência: não envia e-mail se pedido já estava pago (count=0)', async () => {
    mockPrisma.pedido.updateMany.mockResolvedValue({ count: 0 })
    await POST(buildSignedRequest(paymentBody(PAY_ID), PAY_ID))
    await Promise.resolve()
    expect(mockEnqueue).not.toHaveBeenCalled()
  })
})

// ─── Payment rejected / cancelled ─────────────────────────────────────────────

const MOCK_ORDERS = [
  {
    id: 'order-1', numero: 'MTL-2026-AAA', pagamentoId: 'PAY-CANCEL', pago: false,
    status: 'AGUARDANDO_PAGAMENTO',
    itens: [
      { id: 'item-1', produtoId: 'prod-1', quantidade: 2 },
      { id: 'item-2', produtoId: 'prod-2', quantidade: 1 },
    ],
  },
]

for (const status of ['rejected', 'cancelled'] as const) {
  describe(`POST /api/pagamento/webhook — payment ${status}`, () => {
    const PAY_ID = 'PAY-CANCEL'

    beforeEach(() => {
      mockPaymentGet.mockResolvedValue({ id: PAY_ID, status })
      mockPrisma.pedido.findMany.mockResolvedValue(MOCK_ORDERS)
    })

    it('restaura estoque e cancela o pedido', async () => {
      const res = await POST(buildSignedRequest(paymentBody(PAY_ID), PAY_ID))
      expect(res.status).toBe(200)

      // Uma transação por pedido
      expect(mockPrisma.$transaction).toHaveBeenCalledOnce()

      // Array da transação: 1 pedido.update + 2 produto.update
      const arr = mockPrisma.$transaction.mock.calls[0]?.[0] as unknown[]
      expect(Array.isArray(arr)).toBe(true)
      expect(arr).toHaveLength(3)

      expect(mockPrisma.pedido.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: 'CANCELADO' } }),
      )
      expect(mockPrisma.produto.update).toHaveBeenCalledTimes(2)
      expect(mockPrisma.produto.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { estoque: { increment: expect.any(Number) } } }),
      )
    })

    it('não aciona transação se pedido já estava cancelado (findMany vazio)', async () => {
      mockPrisma.pedido.findMany.mockResolvedValue([])
      const res = await POST(buildSignedRequest(paymentBody(PAY_ID), PAY_ID))
      expect(res.status).toBe(200)
      expect(mockPrisma.$transaction).not.toHaveBeenCalled()
    })
  })
}

// ─── Configuração ─────────────────────────────────────────────────────────────

describe('POST /api/pagamento/webhook — configuração', () => {
  it('retorna 503 sem MERCADOPAGO_ACCESS_TOKEN', async () => {
    delete process.env.MERCADOPAGO_ACCESS_TOKEN
    const res = await POST(buildSignedRequest(paymentBody('PAY123'), 'PAY123'))
    expect(res.status).toBe(503)
    process.env.MERCADOPAGO_ACCESS_TOKEN = TEST_TOKEN
  })
})
