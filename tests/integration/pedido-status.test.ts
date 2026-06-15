/**
 * GET /api/pedidos/[id]/status — acompanhamento de convidado (sem PII).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: { pedido: { findUnique: vi.fn() } },
}))
const { mockRateLimit } = vi.hoisted(() => ({ mockRateLimit: vi.fn() }))

vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))
vi.mock('@/lib/rateLimit', () => ({
  pollingRatelimit: { limit: mockRateLimit },
  getIp: vi.fn().mockReturnValue('127.0.0.1'),
}))
vi.mock('@/lib/logger', () => ({ logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn(), debug: vi.fn() } }))

import { GET } from '@/app/api/pedidos/[id]/status/route'

function req() {
  return new NextRequest('http://localhost/api/pedidos/abc/status')
}
function ctx(id: string) {
  return { params: Promise.resolve({ id }) }
}

const PEDIDO = {
  id: 'ped-1', numero: 'MTL-2026-AB1234', status: 'AGUARDANDO_PAGAMENTO',
  metodoPagamento: 'PIX', pago: false, criadoEm: new Date('2026-06-11'), codigoRastreio: null,
  subtotal: 100, desconto: 0, frete: 10, total: 110,
  itens: [{ id: 'i1', produtoNome: 'Whey', produtoImagem: null, quantidade: 1, precoUnit: 100, subtotal: 100 }],
}

beforeEach(() => {
  vi.clearAllMocks()
  mockRateLimit.mockResolvedValue({ success: true })
  mockPrisma.pedido.findUnique.mockResolvedValue(PEDIDO)
})

describe('GET /api/pedidos/[id]/status', () => {
  it('retorna 429 quando rate limit excede', async () => {
    mockRateLimit.mockResolvedValue({ success: false })
    const res = await GET(req(), ctx('ped-1'))
    expect(res.status).toBe(429)
  })

  it('retorna 404 quando o pedido não existe', async () => {
    mockPrisma.pedido.findUnique.mockResolvedValue(null)
    const res = await GET(req(), ctx('nope'))
    expect(res.status).toBe(404)
  })

  it('retorna campos seguros e NÃO expõe PII', async () => {
    const res = await GET(req(), ctx('ped-1'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.numero).toBe('MTL-2026-AB1234')
    expect(body.total).toBe(110)
    expect(body.itens[0].produtoNome).toBe('Whey')
    // Sem PII
    expect(body).not.toHaveProperty('compradorCpf')
    expect(body).not.toHaveProperty('compradorEmail')
    expect(body).not.toHaveProperty('enderecoSnap')
    // O select não pede esses campos → o handler não pode vazá-los
    const sel = mockPrisma.pedido.findUnique.mock.calls[0]?.[0]?.select
    expect(sel.compradorCpf).toBeUndefined()
    expect(sel.compradorEmail).toBeUndefined()
  })
})
