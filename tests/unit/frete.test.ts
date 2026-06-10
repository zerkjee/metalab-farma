import { describe, it, expect } from 'vitest'
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
