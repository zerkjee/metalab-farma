import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import {
  criarOuLocalizarPedidoTiny,
  localizarPedidoTiny,
  consultarPedidoTiny,
  tinyConfigurado,
  TINY_DISABLED,
  type TinyPedidoInput,
} from '@/lib/tiny'

// Helper: cria uma Response-like com corpo textual e status HTTP.
function fakeResponse(jsonBody: unknown, httpOk = true) {
  return {
    ok: httpOk,
    text: async () => JSON.stringify(jsonBody),
  } as unknown as Response
}

const PEDIDO_BASE: TinyPedidoInput = {
  numero: 'MTL-2026-ABC123',
  compradorNome: 'Maria Teste',
  compradorCpf: '86993478008',
  compradorEmail: 'maria@example.com',
  compradorTelefone: '11999998888',
  enderecoSnap: null,
  subtotal: 100,
  desconto: 10,
  frete: 15,
  total: 105,
  itens: [{ sku: 'MTL-ART', nome: 'Articulice', quantidade: 1, precoUnit: 100 }],
}

describe('lib/tiny', () => {
  beforeEach(() => {
    process.env.TINY_API_TOKEN = 'token-de-teste'
    vi.restoreAllMocks()
  })

  afterEach(() => {
    delete process.env.TINY_API_TOKEN
    vi.unstubAllGlobals()
  })

  describe('tinyConfigurado', () => {
    it('retorna true quando TINY_API_TOKEN está presente', () => {
      expect(tinyConfigurado()).toBe(true)
    })

    it('retorna false quando TINY_API_TOKEN está ausente', () => {
      delete process.env.TINY_API_TOKEN
      expect(tinyConfigurado()).toBe(false)
    })
  })

  describe('guard sem token (sem chamadas reais)', () => {
    it('não chama fetch e retorna TINY_DISABLED quando token ausente', async () => {
      delete process.env.TINY_API_TOKEN
      const fetchSpy = vi.fn()
      vi.stubGlobal('fetch', fetchSpy)

      const result = await criarOuLocalizarPedidoTiny(PEDIDO_BASE)

      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.erro).toBe(TINY_DISABLED)
      expect(fetchSpy).not.toHaveBeenCalled()
    })
  })

  describe('criarOuLocalizarPedidoTiny — mock sucesso', () => {
    it('cria o pedido quando não existe e retorna o id do Tiny', async () => {
      const fetchSpy = vi
        .fn()
        // 1ª chamada: pesquisa → nenhum pedido
        .mockResolvedValueOnce(fakeResponse({ retorno: { status: 'OK', pedidos: [] } }))
        // 2ª chamada: incluir → OK com id
        .mockResolvedValueOnce(
          fakeResponse({
            retorno: { status: 'OK', registros: [{ registro: { id: 98765, numero: PEDIDO_BASE.numero } }] },
          }),
        )
      vi.stubGlobal('fetch', fetchSpy)

      const result = await criarOuLocalizarPedidoTiny(PEDIDO_BASE)

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.tinyPedidoId).toBe('98765')
        expect(result.jaExistia).toBe(false)
      }
      expect(fetchSpy).toHaveBeenCalledTimes(2)
    })
  })

  describe('criarOuLocalizarPedidoTiny — mock erro', () => {
    it('retorna ok:false com a mensagem de erro do Tiny', async () => {
      const fetchSpy = vi
        .fn()
        .mockResolvedValueOnce(fakeResponse({ retorno: { status: 'OK', pedidos: [] } }))
        .mockResolvedValueOnce(
          fakeResponse({
            retorno: {
              status: 'Erro',
              codigo_erro: 31,
              registros: [{ registro: { erros: [{ erro: 'CPF inválido' }] } }],
            },
          }),
        )
      vi.stubGlobal('fetch', fetchSpy)

      const result = await criarOuLocalizarPedidoTiny(PEDIDO_BASE)

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.erro).toContain('CPF inválido')
        expect(result.codigoErro).toBe('31')
      }
    })

    it('trata falha de transporte (fetch rejeitado) sem lançar', async () => {
      const fetchSpy = vi.fn().mockRejectedValue(new Error('ECONNREFUSED'))
      vi.stubGlobal('fetch', fetchSpy)

      const result = await criarOuLocalizarPedidoTiny(PEDIDO_BASE)

      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.erro).toBe('ECONNREFUSED')
    })
  })

  describe('criarOuLocalizarPedidoTiny — mock pedido já existente', () => {
    it('retorna o id existente e NÃO chama o endpoint de inclusão', async () => {
      const fetchSpy = vi.fn().mockResolvedValueOnce(
        fakeResponse({
          retorno: {
            status: 'OK',
            pedidos: [{ pedido: { id: 55555, numero: PEDIDO_BASE.numero, situacao: 'aberto' } }],
          },
        }),
      )
      vi.stubGlobal('fetch', fetchSpy)

      const result = await criarOuLocalizarPedidoTiny(PEDIDO_BASE)

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.tinyPedidoId).toBe('55555')
        expect(result.jaExistia).toBe(true)
      }
      // Só a pesquisa deve ter sido chamada — inclusão é evitada (idempotência).
      expect(fetchSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('criarOuLocalizarPedidoTiny — mapeamento de endereço (enderecoSnap → cliente)', () => {
    // Extrai o objeto `pedido` enviado na chamada de inclusão (2ª chamada ao fetch).
    function pedidoEnviado(fetchSpy: ReturnType<typeof vi.fn>) {
      const body = String((fetchSpy.mock.calls[1][1] as { body: string }).body)
      const pedidoJson = new URLSearchParams(body).get('pedido')
      return JSON.parse(pedidoJson ?? '{}').pedido
    }

    function mockCriacaoOk() {
      return vi
        .fn()
        .mockResolvedValueOnce(fakeResponse({ retorno: { status: 'OK', pedidos: [] } }))
        .mockResolvedValueOnce(
          fakeResponse({ retorno: { status: 'OK', registros: [{ registro: { id: 1, numero: PEDIDO_BASE.numero } }] } }),
        )
    }

    it('inclui os campos de endereço no cliente quando enderecoSnap é válido', async () => {
      const fetchSpy = mockCriacaoOk()
      vi.stubGlobal('fetch', fetchSpy)

      const enderecoSnap = JSON.stringify({
        cep: '01310100', logradouro: 'Av Paulista', numero: '1000',
        complemento: 'Sala 5', bairro: 'Bela Vista', cidade: 'São Paulo', estado: 'SP',
      })
      await criarOuLocalizarPedidoTiny({ ...PEDIDO_BASE, enderecoSnap })

      const cliente = pedidoEnviado(fetchSpy).cliente
      expect(cliente.endereco).toBe('Av Paulista')
      expect(cliente.numero).toBe('1000')
      expect(cliente.complemento).toBe('Sala 5')
      expect(cliente.bairro).toBe('Bela Vista')
      expect(cliente.cep).toBe('01310100')
      expect(cliente.cidade).toBe('São Paulo')
      expect(cliente.uf).toBe('SP')
    })

    it('não adiciona campos de endereço quando enderecoSnap é null', async () => {
      const fetchSpy = mockCriacaoOk()
      vi.stubGlobal('fetch', fetchSpy)

      await criarOuLocalizarPedidoTiny({ ...PEDIDO_BASE, enderecoSnap: null })

      const cliente = pedidoEnviado(fetchSpy).cliente
      expect(cliente.endereco).toBeUndefined()
      expect(cliente.uf).toBeUndefined()
    })

    it('cria o pedido normalmente (sem endereço) quando enderecoSnap é JSON malformado', async () => {
      const fetchSpy = mockCriacaoOk()
      vi.stubGlobal('fetch', fetchSpy)

      const result = await criarOuLocalizarPedidoTiny({ ...PEDIDO_BASE, enderecoSnap: '{ nao é json' })

      expect(result.ok).toBe(true)
      const cliente = pedidoEnviado(fetchSpy).cliente
      expect(cliente.endereco).toBeUndefined()
    })
  })

  describe('localizarPedidoTiny', () => {
    it('retorna null quando o número não bate', async () => {
      const fetchSpy = vi.fn().mockResolvedValueOnce(
        fakeResponse({
          retorno: { status: 'OK', pedidos: [{ pedido: { id: 1, numero: 'OUTRO-NUMERO' } }] },
        }),
      )
      vi.stubGlobal('fetch', fetchSpy)

      expect(await localizarPedidoTiny(PEDIDO_BASE.numero)).toBeNull()
    })
  })

  describe('consultarPedidoTiny', () => {
    it('retorna a situação quando o Tiny responde OK', async () => {
      const fetchSpy = vi.fn().mockResolvedValueOnce(
        fakeResponse({
          retorno: { status: 'OK', registros: [{ registro: { id: 98765, status: 'enviado' } }] },
        }),
      )
      vi.stubGlobal('fetch', fetchSpy)

      const result = await consultarPedidoTiny('98765')

      expect(result.ok).toBe(true)
      expect(result.tinyStatus).toBe('enviado')
    })

    it('retorna TINY_DISABLED sem token', async () => {
      delete process.env.TINY_API_TOKEN
      const result = await consultarPedidoTiny('98765')
      expect(result.ok).toBe(false)
      expect(result.erro).toBe(TINY_DISABLED)
    })
  })
})
