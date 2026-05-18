import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mocked before importing adminGuard — prevents NextAuth/Prisma from loading
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}))

import { requireAdmin } from '@/lib/adminGuard'
import { auth } from '@/lib/auth'

// Cast to Mock to avoid NextAuth's complex overloaded type in test assertions
const mockAuth = auth as unknown as ReturnType<typeof vi.fn>

describe('requireAdmin', () => {
  beforeEach(() => {
    mockAuth.mockReset()
  })

  it('retorna null quando não há sessão', async () => {
    mockAuth.mockResolvedValue(null)
    expect(await requireAdmin()).toBeNull()
  })

  it('retorna null para papel CLIENTE', async () => {
    mockAuth.mockResolvedValue({ user: { id: '1', email: 'c@c.com', role: 'CLIENTE' } })
    expect(await requireAdmin()).toBeNull()
  })

  it('retorna null quando role está ausente', async () => {
    mockAuth.mockResolvedValue({ user: { id: '1', email: 'x@x.com' } })
    expect(await requireAdmin()).toBeNull()
  })

  it('retorna sessão para papel ADMIN', async () => {
    const session = { user: { id: '2', email: 'admin@m.com', role: 'ADMIN' } }
    mockAuth.mockResolvedValue(session)
    expect(await requireAdmin()).toEqual(session)
  })

  it('retorna sessão para SUPER_ADMIN (includes "ADMIN")', async () => {
    const session = { user: { id: '3', email: 'super@m.com', role: 'SUPER_ADMIN' } }
    mockAuth.mockResolvedValue(session)
    expect(await requireAdmin()).toEqual(session)
  })

  it('propaga exceção quando auth() lança erro (JWT decode fail)', async () => {
    mockAuth.mockRejectedValue(new Error('JWT decode error'))
    await expect(requireAdmin()).rejects.toThrow('JWT decode error')
  })
})
