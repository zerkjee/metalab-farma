import { describe, it, expect } from 'vitest'
import { maskEmail, maskCpf, maskPhone, maskCep, maskName } from '@/lib/mask'

// ─── maskEmail ────────────────────────────────────────────────────────────────

describe('maskEmail', () => {
  it('mascara o local part mantendo os 2 primeiros chars', () => {
    expect(maskEmail('pedro@gmail.com')).toBe('pe***@gmail.com')
  })

  it('local part de 2 chars: mantém apenas o 1º char (≤2 chars mostra só local[0])', () => {
    // maskEmail: visible = local.length <= 2 ? local[0] : local.slice(0, 2)
    expect(maskEmail('ab@example.com')).toBe('a*@example.com')
  })

  it('local part de 1 char: mantém 1 char e asterisco', () => {
    expect(maskEmail('p@example.com')).toBe('p*@example.com')
  })

  it('retorna vazio para null', () => {
    expect(maskEmail(null)).toBe('')
  })

  it('retorna vazio para undefined', () => {
    expect(maskEmail(undefined)).toBe('')
  })

  it('retorna *** para string sem @', () => {
    expect(maskEmail('notanemail')).toBe('***')
  })

  it('preserva o domínio intacto', () => {
    const masked = maskEmail('usuario@metalabfarma.com.br')
    expect(masked).toContain('@metalabfarma.com.br')
  })
})

// ─── maskCpf ──────────────────────────────────────────────────────────────────

describe('maskCpf', () => {
  it('mascara mantendo apenas os 2 últimos dígitos', () => {
    expect(maskCpf('12345678909')).toBe('***.***.***-09')
  })

  it('funciona com CPF formatado (remove pontuação)', () => {
    expect(maskCpf('123.456.789-09')).toBe('***.***.***-09')
  })

  it('retorna *** para CPF com comprimento errado', () => {
    expect(maskCpf('1234')).toBe('***')
  })

  it('retorna vazio para null', () => {
    expect(maskCpf(null)).toBe('')
  })
})

// ─── maskPhone ────────────────────────────────────────────────────────────────

describe('maskPhone', () => {
  it('mascara número celular mantendo DDD e últimos 4 dígitos', () => {
    expect(maskPhone('11987654321')).toBe('(11) ****-4321')
  })

  it('funciona com número formatado', () => {
    expect(maskPhone('(31) 98765-4321')).toBe('(31) ****-4321')
  })

  it('retorna *** para número curto demais', () => {
    expect(maskPhone('12345')).toBe('***')
  })

  it('retorna vazio para null', () => {
    expect(maskPhone(null)).toBe('')
  })
})

// ─── maskCep ──────────────────────────────────────────────────────────────────

describe('maskCep', () => {
  it('mascara os últimos 3 dígitos do CEP', () => {
    expect(maskCep('31742227')).toBe('31742-***')
  })

  it('funciona com CEP formatado (remove traço)', () => {
    expect(maskCep('31742-227')).toBe('31742-***')
  })

  it('retorna *** para CEP com dígitos errados', () => {
    expect(maskCep('1234')).toBe('***')
  })

  it('retorna vazio para null', () => {
    expect(maskCep(null)).toBe('')
  })
})

// ─── maskName ─────────────────────────────────────────────────────────────────

describe('maskName', () => {
  it('mantém primeiro nome e inicial do último sobrenome', () => {
    expect(maskName('Pedro Silva')).toBe('Pedro S.')
  })

  it('nome único: retorna sem alteração', () => {
    expect(maskName('Pedro')).toBe('Pedro')
  })

  it('nome com três partes: usa primeiro e última inicial', () => {
    expect(maskName('Pedro Henrique Silva')).toBe('Pedro S.')
  })

  it('retorna vazio para null', () => {
    expect(maskName(null)).toBe('')
  })
})
