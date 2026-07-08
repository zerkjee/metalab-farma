import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TinyClient } from '@/lib/tiny/tiny-client'
import { mapTinyInvoiceToOrderUpdate } from '@/lib/tiny/tiny-invoice-mapper'

function fakeResponse(jsonBody: unknown, httpOk = true, status = 200) {
  return {
    ok: httpOk,
    status,
    text: async () => JSON.stringify(jsonBody),
  } as unknown as Response
}

describe('Tiny Fase 3 — mapper de NF-e', () => {
  it('mapeia nota emitida/autorizada para INVOICE_ISSUED', () => {
    const update = mapTinyInvoiceToOrderUpdate({
      tinyInvoiceId: 'nf-1',
      number: '000123',
      series: '1',
      key: '31260700000000000000000000000000000000000000',
      status: 'ISSUED',
      danfeUrl: 'https://tiny/danfe',
      xmlUrl: '/api/admin/tiny/invoices/xml?orderId=order-1',
      issuedAt: '07/07/2026',
    })

    expect(update).toMatchObject({
      nfTinyId: 'nf-1',
      nfNumero: '000123',
      nfSerie: '1',
      nfStatus: 'ISSUED',
      tinySyncStatus: 'INVOICE_ISSUED',
      nfErro: null,
    })
    expect(update.nfEmitidaEm).toBeInstanceOf(Date)
  })

  it('mapeia nota rejeitada com mensagem fiscal', () => {
    const update = mapTinyInvoiceToOrderUpdate({
      tinyInvoiceId: 'nf-2',
      status: 'REJECTED',
      errorMessage: 'CFOP inválido',
    })

    expect(update.nfStatus).toBe('REJECTED')
    expect(update.tinySyncStatus).toBe('INVOICE_REJECTED')
    expect(update.nfErro).toBe('CFOP inválido')
  })

  it('mapeia nota cancelada', () => {
    const update = mapTinyInvoiceToOrderUpdate({ tinyInvoiceId: 'nf-3', status: 'CANCELLED' })

    expect(update.nfStatus).toBe('CANCELLED')
    expect(update.tinySyncStatus).toBe('INVOICE_CANCELLED')
  })
})

describe('TinyClient — notas fiscais', () => {
  beforeEach(() => {
    process.env.TINY_API_TOKEN = 'token-secreto'
    vi.restoreAllMocks()
  })

  afterEach(() => {
    delete process.env.TINY_API_TOKEN
    vi.unstubAllGlobals()
  })

  it('searchInvoices busca por numero ecommerce e normaliza resultado', async () => {
    const fetchSpy = vi.fn().mockResolvedValueOnce(fakeResponse({
      retorno: {
        status: 'OK',
        notas_fiscais: [
          {
            nota_fiscal: {
              id: 123,
              numero: '000123',
              serie: '1',
              chave_acesso: 'chave-123',
              descricao_situacao: 'Autorizada',
              data_emissao: '07/07/2026',
            },
          },
        ],
      },
    }))
    vi.stubGlobal('fetch', fetchSpy)

    const result = await new TinyClient().searchInvoices({ ecommerceOrderNumber: 'MTL-2026-ABC123' })

    expect(result.success).toBe(true)
    expect(result.invoices[0]).toMatchObject({
      tinyInvoiceId: '123',
      number: '000123',
      series: '1',
      key: 'chave-123',
      status: 'ISSUED',
    })
    const body = new URLSearchParams(String(fetchSpy.mock.calls[0]?.[1]?.body))
    expect(body.get('token')).toBe('token-secreto')
    expect(body.get('numeroEcommerce')).toBe('MTL-2026-ABC123')
  })

  it('getInvoice agrega detalhe, link DANFE e disponibilidade de XML', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(fakeResponse({
        retorno: {
          status: 'OK',
          nota_fiscal: {
            id: 123,
            numero: '000123',
            serie: '1',
            chave_acesso: 'chave-123',
            descricao_situacao: 'Autorizada',
          },
        },
      }))
      .mockResolvedValueOnce(fakeResponse({ retorno: { status: 'OK', link_nfe: 'https://tiny/danfe.pdf' } }))
      .mockResolvedValueOnce(fakeResponse({ retorno: { status: 'OK', xml_nfe: '<xml />' } })))

    const result = await new TinyClient().getInvoice('123')

    expect(result.success).toBe(true)
    expect(result.invoice).toMatchObject({
      tinyInvoiceId: '123',
      danfeUrl: 'https://tiny/danfe.pdf',
      xmlUrl: 'XML_AVAILABLE',
    })
  })

  it('searchInvoices lança erro de negócio do Tiny', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(fakeResponse({
      retorno: { status: 'Erro', codigo_erro: 31, erros: [{ erro: 'Consulta inválida' }] },
    })))

    await expect(new TinyClient().searchInvoices({ ecommerceOrderNumber: 'MTL-1' })).rejects.toMatchObject({
      name: 'TinyApiError',
      code: '31',
      message: 'Consulta inválida',
    })
  })
})
