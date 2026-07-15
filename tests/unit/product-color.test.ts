import { describe, expect, it } from 'vitest'
import {
  contrastRatio,
  createProductColorTheme,
  normalizeHexColor,
  resolveProductColor,
} from '@/lib/product-color'
import { produtoSchema } from '@/lib/validations'

describe('product color helpers', () => {
  it('normaliza cores hex curtas e rejeita valores inválidos', () => {
    expect(normalizeHexColor('#abc')).toBe('#aabbcc')
    expect(normalizeHexColor('  #D97706  ')).toBe('#D97706')
    expect(normalizeHexColor('orange')).toBeNull()
  })

  it('prioriza a primeira cor válida do produto', () => {
    expect(resolveProductColor('bad', null, '#123456', '#abcdef')).toBe('#123456')
    expect(resolveProductColor(undefined, '')).toBe('#323C64')
  })

  it('gera tokens com contraste seguro sobre branco', () => {
    const theme = createProductColorTheme('#d97706')

    expect(theme.accent).toBe('#d97706')
    expect(contrastRatio(theme.accentStrong, '#ffffff')).toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(theme.accentText, '#ffffff')).toBeGreaterThanOrEqual(4.5)
    expect(theme.focusRing).toMatch(/^#[0-9a-f]{6}55$/i)
  })

  it('normaliza cor visual no schema de produto', () => {
    const result = produtoSchema.safeParse({
      nome: 'Produto teste',
      slug: 'produto-teste',
      sku: 'SKU-TESTE',
      preco: 99.9,
      estoque: 10,
      tags: [],
      corPrincipal: '#abc',
      corSecundaria: '',
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.corPrincipal).toBe('#aabbcc')
      expect(result.data.corSecundaria).toBeNull()
    }
  })
})
