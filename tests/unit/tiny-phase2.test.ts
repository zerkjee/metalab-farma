import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TinyApiError, TinyClient } from '@/lib/tiny/tiny-client'
import { mapOrderToTinyPayload } from '@/lib/tiny/tiny-mapper'
import { validateOrderBeforeTiny } from '@/lib/tiny/tiny-validation'
import type { FullOrderForTiny } from '@/lib/tiny/tiny-types'

function fakeResponse(jsonBody: unknown, httpOk = true, status = 200) {
  return {
    ok: httpOk,
    status,
    text: async () => JSON.stringify(jsonBody),
  } as unknown as Response
}

const ORDER: FullOrderForTiny = {
  id: 'order-1',
  numero: 'MTL-2026-ABC123',
  status: 'PAGAMENTO_APROVADO',
  pago: true,
  compradorNome: 'Maria Teste',
  compradorCpf: '869.934.780-08',
  compradorEmail: 'maria@example.com',
  compradorTelefone: '(11) 99999-8888',
  enderecoSnap: JSON.stringify({
    cep: '01310-100',
    logradouro: 'Av Paulista',
    numero: '1000',
    complemento: 'Sala 5',
    bairro: 'Bela Vista',
    cidade: 'Sao Paulo',
    estado: 'sp',
  }),
  metodoPagamento: 'PIX',
  subtotal: '100.00',
  desconto: '10.00',
  frete: '15.00',
  total: '105.00',
  criadoEm: new Date('2026-07-07T12:00:00Z'),
  tinyPedidoId: null,
  tinyNumero: null,
  tinySyncStatus: 'PENDENTE',
  itens: [
    {
      produtoSku: 'MTL-ART',
      produtoNome: 'Articulice',
      quantidade: 1,
      precoUnit: '100.00',
      produto: { ean: '7890000000000', pesoGramas: 500 },
    },
  ],
}

describe('Tiny Fase 2 — validação e mapper', () => {
  it('valida pedido pago completo', () => {
    const result = validateOrderBeforeTiny(ORDER)

    expect(result.valid).toBe(true)
    expect(result.errors).toEqual([])
  })

  it('bloqueia pedido não pago, sem CPF/CNPJ e sem endereço completo', () => {
    const result = validateOrderBeforeTiny({
      ...ORDER,
      pago: false,
      status: 'AGUARDANDO_PAGAMENTO',
      compradorCpf: '',
      enderecoSnap: JSON.stringify({ cep: '', logradouro: 'Rua A' }),
    })

    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Pedido ainda não está pago.')
    expect(result.errors).toContain('Cliente sem CPF/CNPJ.')
    expect(result.errors).toContain('Endereço do cliente sem número.')
  })

  it('bloqueia item sem SKU, nome, quantidade e preço válido', () => {
    const result = validateOrderBeforeTiny({
      ...ORDER,
      itens: [{ produtoSku: '', produtoNome: '', quantidade: 0, precoUnit: 0, produto: null }],
    })

    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Produto está sem SKU.')
    expect(result.errors).toContain('Produto sem nome.')
    expect(result.errors).toContain('Produto está com quantidade inválida.')
    expect(result.errors).toContain('Produto está com preço unitário inválido.')
  })

  it('gera payload Tiny sem alterar valores financeiros', () => {
    const payload = mapOrderToTinyPayload(ORDER)

    expect(payload.pedido.numero_ecommerce).toBe('MTL-2026-ABC123')
    expect(payload.pedido.cliente.cpf_cnpj).toBe('86993478008')
    expect(payload.pedido.cliente.uf).toBe('SP')
    expect(payload.pedido.valor_frete).toBe(15)
    expect(payload.pedido.valor_desconto).toBe(10)
    expect(payload.pedido.itens[0]?.item).toMatchObject({
      codigo: 'MTL-ART',
      descricao: 'Articulice',
      unidade: 'UN',
      quantidade: 1,
      valor_unitario: 100,
    })
    expect(payload.pedido.obs).toContain('Pedido interno: order-1')
  })
})

describe('TinyClient.createOrder', () => {
  beforeEach(() => {
    process.env.TINY_API_TOKEN = 'token-secreto'
    vi.restoreAllMocks()
  })

  afterEach(() => {
    delete process.env.TINY_API_TOKEN
    vi.unstubAllGlobals()
  })

  it('chama pedido.incluir.php e normaliza sucesso', async () => {
    const fetchSpy = vi.fn().mockResolvedValueOnce(fakeResponse({
      retorno: { status: 'OK', registros: [{ registro: { id: 12345, numero: 7890 } }] },
    }))
    vi.stubGlobal('fetch', fetchSpy)

    const result = await new TinyClient().createOrder(mapOrderToTinyPayload(ORDER))

    expect(result.success).toBe(true)
    expect(result.tinyOrderId).toBe('12345')
    expect(result.tinyOrderNumber).toBe('7890')
    expect(String(fetchSpy.mock.calls[0]?.[0])).toContain('/pedido.incluir.php')
    const body = new URLSearchParams(String(fetchSpy.mock.calls[0]?.[1]?.body))
    expect(body.get('pedido')).toContain('MTL-2026-ABC123')
    expect(body.get('token')).toBe('token-secreto')
  })

  it('lança TinyApiError em erro de negócio do Tiny', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(fakeResponse({
      retorno: {
        status: 'Erro',
        codigo_erro: 31,
        registros: [{ registro: { erros: [{ erro: 'CPF inválido' }] } }],
      },
    })))

    await expect(new TinyClient().createOrder(mapOrderToTinyPayload(ORDER))).rejects.toMatchObject({
      name: 'TinyApiError',
      code: '31',
      message: 'CPF inválido',
    })
  })

  it('não chama fetch quando o token não está configurado', async () => {
    delete process.env.TINY_API_TOKEN
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)

    await expect(new TinyClient().createOrder(mapOrderToTinyPayload(ORDER))).rejects.toBeInstanceOf(TinyApiError)
    expect(fetchSpy).not.toHaveBeenCalled()
  })
})
