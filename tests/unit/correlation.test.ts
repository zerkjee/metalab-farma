import { describe, it, expect } from 'vitest'
import {
  runWithCorrelation,
  getContext,
  getCorrelationId,
  getRequestId,
  newCorrelationId,
} from '@/lib/observability'

describe('correlation (AsyncLocalStorage)', () => {
  it('retorna undefined sem store ativo, sem lançar', () => {
    expect(getContext()).toBeUndefined()
    expect(getCorrelationId()).toBeUndefined()
    expect(getRequestId()).toBeUndefined()
  })

  it('disponibiliza o contexto dentro de fn', () => {
    const out = runWithCorrelation({ correlationId: 'c1', requestId: 'r1' }, () => {
      expect(getCorrelationId()).toBe('c1')
      expect(getRequestId()).toBe('r1')
      expect(getContext()).toEqual({ correlationId: 'c1', requestId: 'r1' })
      return 'ok'
    })
    expect(out).toBe('ok')
  })

  it('limpa o contexto após fn retornar', () => {
    runWithCorrelation({ correlationId: 'c1', requestId: 'r1' }, () => 'x')
    expect(getCorrelationId()).toBeUndefined()
  })

  it('suporta contextos aninhados', () => {
    runWithCorrelation({ correlationId: 'outer', requestId: 'ro' }, () => {
      expect(getCorrelationId()).toBe('outer')
      runWithCorrelation({ correlationId: 'inner', requestId: 'ri', causationId: 'k' }, () => {
        expect(getCorrelationId()).toBe('inner')
        expect(getContext()?.causationId).toBe('k')
      })
      // volta ao contexto externo ao sair do aninhado
      expect(getCorrelationId()).toBe('outer')
    })
  })

  it('newCorrelationId gera UUIDs distintos', () => {
    const a = newCorrelationId()
    const b = newCorrelationId()
    expect(a).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
    expect(a).not.toBe(b)
  })
})
