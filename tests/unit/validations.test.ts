import { describe, it, expect } from 'vitest'
import { senhaSchema, enderecoSchema, cupomSchema } from '@/lib/validations'

// ─── senhaSchema ──────────────────────────────────────────────────────────────

describe('senhaSchema', () => {
  it('aceita senha válida', () => {
    expect(senhaSchema.safeParse('Senha@123').success).toBe(true)
  })

  it('rejeita sem maiúscula', () => {
    expect(senhaSchema.safeParse('senha@123').success).toBe(false)
  })

  it('rejeita sem minúscula', () => {
    expect(senhaSchema.safeParse('SENHA@123').success).toBe(false)
  })

  it('rejeita sem número', () => {
    expect(senhaSchema.safeParse('Senha@abc').success).toBe(false)
  })

  it('rejeita sem caractere especial', () => {
    expect(senhaSchema.safeParse('Senha1234').success).toBe(false)
  })

  it('rejeita com menos de 8 chars', () => {
    expect(senhaSchema.safeParse('S@1a').success).toBe(false)
  })

  it('rejeita com mais de 72 chars', () => {
    const longa = 'Aa1!' + 'x'.repeat(70)
    expect(senhaSchema.safeParse(longa).success).toBe(false)
  })
})

// ─── enderecoSchema ───────────────────────────────────────────────────────────

describe('enderecoSchema', () => {
  const VALIDO = {
    cep: '31742227',
    logradouro: 'Rua das Flores',
    numero: '42',
    bairro: 'Jardim',
    cidade: 'BH',
    estado: 'MG',
  }

  it('aceita endereço completo válido', () => {
    expect(enderecoSchema.safeParse(VALIDO).success).toBe(true)
  })

  it('aceita sem complemento (opcional)', () => {
    const { complemento: _, ...sem } = { ...VALIDO, complemento: undefined }
    expect(enderecoSchema.safeParse(sem).success).toBe(true)
  })

  it('rejeita CEP com letras', () => {
    expect(enderecoSchema.safeParse({ ...VALIDO, cep: '3174222A' }).success).toBe(false)
  })

  it('rejeita CEP com 7 dígitos', () => {
    expect(enderecoSchema.safeParse({ ...VALIDO, cep: '3174222' }).success).toBe(false)
  })

  it('rejeita estado com 3 letras', () => {
    expect(enderecoSchema.safeParse({ ...VALIDO, estado: 'MGA' }).success).toBe(false)
  })

  it('rejeita logradouro com menos de 3 chars', () => {
    expect(enderecoSchema.safeParse({ ...VALIDO, logradouro: 'Ru' }).success).toBe(false)
  })
})

// ─── cupomSchema ──────────────────────────────────────────────────────────────

describe('cupomSchema', () => {
  const BASE = { codigo: 'PROMO10', tipo: 'PERCENTUAL', valor: 10, ativo: true }

  it('aceita cupom percentual válido', () => {
    expect(cupomSchema.safeParse(BASE).success).toBe(true)
  })

  it('aceita cupom de valor fixo', () => {
    expect(cupomSchema.safeParse({ ...BASE, tipo: 'VALOR_FIXO', valor: 20 }).success).toBe(true)
  })

  it('aceita cupom de frete grátis', () => {
    expect(cupomSchema.safeParse({ ...BASE, tipo: 'FRETE_GRATIS', valor: 1 }).success).toBe(true)
  })

  it('converte código para maiúsculas', () => {
    const result = cupomSchema.safeParse({ ...BASE, codigo: 'promo10' })
    expect(result.success && result.data.codigo).toBe('PROMO10')
  })

  it('rejeita tipo desconhecido', () => {
    expect(cupomSchema.safeParse({ ...BASE, tipo: 'CASHBACK' }).success).toBe(false)
  })

  it('rejeita valor negativo', () => {
    expect(cupomSchema.safeParse({ ...BASE, valor: -5 }).success).toBe(false)
  })

  it('rejeita código com menos de 3 chars', () => {
    expect(cupomSchema.safeParse({ ...BASE, codigo: 'AB' }).success).toBe(false)
  })
})
