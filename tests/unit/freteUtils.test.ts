/**
 * Unit tests for lib/freteUtils.ts
 * calcularPacote e resolveProductDims — sem dependências externas.
 */
import { describe, it, expect, vi } from 'vitest'
import { calcularPacote, resolveProductDims, FALLBACK_DIMS, type ProdutoDims, type CartItemRef } from '@/lib/freteUtils'

// Silencia logger.warn nos testes
vi.mock('@/lib/logger', () => ({
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const prod = (overrides: Partial<ProdutoDims> = {}): ProdutoDims => ({
  id: 'prod-1',
  sku: 'SKU-1',
  tipo: 'SIMPLES',
  pesoGramas: 400,
  alturaCm: 10,
  larguraCm: 12,
  comprimentoCm: 16,
  ...overrides,
})

const item = (produtoId: string, quantidade = 1): CartItemRef => ({ produtoId, quantidade })

// ─── resolveProductDims ────────────────────────────────────────────────────────

describe('resolveProductDims', () => {
  it('produto SIMPLES com todas as dimensões — retorna dados reais sem fallback', () => {
    const result = resolveProductDims(prod())
    expect(result.usedFallback).toBe(false)
    expect(result.pesoGramas).toBe(400)
    expect(result.alturaCm).toBe(10)
    expect(result.larguraCm).toBe(12)
    expect(result.comprimentoCm).toBe(16)
  })

  it('produto SIMPLES sem dimensões — retorna fallback', () => {
    const result = resolveProductDims(prod({ pesoGramas: null, alturaCm: null, larguraCm: null, comprimentoCm: null }))
    expect(result.usedFallback).toBe(true)
    expect(result.pesoGramas).toBe(FALLBACK_DIMS.pesoGramas)
    expect(result.alturaCm).toBe(FALLBACK_DIMS.alturaCm)
    expect(result.larguraCm).toBe(FALLBACK_DIMS.larguraCm)
    expect(result.comprimentoCm).toBe(FALLBACK_DIMS.comprimentoCm)
  })

  it('produto SIMPLES com dimensões parciais — retorna fallback', () => {
    const result = resolveProductDims(prod({ alturaCm: null }))
    expect(result.usedFallback).toBe(true)
  })

  it('KIT com dimensões próprias completas — usa dimensões do kit', () => {
    const kit = prod({
      tipo: 'KIT',
      pesoGramas: 1200,
      alturaCm: 20,
      larguraCm: 25,
      comprimentoCm: 30,
      kitItens: [
        { quantidade: 2, produto: { pesoGramas: 400, alturaCm: 10, larguraCm: 12, comprimentoCm: 16 } },
      ],
    })
    const result = resolveProductDims(kit)
    expect(result.usedFallback).toBe(false)
    expect(result.pesoGramas).toBe(1200) // usa o do kit, não soma componentes
    expect(result.alturaCm).toBe(20)
  })

  it('KIT sem dimensões próprias mas com kitItens — soma componentes', () => {
    const kit: ProdutoDims = {
      id: 'kit-1',
      tipo: 'KIT',
      pesoGramas: null,
      alturaCm: null,
      larguraCm: null,
      comprimentoCm: null,
      kitItens: [
        { quantidade: 2, produto: { pesoGramas: 300, alturaCm: 8, larguraCm: 10, comprimentoCm: 15 } },
        { quantidade: 1, produto: { pesoGramas: 500, alturaCm: 12, larguraCm: 14, comprimentoCm: 18 } },
      ],
    }
    const result = resolveProductDims(kit)
    expect(result.usedFallback).toBe(false)
    expect(result.pesoGramas).toBe(300 * 2 + 500 * 1) // 1100
    expect(result.alturaCm).toBe(12)   // max(8, 12)
    expect(result.larguraCm).toBe(14)  // max(10, 14)
    expect(result.comprimentoCm).toBe(18) // max(15, 18)
  })

  it('KIT sem dimensões próprias e componentes sem dimensões — usa fallback', () => {
    const kit: ProdutoDims = {
      id: 'kit-2',
      tipo: 'KIT',
      pesoGramas: null,
      alturaCm: null,
      larguraCm: null,
      comprimentoCm: null,
      kitItens: [
        { quantidade: 1, produto: { pesoGramas: null, alturaCm: null, larguraCm: null, comprimentoCm: null } },
      ],
    }
    const result = resolveProductDims(kit)
    expect(result.usedFallback).toBe(true)
    expect(result.pesoGramas).toBe(FALLBACK_DIMS.pesoGramas)
  })

  it('KIT sem dimensões e sem kitItens — usa fallback completo', () => {
    const kit: ProdutoDims = {
      id: 'kit-3',
      tipo: 'KIT',
      pesoGramas: null,
      alturaCm: null,
      larguraCm: null,
      comprimentoCm: null,
      kitItens: [],
    }
    const result = resolveProductDims(kit)
    expect(result.usedFallback).toBe(true)
  })
})

// ─── calcularPacote ────────────────────────────────────────────────────────────

describe('calcularPacote', () => {
  it('1 produto SIMPLES com todas as dimensões — peso e dims corretos', () => {
    const produtos = [prod({ id: 'p1', pesoGramas: 600, alturaCm: 10, larguraCm: 12, comprimentoCm: 16 })]
    const { pacote, semDimensoes } = calcularPacote([item('p1')], produtos)

    expect(semDimensoes).toHaveLength(0)
    expect(pacote.weightKg).toBeCloseTo(0.6)
    expect(pacote.heightCm).toBe(10)
    expect(pacote.widthCm).toBe(12)
    expect(pacote.lengthCm).toBe(16)
  })

  it('múltiplos produtos — soma peso e usa max das dimensões', () => {
    const produtos = [
      prod({ id: 'p1', pesoGramas: 400, alturaCm: 10, larguraCm: 12, comprimentoCm: 16 }),
      prod({ id: 'p2', pesoGramas: 600, alturaCm: 15, larguraCm: 10, comprimentoCm: 20 }),
    ]
    const { pacote, semDimensoes } = calcularPacote([item('p1', 2), item('p2', 1)], produtos)

    expect(semDimensoes).toHaveLength(0)
    expect(pacote.weightKg).toBeCloseTo((400 * 2 + 600 * 1) / 1000) // 1.4 kg
    expect(pacote.heightCm).toBe(15)  // max(10, 15)
    expect(pacote.widthCm).toBe(12)   // max(12, 10)
    expect(pacote.lengthCm).toBe(20)  // max(16, 20)
  })

  it('produto sem dimensões — usa fallback e registra em semDimensoes', () => {
    const produtos = [prod({ id: 'p1', pesoGramas: null, alturaCm: null, larguraCm: null, comprimentoCm: null, sku: 'SKU-1' })]
    const { pacote, semDimensoes } = calcularPacote([item('p1')], produtos)

    expect(semDimensoes).toContain('SKU-1')
    expect(pacote.weightKg).toBeCloseTo(FALLBACK_DIMS.pesoGramas / 1000)
    expect(pacote.heightCm).toBeGreaterThan(0)
  })

  it('produto não encontrado no banco — usa fallback e registra ID em semDimensoes', () => {
    const { pacote, semDimensoes } = calcularPacote([item('id-inexistente')], [])

    expect(semDimensoes).toContain('id-inexistente')
    expect(pacote.weightKg).toBeCloseTo(FALLBACK_DIMS.pesoGramas / 1000)
  })

  it('produto local (mock) — usa fallback SEM registrar em semDimensoes', () => {
    const { pacote, semDimensoes } = calcularPacote([item('local-1')], [])

    expect(semDimensoes).toHaveLength(0)
    expect(pacote.weightKg).toBeCloseTo(FALLBACK_DIMS.pesoGramas / 1000)
  })

  it('KIT com dimensões próprias — usa dimensões do kit (não soma componentes)', () => {
    const kit: ProdutoDims = {
      id: 'kit-1',
      tipo: 'KIT',
      pesoGramas: 1500,
      alturaCm: 20,
      larguraCm: 25,
      comprimentoCm: 30,
      kitItens: [
        { quantidade: 3, produto: { pesoGramas: 300, alturaCm: 8, larguraCm: 10, comprimentoCm: 15 } },
      ],
    }
    const { pacote, semDimensoes } = calcularPacote([item('kit-1')], [kit])

    expect(semDimensoes).toHaveLength(0)
    expect(pacote.weightKg).toBeCloseTo(1.5)
    expect(pacote.heightCm).toBe(20)
  })

  it('KIT calculado por componentes — soma peso dos componentes × quantidades', () => {
    const kit: ProdutoDims = {
      id: 'kit-2',
      tipo: 'KIT',
      pesoGramas: null,
      alturaCm: null,
      larguraCm: null,
      comprimentoCm: null,
      kitItens: [
        { quantidade: 2, produto: { pesoGramas: 400, alturaCm: 10, larguraCm: 12, comprimentoCm: 16 } },
        { quantidade: 1, produto: { pesoGramas: 500, alturaCm: 15, larguraCm: 14, comprimentoCm: 20 } },
      ],
    }
    const { pacote, semDimensoes } = calcularPacote([item('kit-2', 1)], [kit])

    expect(semDimensoes).toHaveLength(0)
    // Kit: peso = (400*2 + 500*1) = 1300g × 1 unidade do kit = 1.3 kg
    expect(pacote.weightKg).toBeCloseTo(1.3)
    expect(pacote.heightCm).toBe(15)  // max(10, 15)
    expect(pacote.lengthCm).toBe(20)  // max(16, 20)
  })

  it('peso total correto com múltiplas quantidades', () => {
    const produtos = [prod({ id: 'p1', pesoGramas: 250 })]
    const { pacote } = calcularPacote([item('p1', 4)], produtos)
    expect(pacote.weightKg).toBeCloseTo(1.0) // 250g × 4 = 1000g = 1kg
  })

  it('respeita dimensões mínimas dos Correios (altura ≥ 2cm, largura ≥ 11cm, comprimento ≥ 16cm)', () => {
    // Produto minúsculo que violaria os mínimos
    const produtos = [prod({ id: 'p1', pesoGramas: 10, alturaCm: 1, larguraCm: 5, comprimentoCm: 8 })]
    const { pacote } = calcularPacote([item('p1')], produtos)

    expect(pacote.heightCm).toBeGreaterThanOrEqual(2)
    expect(pacote.widthCm).toBeGreaterThanOrEqual(11)
    expect(pacote.lengthCm).toBeGreaterThanOrEqual(16)
  })

  it('carrinho misto: produto real + produto local', () => {
    const produtos = [prod({ id: 'real-1', pesoGramas: 800, alturaCm: 12, larguraCm: 14, comprimentoCm: 18 })]
    const { pacote, semDimensoes } = calcularPacote(
      [item('real-1', 1), item('local-1', 2)],
      produtos,
    )

    expect(semDimensoes).toHaveLength(0)
    // real: 800g | local: 500g × 2 = 1000g → total 1800g
    expect(pacote.weightKg).toBeCloseTo(1.8)
    // dims: max(12, 10)=12, max(14, 12)=14, max(18, 15)=18
    expect(pacote.heightCm).toBe(12)
    expect(pacote.widthCm).toBe(14)
    expect(pacote.lengthCm).toBe(18)
  })
})
