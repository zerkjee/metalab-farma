/**
 * Integration tests for POST /api/pedidos
 * Mocks: Prisma, auth, QStash, rateLimit, logger.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// ─── vi.hoisted: variáveis acessíveis dentro dos factories de vi.mock ─────────

const { mockTx, mockPrisma } = vi.hoisted(() => {
  const mockTx = {
    produto: { updateMany: vi.fn() },
    cupom:   { findUnique: vi.fn(), update: vi.fn() },
    pedido:  { create: vi.fn() },
  }
  const mockPrisma = {
    produto:     { findMany: vi.fn() },
    cupom:       { findUnique: vi.fn() },
    cartSession: { updateMany: vi.fn() },
    $transaction: vi.fn(),
  }
  return { mockTx, mockPrisma }
})

const { mockAuth } = vi.hoisted(() => ({ mockAuth: vi.fn() }))
const { mockEnqueue } = vi.hoisted(() => ({ mockEnqueue: vi.fn() }))
const { mockRateLimit } = vi.hoisted(() => ({ mockRateLimit: vi.fn() }))

// ─── Mocks de módulos ─────────────────────────────────────────────────────────

vi.mock('@/lib/prisma',    () => ({ prisma: mockPrisma }))
vi.mock('@/lib/auth',      () => ({ auth: mockAuth }))
vi.mock('@/lib/qstash',    () => ({ enqueueOrderEmail: mockEnqueue }))
vi.mock('@/lib/rateLimit', () => ({
  pedidoRatelimit: { limit: mockRateLimit },
  getIp: vi.fn().mockReturnValue('127.0.0.1'),
}))
vi.mock('@/lib/logger', () => ({
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

// ─── Import do handler (depois dos mocks) ─────────────────────────────────────

import { POST } from '@/app/api/pedidos/route'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const MOCK_PRODUCT = {
  id: 'prod-uuid-1', slug: 'whey-protein', nome: 'Whey Protein 900g',
  preco: 100, estoque: 10, sku: 'WP-001', imagemUrl: null, ativo: true,
}

const MOCK_ORDER = {
  id: 'order-uuid-123', numero: 'MTL-2026-AB1234', total: 110,
  metodoPagamento: 'PIX', compradorNome: 'Pedro Test', compradorEmail: 'pedro@test.com',
  itens: [{ produtoNome: 'Whey Protein 900g', quantidade: 1, precoUnit: 100 }],
}

const VALID_BODY = {
  itens: [{ slug: 'whey-protein', quantidade: 1 }],
  cliente: { nome: 'Pedro Test', email: 'pedro@test.com', cpf: '12345678909', telefone: '11999999999' },
  endereco: { cep: '31742227', logradouro: 'Rua das Flores', numero: '100', bairro: 'Jardim', cidade: 'Belo Horizonte', estado: 'MG' },
  frete: { preco: 10 },
  metodoPagamento: 'PIX' as const,
}

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost/api/pedidos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

// ─── Setup padrão ─────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks()

  mockAuth.mockResolvedValue(null)                              // guest por padrão
  mockRateLimit.mockResolvedValue({ success: true })            // sem rate limit
  mockEnqueue.mockResolvedValue(undefined)                      // QStash ok

  mockPrisma.produto.findMany.mockResolvedValue([MOCK_PRODUCT])
  mockPrisma.cupom.findUnique.mockResolvedValue(null)
  mockPrisma.cartSession.updateMany.mockResolvedValue({})

  // $transaction executa o callback com mockTx
  mockPrisma.$transaction.mockImplementation(
    (fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx),
  )

  mockTx.produto.updateMany.mockResolvedValue({ count: 1 })
  mockTx.cupom.update.mockResolvedValue({})
  mockTx.pedido.create.mockResolvedValue(MOCK_ORDER)
})

// ─── Happy path ───────────────────────────────────────────────────────────────

describe('POST /api/pedidos — happy path', () => {
  it('retorna 201 com pedidoNumero e total', async () => {
    const res = await POST(makeRequest(VALID_BODY))
    const body = await res.json()
    expect(res.status).toBe(201)
    expect(body.pedidoNumero).toBe('MTL-2026-AB1234')
    expect(body.total).toBe(110)
    expect(body.pedidoId).toBe('order-uuid-123')
  })

  it('cria pedido sem usuarioId para guest', async () => {
    await POST(makeRequest(VALID_BODY))
    const data = mockTx.pedido.create.mock.calls[0]?.[0]?.data
    expect(data?.usuarioId).toBeNull()
  })

  it('inclui usuarioId quando logado', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-uuid', role: 'CLIENTE' } })
    await POST(makeRequest(VALID_BODY))
    const data = mockTx.pedido.create.mock.calls[0]?.[0]?.data
    expect(data?.usuarioId).toBe('user-uuid')
  })

  it('calcula subtotal correto no servidor (100 × 1 = R$100)', async () => {
    await POST(makeRequest(VALID_BODY))
    const data = mockTx.pedido.create.mock.calls[0]?.[0]?.data
    expect(data?.subtotal).toBe(100)
  })

  it('aplica frete (subtotal 100 + frete 10 = total 110)', async () => {
    await POST(makeRequest(VALID_BODY))
    const data = mockTx.pedido.create.mock.calls[0]?.[0]?.data
    expect(data?.frete).toBe(10)
    expect(data?.total).toBe(110)
  })

  it('chama enqueueOrderEmail após criação', async () => {
    await POST(makeRequest(VALID_BODY))
    await Promise.resolve()
    expect(mockEnqueue).toHaveBeenCalledOnce()
  })

  it('payload do e-mail não contém CPF nem endereço', async () => {
    await POST(makeRequest(VALID_BODY))
    await Promise.resolve()
    const payload = mockEnqueue.mock.calls[0]?.[0]
    expect(payload).not.toHaveProperty('cpf')
    expect(payload).not.toHaveProperty('endereco')
    expect(payload).not.toHaveProperty('enderecoSnap')
    expect(payload).toHaveProperty('numero')
    expect(payload).toHaveProperty('total')
    expect(payload).toHaveProperty('itens')
  })
})

// ─── Estoque ──────────────────────────────────────────────────────────────────

describe('POST /api/pedidos — estoque', () => {
  it('retorna 400 quando produto não existe no banco', async () => {
    mockPrisma.produto.findMany.mockResolvedValue([])
    const res = await POST(makeRequest(VALID_BODY))
    expect(res.status).toBe(400)
    expect((await res.json()).erro).toMatch(/não encontrado/i)
  })

  it('retorna 400 quando estoque insuficiente (tx lança OUT_OF_STOCK)', async () => {
    mockTx.produto.updateMany.mockResolvedValue({ count: 0 })
    // $transaction precisa propagar a exceção que o callback lança
    mockPrisma.$transaction.mockImplementation(async (fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx))
    const res = await POST(makeRequest(VALID_BODY))
    expect(res.status).toBe(400)
    expect((await res.json()).erro).toMatch(/estoque insuficiente/i)
  })
})

// ─── Cupons ───────────────────────────────────────────────────────────────────

describe('POST /api/pedidos — cupons', () => {
  const withCupom = { ...VALID_BODY, cupomCodigo: 'PROMO10' }

  it('retorna 400 para cupom inexistente', async () => {
    mockPrisma.cupom.findUnique.mockResolvedValue(null)
    const res = await POST(makeRequest(withCupom))
    expect(res.status).toBe(400)
  })

  it('retorna 400 para cupom inativo', async () => {
    mockPrisma.cupom.findUnique.mockResolvedValue({
      id: 'c1', codigo: 'PROMO10', ativo: false, tipo: 'PERCENTUAL',
      valor: 10, usoMaximo: null, usoAtual: 0, validade: null,
    })
    expect((await POST(makeRequest(withCupom))).status).toBe(400)
  })

  it('retorna 400 para cupom expirado', async () => {
    mockPrisma.cupom.findUnique.mockResolvedValue({
      id: 'c1', codigo: 'PROMO10', ativo: true, tipo: 'PERCENTUAL',
      valor: 10, usoMaximo: null, usoAtual: 0,
      validade: new Date(Date.now() - 86_400_000),
    })
    expect((await POST(makeRequest(withCupom))).status).toBe(400)
  })

  it('retorna 400 para cupom com limite esgotado', async () => {
    mockPrisma.cupom.findUnique.mockResolvedValue({
      id: 'c1', codigo: 'PROMO10', ativo: true, tipo: 'PERCENTUAL',
      valor: 10, usoMaximo: 5, usoAtual: 5, validade: null,
    })
    expect((await POST(makeRequest(withCupom))).status).toBe(400)
  })

  it('aplica desconto PERCENTUAL e retorna 201', async () => {
    const cupom = { id: 'c1', codigo: 'PROMO10', ativo: true, tipo: 'PERCENTUAL', valor: 10, usoMaximo: null, usoAtual: 0, validade: null }
    mockPrisma.cupom.findUnique.mockResolvedValue(cupom)
    mockTx.cupom.findUnique.mockResolvedValue(cupom)
    const res = await POST(makeRequest(withCupom))
    expect(res.status).toBe(201)
    const data = mockTx.pedido.create.mock.calls[0]?.[0]?.data
    // 10% de 100 = 10 desconto; total = 100 - 10 + 10 (frete) = 100
    expect(data?.desconto).toBe(10)
    expect(data?.total).toBe(100)
  })
})

// ─── Rate limit ───────────────────────────────────────────────────────────────

describe('POST /api/pedidos — rate limit', () => {
  it('retorna 429 quando limite excedido', async () => {
    mockRateLimit.mockResolvedValue({ success: false })
    const res = await POST(makeRequest(VALID_BODY))
    expect(res.status).toBe(429)
    expect((await res.json()).erro).toMatch(/muitas tentativas/i)
  })
})

// ─── Validação de body ────────────────────────────────────────────────────────

describe('POST /api/pedidos — validação', () => {
  it('retorna 400 para body não-JSON', async () => {
    const req = new NextRequest('http://localhost/api/pedidos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-json',
    })
    expect((await POST(req)).status).toBe(400)
  })

  it('retorna 400 sem itens', async () => {
    expect((await POST(makeRequest({ ...VALID_BODY, itens: [] }))).status).toBe(400)
  })

  it('retorna 400 para CPF inválido', async () => {
    const res = await POST(makeRequest({
      ...VALID_BODY,
      cliente: { ...VALID_BODY.cliente, cpf: '123' },
    }))
    expect(res.status).toBe(400)
  })
})

// ─── Retry em colisão P2002 ───────────────────────────────────────────────────

describe('POST /api/pedidos — retry P2002', () => {
  it('faz retry e retorna 201 após 1ª colisão no numero', async () => {
    const p2002 = Object.assign(new Error('unique constraint'), { code: 'P2002' })
    mockPrisma.$transaction
      .mockRejectedValueOnce(p2002)
      .mockImplementation((fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx))

    const res = await POST(makeRequest(VALID_BODY))
    expect(res.status).toBe(201)
    expect(mockPrisma.$transaction).toHaveBeenCalledTimes(2)
  })

  it('retorna 500 após 3 colisões consecutivas', async () => {
    const p2002 = Object.assign(new Error('unique constraint'), { code: 'P2002' })
    mockPrisma.$transaction.mockRejectedValue(p2002)

    const res = await POST(makeRequest(VALID_BODY))
    expect(res.status).toBe(500)
    expect(mockPrisma.$transaction).toHaveBeenCalledTimes(3)
  })
})
