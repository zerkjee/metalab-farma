import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const { mockAuth } = vi.hoisted(() => ({ mockAuth: vi.fn() }))
const { mockPrisma } = vi.hoisted(() => {
  const mockPrisma = {
    pedido: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
  }
  return { mockPrisma }
})

vi.mock('@/lib/auth', () => ({ auth: mockAuth }))
vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))
vi.mock('@/lib/logger', () => ({
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))
vi.mock('@/lib/audit', () => ({
  auditFromSession: vi.fn(),
}))

import { GET, PATCH } from '@/app/api/pedidos/[id]/route'

const pedidoBase = {
  id: 'pedido-123',
  numero: 'ORD-001',
  usuarioId: 'user-A',
  itens: [],
  cupom: null,
  subtotal: 100,
  desconto: 0,
  frete: 10,
  total: 110,
}

beforeEach(() => {
  vi.clearAllMocks()
  mockAuth.mockResolvedValue(null) // guest por padrão
})

describe('GET /api/pedidos/[id] — ownership', () => {
  it('retorna 401 quando não autenticado e não é admin', async () => {
    // mockAuth retorna null (configurado em beforeEach)
    mockPrisma.pedido.findUnique.mockResolvedValue({ ...pedidoBase, usuarioId: 'user-B' })

    const req = new NextRequest('http://localhost/api/pedidos/pedido-123')
    const res = await GET(req, { params: Promise.resolve({ id: 'pedido-123' }) })

    expect(res.status).toBe(401)
  })

  it('retorna 200 para o dono do pedido', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-A', role: 'CLIENTE' } })
    mockPrisma.pedido.findUnique.mockResolvedValue({ ...pedidoBase, usuarioId: 'user-A' })

    const req = new NextRequest('http://localhost/api/pedidos/pedido-123')
    const res = await GET(req, { params: Promise.resolve({ id: 'pedido-123' }) })

    expect(res.status).toBe(200)
  })

  it('retorna 200 para admin mesmo não sendo dono', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'admin-1', role: 'ADMIN' } })
    mockPrisma.pedido.findUnique.mockResolvedValue({ ...pedidoBase, usuarioId: 'user-B' })

    const req = new NextRequest('http://localhost/api/pedidos/pedido-123')
    const res = await GET(req, { params: Promise.resolve({ id: 'pedido-123' }) })

    expect(res.status).toBe(200)
  })

  it('retorna 401 para cliente tentando ver pedido de outro usuário', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-A', role: 'CLIENTE' } })
    mockPrisma.pedido.findUnique.mockResolvedValue({ ...pedidoBase, usuarioId: 'user-B' })

    const req = new NextRequest('http://localhost/api/pedidos/pedido-123')
    const res = await GET(req, { params: Promise.resolve({ id: 'pedido-123' }) })

    expect(res.status).toBe(401)
  })
})

describe('PATCH /api/pedidos/[id] — admin only', () => {
  it('retorna 401 para cliente tentando alterar status', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-A', role: 'CLIENTE' } })

    const req = new NextRequest('http://localhost/api/pedidos/pedido-123', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'CANCELADO' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await PATCH(req, { params: Promise.resolve({ id: 'pedido-123' }) })

    expect(res.status).toBe(401)
    expect(mockPrisma.pedido.update).not.toHaveBeenCalled()
  })
})
