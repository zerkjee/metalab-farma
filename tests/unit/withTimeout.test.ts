import { describe, it, expect, vi, afterEach } from 'vitest'
import { withTimeout } from '@/lib/withTimeout'

afterEach(() => {
  vi.restoreAllMocks()
  vi.useRealTimers()
})

describe('withTimeout', () => {
  it('resolve com o valor da promise quando ela termina antes do prazo', async () => {
    const result = await withTimeout(Promise.resolve('ok'), 1000, 'teste')
    expect(result).toBe('ok')
  })

  it('repassa a rejeição original quando a promise rejeita antes do prazo', async () => {
    const original = new Error('falha upstream')
    await expect(withTimeout(Promise.reject(original), 1000, 'teste')).rejects.toBe(original)
  })

  it('rejeita com mensagem clara de timeout quando o prazo estoura', async () => {
    vi.useFakeTimers()
    const nunca = new Promise<string>(() => {}) // nunca resolve
    const p = withTimeout(nunca, 5000, 'mercadopago')
    const assertion = expect(p).rejects.toThrow('mercadopago timed out after 5000ms')
    await vi.advanceTimersByTimeAsync(5000)
    await assertion
  })

  it('limpa o timer no caminho de sucesso (não vaza timer)', async () => {
    const clearSpy = vi.spyOn(globalThis, 'clearTimeout')
    await withTimeout(Promise.resolve(42), 1000, 'teste')
    expect(clearSpy).toHaveBeenCalledTimes(1)
  })

  it('limpa o timer também quando a promise rejeita', async () => {
    const clearSpy = vi.spyOn(globalThis, 'clearTimeout')
    await expect(withTimeout(Promise.reject(new Error('x')), 1000, 'teste')).rejects.toThrow('x')
    expect(clearSpy).toHaveBeenCalledTimes(1)
  })
})
