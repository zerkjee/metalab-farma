import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const { mockAuth } = vi.hoisted(() => ({ mockAuth: vi.fn() }))
const { mockPrisma } = vi.hoisted(() => {
  const mockPrisma = {
    usuario: { findFirst: vi.fn(), create: vi.fn() },
    itemPedido: { findFirst: vi.fn() },
    avaliacao: { findFirst: vi.fn(), create: vi.fn() },
  }
  return { mockPrisma }
})
const { mockRegistroRatelimit, mockAvaliacaoRatelimit } = vi.hoisted(() => ({
  mockRegistroRatelimit: { limit: vi.fn() },
  mockAvaliacaoRatelimit: { limit: vi.fn() },
}))
const { mockBcryptHash } = vi.hoisted(() => ({ mockBcryptHash: vi.fn() }))

vi.mock('@/lib/auth', () => ({ auth: mockAuth }))
vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))
vi.mock('@/lib/logger', () => ({
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))
vi.mock('@/lib/rateLimit', () => ({
  registroRatelimit: mockRegistroRatelimit,
  avaliacaoRatelimit: mockAvaliacaoRatelimit,
  getIp: vi.fn().mockReturnValue('127.0.0.1'),
}))
vi.mock('bcryptjs', () => ({
  default: { hash: mockBcryptHash },
}))

import { POST as registroPost } from '@/app/api/auth/registro/route'
import { POST as avaliacoesPost } from '@/app/api/avaliacoes/route'

// Corpo válido segundo registroSchema — o campo role: 'ADMIN' extra deve ser ignorado pelo schema
const validRegistroBody = {
  nome: 'Test User',
  email: 'test@test.com',
  senha: 'Teste123!',
  confirmarSenha: 'Teste123!',
  cpf: '52998224725', // CPF válido para testes
  telefone: '11999999999',
  endereco: {
    cep: '01310100',
    logradouro: 'Avenida Paulista',
    numero: '1000',
    bairro: 'Bela Vista',
    cidade: 'Sao Paulo',
    estado: 'SP',
  },
}

beforeEach(() => {
  vi.clearAllMocks()
  mockAuth.mockResolvedValue(null) // guest por padrão
  mockRegistroRatelimit.limit.mockResolvedValue({ success: true })
  mockAvaliacaoRatelimit.limit.mockResolvedValue({ success: true })
  mockBcryptHash.mockResolvedValue('$2a$12$fakehashfakehashfakehash')
})

describe('POST /api/auth/registro — mass assignment de role', () => {
  it('ignora campo role no body (cria usuário como CLIENTE)', async () => {
    mockPrisma.usuario.findFirst.mockResolvedValue(null)
    mockPrisma.usuario.create.mockResolvedValue({
      id: 'new-user-1',
      email: 'test@test.com',
      nome: 'Test User',
    })

    const body = { ...validRegistroBody, role: 'ADMIN' }
    const req = new NextRequest('http://localhost/api/auth/registro', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await registroPost(req)

    expect(res.status).toBe(201)
    expect(mockPrisma.usuario.create).toHaveBeenCalledOnce()
    const createData = mockPrisma.usuario.create.mock.calls[0][0].data
    expect(createData.papel).toBe('CLIENTE')
  })
})

describe('POST /api/avaliacoes — mass assignment de aprovada', () => {
  it('ignora campo aprovada: true no body', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockPrisma.itemPedido.findFirst.mockResolvedValue({ id: 'item-1' })
    mockPrisma.avaliacao.findFirst.mockResolvedValue(null)
    mockPrisma.avaliacao.create.mockResolvedValue({ id: 'aval-1' })

    const body = { produtoId: 'prod-1', nota: 5, texto: 'Ótimo produto', aprovada: true }
    const req = new NextRequest('http://localhost/api/avaliacoes', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await avaliacoesPost(req)

    expect(res.status).toBe(201)
    expect(mockPrisma.avaliacao.create).toHaveBeenCalledOnce()
    const createData = mockPrisma.avaliacao.create.mock.calls[0][0].data
    expect(createData.aprovada).toBe(false)
  })
})
