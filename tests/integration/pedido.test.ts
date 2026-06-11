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
    pedido:      { findMany: vi.fn() },
    cupom:       { findUnique: vi.fn() },
    cartSession: { updateMany: vi.fn() },
    $transaction: vi.fn(),
  }
  return { mockTx, mockPrisma }
})

const { mockAuth } = vi.hoisted(() => ({ mockAuth: vi.fn() }))
const { mockEnqueue } = vi.hoisted(() => ({ mockEnqueue: vi.fn() }))
const { mockRateLimit } = vi.hoisted(() => ({ mockRateLimit: vi.fn() }))
const { mockCotarFrete } = vi.hoisted(() => ({ mockCotarFrete: vi.fn() }))

// ─── Mocks de módulos ─────────────────────────────────────────────────────────

vi.mock('@/lib/prisma',    () => ({ prisma: mockPrisma }))
vi.mock('@/lib/auth',      () => ({ auth: mockAuth }))
vi.mock('@/lib/qstash',    () => ({ enqueueOrderEmail: mockEnqueue }))
vi.mock('@/lib/rateLimit', () => ({
  pedidoRatelimit: { limit: mockRateLimit },
  getIp: vi.fn().mockReturnValue('127.0.0.1'),
}))
vi.mock('@/lib/frete', () => ({
  cotarFrete: mockCotarFrete,
  selecionarOpcaoFrete: (
    opcoes: Array<{ id: string }>,
    servicoId: string,
  ) => opcoes.find((o) => o.id === servicoId) ?? null,
}))
vi.mock('@/lib/logger', () => ({
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

// ─── Import do handler (depois dos mocks) ─────────────────────────────────────

import { POST, GET } from '@/app/api/pedidos/route'

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
  frete: { servicoId: 'standard' as const },
  metodoPagamento: 'PIX' as const,
}

// Opção de frete padrão devolvida pela cotação do servidor (preço autoritativo).
const FRETE_STANDARD = { id: 'standard', label: 'PAC', description: '', price: 10, estimate: '' }

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
  mockCotarFrete.mockResolvedValue({ ok: true, opcoes: [FRETE_STANDARD] }) // cotação servidor

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

  it('NÃO envia e-mail para PIX na criação — webhook dispara após confirmação', async () => {
    // Para PIX: o e-mail é enviado pelo webhook /api/pagamento/webhook quando
    // payment.status === "approved". Enviar aqui seria prematuro (pagamento pendente).
    await POST(makeRequest(VALID_BODY))
    await Promise.resolve()
    expect(mockEnqueue).not.toHaveBeenCalled()
  })

  it('envia e-mail imediatamente para métodos síncronos (não-PIX)', async () => {
    const bodyNaoPix = { ...VALID_BODY, metodoPagamento: 'CARTAO_CREDITO' }
    await POST(makeRequest(bodyNaoPix))
    await Promise.resolve()
    expect(mockEnqueue).toHaveBeenCalledOnce()
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

// ─── Frete recalculado no servidor (P0) ───────────────────────────────────────

describe('POST /api/pedidos — frete server-side', () => {
  it('retorna 400 quando não há frete escolhido nem frete grátis', async () => {
    const { frete: _omit, ...semFrete } = VALID_BODY
    void _omit
    const res = await POST(makeRequest(semFrete))
    expect(res.status).toBe(400)
    expect((await res.json()).erro).toMatch(/selecione uma opção de frete/i)
    expect(mockCotarFrete).not.toHaveBeenCalled()
  })

  it('usa o preço da COTAÇÃO DO SERVIDOR, ignorando o cliente', async () => {
    // Cliente nem consegue mais enviar preço; servidor cota 25 → total 125.
    mockCotarFrete.mockResolvedValue({
      ok: true,
      opcoes: [{ id: 'standard', label: 'PAC', description: '', price: 25, estimate: '' }],
    })
    const res = await POST(makeRequest(VALID_BODY))
    expect(res.status).toBe(201)
    const data = mockTx.pedido.create.mock.calls[0]?.[0]?.data
    expect(data?.frete).toBe(25)
    expect(data?.total).toBe(125)
  })

  it('repassa o erro quando a cotação falha (não cai em preço do cliente)', async () => {
    mockCotarFrete.mockResolvedValue({ ok: false, status: 422, erro: 'Nenhuma opção de frete disponível para este CEP' })
    const res = await POST(makeRequest(VALID_BODY))
    expect(res.status).toBe(422)
    expect(mockTx.pedido.create).not.toHaveBeenCalled()
  })

  it('com cupom FRETE_GRATIS: frete = 0 e nem cota o servidor', async () => {
    const cupomFrete = { id: 'cf1', codigo: 'FRETEGRATIS', ativo: true, tipo: 'FRETE_GRATIS', valor: 0, usoMaximo: null, usoAtual: 0, validade: null }
    mockPrisma.cupom.findUnique.mockResolvedValue(cupomFrete)
    mockTx.cupom.findUnique.mockResolvedValue(cupomFrete)

    const body = { ...VALID_BODY, cupomFreteCodigo: 'FRETEGRATIS', frete: { servicoId: 'express' as const } }
    const res = await POST(makeRequest(body))
    expect(res.status).toBe(201)
    const data = mockTx.pedido.create.mock.calls[0]?.[0]?.data
    expect(data?.frete).toBe(0)
    expect(data?.total).toBe(100)
    expect(mockCotarFrete).not.toHaveBeenCalled()
  })
})

// ─── GET /api/pedidos — área do cliente (P0 follow-up) ─────────────────────────

describe('GET /api/pedidos — lista do cliente', () => {
  beforeEach(() => {
    mockPrisma.pedido.findMany.mockResolvedValue([])
  })

  it('retorna 401 quando não logado', async () => {
    mockAuth.mockResolvedValue(null)
    const res = await GET()
    expect(res.status).toBe(401)
    expect(mockPrisma.pedido.findMany).not.toHaveBeenCalled()
  })

  it('filtra pelos pedidos do próprio usuário + convidado com mesmo e-mail', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1', email: 'cliente@test.com', role: 'CLIENTE' } })
    await GET()
    const where = mockPrisma.pedido.findMany.mock.calls[0]?.[0]?.where
    expect(where).toEqual({
      OR: [
        { usuarioId: 'user-1' },
        { usuarioId: null, compradorEmail: 'cliente@test.com' },
      ],
    })
  })

  it('admin NÃO vê todos os pedidos da loja aqui (só os próprios)', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'admin-1', email: 'admin@metalab.com.br', role: 'SUPER_ADMIN' } })
    await GET()
    const where = mockPrisma.pedido.findMany.mock.calls[0]?.[0]?.where
    // Não pode ser o filtro vazio {} (que devolveria a loja inteira)
    expect(where).not.toEqual({})
    expect(where.OR[0]).toEqual({ usuarioId: 'admin-1' })
  })

  it('sem e-mail na sessão: filtra só por usuarioId', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-2', role: 'CLIENTE' } })
    await GET()
    const where = mockPrisma.pedido.findMany.mock.calls[0]?.[0]?.where
    expect(where).toEqual({ OR: [{ usuarioId: 'user-2' }] })
  })
})
