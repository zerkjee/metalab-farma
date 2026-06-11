import { describe, it, expect, vi } from 'vitest'

// selecionarOpcaoFrete é pura, mas lib/frete importa @/lib/prisma no topo do módulo.
// Mockamos o prisma para não exigir o Prisma Client gerado no job de unit tests do CI.
vi.mock('@/lib/prisma', () => ({ prisma: {} }))

import { selecionarOpcaoFrete } from '@/lib/frete'

const opcoes = [
  { id: 'standard', label: 'PAC', description: '', price: 10, estimate: '' },
  { id: 'express', label: 'SEDEX', description: '', price: 20, estimate: '' },
]

describe('selecionarOpcaoFrete', () => {
  it('retorna a opção correspondente ao servicoId', () => {
    expect(selecionarOpcaoFrete(opcoes, 'express')?.price).toBe(20)
    expect(selecionarOpcaoFrete(opcoes, 'standard')?.price).toBe(10)
  })

  it('retorna null quando o servicoId não existe', () => {
    expect(selecionarOpcaoFrete(opcoes, 'drone')).toBeNull()
  })

  it('retorna null para lista vazia', () => {
    expect(selecionarOpcaoFrete([], 'standard')).toBeNull()
  })
})
