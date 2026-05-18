import { describe, it, expect } from 'vitest'
import {
  gerarNumeroPedido,
  cupomValido,
  calcularDesconto,
  calcularTotal,
  type CupomLike,
} from '@/lib/orderUtils'

// ─── Fixtures ────────────────────────────────────────────────────────────────

const BASE: CupomLike = {
  id: 'c1',
  ativo: true,
  tipo: 'PERCENTUAL',
  valor: 10,
  usoMaximo: null,
  usoAtual: 0,
  validade: null,
}

const amanha = new Date(Date.now() + 86_400_000)
const ontem = new Date(Date.now() - 86_400_000)

// ─── gerarNumeroPedido ────────────────────────────────────────────────────────

describe('gerarNumeroPedido', () => {
  it('segue o formato MTL-YYYY-XXXXXX', () => {
    const ano = new Date().getFullYear()
    const n = gerarNumeroPedido()
    expect(n).toMatch(new RegExp(`^MTL-${ano}-[A-Z0-9]{6}$`))
  })

  it('gera valores únicos (100 amostras)', () => {
    const nums = new Set(Array.from({ length: 100 }, gerarNumeroPedido))
    expect(nums.size).toBe(100)
  })
})

// ─── cupomValido ─────────────────────────────────────────────────────────────

describe('cupomValido', () => {
  it('retorna false para null', () => {
    expect(cupomValido(null)).toBe(false)
  })

  it('retorna false quando inativo', () => {
    expect(cupomValido({ ...BASE, ativo: false })).toBe(false)
  })

  it('retorna false quando expirado (ontem)', () => {
    expect(cupomValido({ ...BASE, validade: ontem })).toBe(false)
  })

  it('retorna true quando válido até amanhã', () => {
    expect(cupomValido({ ...BASE, validade: amanha })).toBe(true)
  })

  it('retorna true quando sem validade', () => {
    expect(cupomValido({ ...BASE, validade: null })).toBe(true)
  })

  it('retorna false quando limite de uso esgotado', () => {
    expect(cupomValido({ ...BASE, usoMaximo: 5, usoAtual: 5 })).toBe(false)
  })

  it('retorna false quando uso excede limite', () => {
    expect(cupomValido({ ...BASE, usoMaximo: 5, usoAtual: 6 })).toBe(false)
  })

  it('retorna true quando abaixo do limite de uso', () => {
    expect(cupomValido({ ...BASE, usoMaximo: 5, usoAtual: 4 })).toBe(true)
  })

  it('retorna true quando sem limite de uso (usoMaximo null)', () => {
    expect(cupomValido({ ...BASE, usoMaximo: null, usoAtual: 9999 })).toBe(true)
  })
})

// ─── calcularDesconto ─────────────────────────────────────────────────────────

describe('calcularDesconto', () => {
  it('PERCENTUAL 10% sobre R$100 = R$10', () => {
    expect(calcularDesconto({ ...BASE, tipo: 'PERCENTUAL', valor: 10 }, 100))
      .toEqual({ desconto: 10, freteGratis: false })
  })

  it('PERCENTUAL 15% sobre R$200 = R$30', () => {
    expect(calcularDesconto({ ...BASE, tipo: 'PERCENTUAL', valor: 15 }, 200))
      .toEqual({ desconto: 30, freteGratis: false })
  })

  it('PERCENTUAL aceita valor Decimal-like (objeto com toNumber)', () => {
    const cupom: CupomLike = { ...BASE, tipo: 'PERCENTUAL', valor: { toNumber: () => 20 } }
    expect(calcularDesconto(cupom, 100)).toEqual({ desconto: 20, freteGratis: false })
  })

  it('VALOR_FIXO R$20 sobre pedido de R$50 = R$20', () => {
    expect(calcularDesconto({ ...BASE, tipo: 'VALOR_FIXO', valor: 20 }, 50))
      .toEqual({ desconto: 20, freteGratis: false })
  })

  it('VALOR_FIXO é limitado ao subtotal (não gera total negativo)', () => {
    expect(calcularDesconto({ ...BASE, tipo: 'VALOR_FIXO', valor: 50 }, 30))
      .toEqual({ desconto: 30, freteGratis: false })
  })

  it('FRETE_GRATIS zera desconto monetário e seta freteGratis', () => {
    expect(calcularDesconto({ ...BASE, tipo: 'FRETE_GRATIS', valor: 0 }, 100))
      .toEqual({ desconto: 0, freteGratis: true })
  })
})

// ─── calcularTotal ────────────────────────────────────────────────────────────

describe('calcularTotal', () => {
  it('subtotal − desconto + frete', () => {
    expect(calcularTotal({ subtotal: 100, desconto: 10, freteGratis: false, fretePrco: 20 }))
      .toEqual({ valorFrete: 20, total: 110 })
  })

  it('frete grátis zera o frete mesmo que fretePrco seja positivo', () => {
    expect(calcularTotal({ subtotal: 100, desconto: 0, freteGratis: true, fretePrco: 25 }))
      .toEqual({ valorFrete: 0, total: 100 })
  })

  it('combinação: desconto percentual + frete normal', () => {
    // 10% de 200 = 20; frete = 15; total = 200 - 20 + 15 = 195
    expect(calcularTotal({ subtotal: 200, desconto: 20, freteGratis: false, fretePrco: 15 }))
      .toEqual({ valorFrete: 15, total: 195 })
  })

  it('combinação: desconto fixo + frete grátis', () => {
    // desconto = 30; frete = 0; total = 100 - 30 + 0 = 70
    expect(calcularTotal({ subtotal: 100, desconto: 30, freteGratis: true, fretePrco: 20 }))
      .toEqual({ valorFrete: 0, total: 70 })
  })

  it('desconto igual ao subtotal resulta em total = frete (não negativo)', () => {
    const { total } = calcularTotal({ subtotal: 50, desconto: 50, freteGratis: false, fretePrco: 10 })
    expect(total).toBe(10)
    expect(total).toBeGreaterThanOrEqual(0)
  })

  it('pedido sem frete e sem desconto: total = subtotal', () => {
    expect(calcularTotal({ subtotal: 89.9, desconto: 0, freteGratis: false, fretePrco: 0 }))
      .toEqual({ valorFrete: 0, total: 89.9 })
  })
})
