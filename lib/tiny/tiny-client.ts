import type {
  TinyCreateOrderPayload,
  TinyCreateOrderResponse,
  TinyGetInvoiceResponse,
  TinyInvoiceData,
  TinyInvoiceStatus,
  TinySearchInvoicesParams,
  TinySearchInvoicesResponse,
} from './tiny-types'

const DEFAULT_TINY_API_BASE = 'https://api.tiny.com.br/api2'
const TINY_REQUEST_TIMEOUT_MS = 15000

type TinyRetorno = {
  retorno?: {
    status?: 'OK' | 'Erro'
    codigo_erro?: string | number
    erros?: Array<{ erro?: string }>
    registros?: Array<{
      registro?: {
        id?: string | number
        numero?: string | number
            erros?: Array<{ erro?: string }>
          }
        }>
    notas_fiscais?: Array<{ nota_fiscal?: Record<string, unknown> }>
    nota_fiscal?: Record<string, unknown>
    link_nfe?: string
    xml_nfe?: string
    xml_cancelamento?: string
  }
}

export class TinyApiError extends Error {
  code?: string
  statusCode?: number
  raw?: unknown

  constructor(message: string, options: { code?: string; statusCode?: number; raw?: unknown } = {}) {
    super(message)
    this.name = 'TinyApiError'
    this.code = options.code
    this.statusCode = options.statusCode
    this.raw = options.raw
  }
}

function tinyApiBase(): string {
  return (process.env.TINY_API_BASE_URL || DEFAULT_TINY_API_BASE).replace(/\/+$/, '')
}

function extractTinyErrors(retorno?: TinyRetorno['retorno']): string {
  if (!retorno) return 'Resposta vazia do Tiny.'

  const topLevel = (retorno.erros ?? []).map((item) => item.erro).filter(Boolean)
  const recordLevel = (retorno.registros ?? [])
    .flatMap((item) => item.registro?.erros ?? [])
    .map((item) => item.erro)
    .filter(Boolean)
  const errors = [...topLevel, ...recordLevel]
  return errors.length > 0 ? errors.join('; ') : 'Erro nao especificado pelo Tiny.'
}

export function sanitizeTinyPayload<T>(value: T): T {
  if (Array.isArray(value)) return value.map((item) => sanitizeTinyPayload(item)) as T
  if (!value || typeof value !== 'object') return value

  const output: Record<string, unknown> = {}
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    output[key] = key.toLowerCase() === 'token' ? '[redacted]' : sanitizeTinyPayload(item)
  }
  return output as T
}

function parseRaw(raw: string): unknown {
  try {
    return JSON.parse(raw)
  } catch {
    return raw
  }
}

function pickString(obj: Record<string, unknown> | undefined, keys: string[]): string | undefined {
  if (!obj) return undefined
  for (const key of keys) {
    const value = obj[key]
    if (value != null && String(value).trim() !== '') return String(value)
  }
  return undefined
}

function normalizeInvoiceStatus(value?: string): TinyInvoiceStatus {
  const text = String(value ?? '').toLowerCase()
  if (!text) return 'UNKNOWN'
  if (text.includes('cancel')) return 'CANCELLED'
  if (text.includes('rejeit') || text.includes('deneg')) return 'REJECTED'
  if (text.includes('autor') || text.includes('emit')) return 'ISSUED'
  if (text.includes('process') || text.includes('pend')) return 'PROCESSING'
  return 'UNKNOWN'
}

function normalizeInvoice(rawInvoice: Record<string, unknown> | undefined): TinyInvoiceData | null {
  const tinyInvoiceId = pickString(rawInvoice, ['id'])
  if (!tinyInvoiceId) return null

  const statusText = pickString(rawInvoice, ['descricao_situacao', 'descricaoSituacao', 'situacao', 'status'])
  const errorMessage = pickString(rawInvoice, [
    'mensagem_erro',
    'mensagemErro',
    'motivo_status',
    'motivoStatus',
    'descricao_rejeicao',
    'descricaoRejeicao',
  ])

  return {
    tinyInvoiceId,
    number: pickString(rawInvoice, ['numero']),
    series: pickString(rawInvoice, ['serie', 'série']),
    key: pickString(rawInvoice, ['chave_acesso', 'chaveAcesso', 'chave']),
    status: normalizeInvoiceStatus(statusText),
    danfeUrl: pickString(rawInvoice, ['link_nfe', 'linkDanfe', 'danfeUrl']),
    xmlUrl: pickString(rawInvoice, ['link_xml', 'xmlUrl']),
    issuedAt: pickString(rawInvoice, ['data_emissao', 'dataEmissao']),
    errorMessage: errorMessage ?? null,
    raw: rawInvoice,
  }
}

async function tinyRequest(recurso: string, params: Record<string, string>): Promise<{ body: TinyRetorno; raw: unknown }> {
  const token = process.env.TINY_API_TOKEN
  if (!token) {
    throw new TinyApiError('TINY_API_TOKEN nao configurado.', { code: 'TINY_DISABLED' })
  }

  const form = new URLSearchParams({ token, formato: 'JSON', ...params })
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TINY_REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(`${tinyApiBase()}/${recurso}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
      signal: controller.signal,
    })
    const text = await response.text()
    const raw = parseRaw(text)

    if (!response.ok) {
      throw new TinyApiError(`Falha HTTP ${response.status} ao chamar o Tiny.`, {
        statusCode: response.status,
        raw,
      })
    }

    return { body: raw as TinyRetorno, raw }
  } catch (error) {
    if (error instanceof TinyApiError) throw error
    if (error instanceof Error && error.name === 'AbortError') {
      throw new TinyApiError('Tempo limite excedido ao chamar o Tiny.')
    }
    throw new TinyApiError(error instanceof Error ? error.message : String(error))
  } finally {
    clearTimeout(timeout)
  }
}

function normalizeCreateOrderResponse(rawBody: TinyRetorno, raw: unknown): TinyCreateOrderResponse {
  const retorno = rawBody.retorno
  if (retorno?.status !== 'OK') {
    throw new TinyApiError(extractTinyErrors(retorno), {
      code: retorno?.codigo_erro != null ? String(retorno.codigo_erro) : undefined,
      raw,
    })
  }

  const registro = retorno.registros?.[0]?.registro
  const id = registro?.id
  if (id == null) {
    throw new TinyApiError('Tiny retornou OK sem id de pedido.', { raw })
  }

  return {
    success: true,
    tinyOrderId: String(id),
    tinyOrderNumber: registro?.numero != null ? String(registro.numero) : undefined,
    raw,
    message: 'Pedido enviado para o Tiny com sucesso.',
  }
}

export class TinyClient {
  async createOrder(payload: TinyCreateOrderPayload): Promise<TinyCreateOrderResponse> {
    const { body, raw } = await tinyRequest('pedido.incluir.php', {
      pedido: JSON.stringify(payload),
    })
    return normalizeCreateOrderResponse(body, raw)
  }

  async searchInvoices(params: TinySearchInvoicesParams): Promise<TinySearchInvoicesResponse> {
    const attempts: Array<Record<string, string>> = []
    const baseParams: Record<string, string> = { tipoNota: 'S', pagina: '1' }
    if (params.dateFrom) baseParams.dataInicial = params.dateFrom
    if (params.dateTo) baseParams.dataFinal = params.dateTo

    if (params.ecommerceOrderNumber) attempts.push({ ...baseParams, numeroEcommerce: params.ecommerceOrderNumber })
    if (params.tinyOrderNumber) attempts.push({ ...baseParams, pesquisa: params.tinyOrderNumber })
    if (params.tinyOrderId) attempts.push({ ...baseParams, pesquisa: params.tinyOrderId })
    if (params.orderId && params.orderId !== params.ecommerceOrderNumber) attempts.push({ ...baseParams, numeroEcommerce: params.orderId })
    if (attempts.length === 0) attempts.push(baseParams)

    const invoices = new Map<string, TinyInvoiceData>()
    const rawResponses: unknown[] = []

    for (const attempt of attempts) {
      const { body, raw } = await tinyRequest('notas.fiscais.pesquisa.php', attempt)
      rawResponses.push(raw)
      const retorno = body.retorno
      if (retorno?.status !== 'OK') {
        throw new TinyApiError(extractTinyErrors(retorno), {
          code: retorno?.codigo_erro != null ? String(retorno.codigo_erro) : undefined,
          raw,
        })
      }

      for (const item of retorno.notas_fiscais ?? []) {
        const invoice = normalizeInvoice(item.nota_fiscal)
        if (invoice?.tinyInvoiceId) invoices.set(invoice.tinyInvoiceId, invoice)
      }
    }

    return {
      success: true,
      invoices: [...invoices.values()],
      raw: rawResponses,
      message: invoices.size > 0 ? 'NF-e encontrada no Tiny.' : 'NF-e ainda não encontrada no Tiny.',
    }
  }

  async getInvoice(invoiceId: string): Promise<TinyGetInvoiceResponse> {
    const { body, raw } = await tinyRequest('nota.fiscal.obter.php', { id: invoiceId })
    const retorno = body.retorno
    if (retorno?.status !== 'OK') {
      throw new TinyApiError(extractTinyErrors(retorno), {
        code: retorno?.codigo_erro != null ? String(retorno.codigo_erro) : undefined,
        raw,
      })
    }

    const invoice = normalizeInvoice(retorno.nota_fiscal)
    const danfe: { success: boolean; link?: string; raw: unknown } = await this.getInvoiceDanfeLink(invoiceId).catch((error: unknown) => ({
      success: false,
      raw: error instanceof TinyApiError ? error.raw : undefined,
    }))
    const xml: { success: boolean; xml?: string; raw: unknown } = await this.getInvoiceXml(invoiceId).catch((error: unknown) => ({
      success: false,
      raw: error instanceof TinyApiError ? error.raw : undefined,
    }))

    return {
      success: true,
      invoice: invoice
        ? {
            ...invoice,
            danfeUrl: danfe.success ? danfe.link : invoice.danfeUrl,
            xmlUrl: xml.success && xml.xml ? 'XML_AVAILABLE' : invoice.xmlUrl,
            raw: { detail: invoice.raw, danfe: danfe.raw, xmlAvailable: Boolean(xml.success && xml.xml) },
          }
        : undefined,
      raw,
    }
  }

  async getInvoiceDanfeLink(invoiceId: string): Promise<{ success: boolean; link?: string; raw: unknown }> {
    const { body, raw } = await tinyRequest('nota.fiscal.obter.link.php', { id: invoiceId })
    const retorno = body.retorno
    if (retorno?.status !== 'OK') {
      throw new TinyApiError(extractTinyErrors(retorno), {
        code: retorno?.codigo_erro != null ? String(retorno.codigo_erro) : undefined,
        raw,
      })
    }
    return { success: true, link: retorno.link_nfe, raw }
  }

  async getInvoiceXml(invoiceId: string): Promise<{ success: boolean; xml?: string; raw: unknown }> {
    const { body, raw } = await tinyRequest('nota.fiscal.obter.xml.php', { id: invoiceId })
    const retorno = body.retorno
    if (retorno?.status !== 'OK') {
      throw new TinyApiError(extractTinyErrors(retorno), {
        code: retorno?.codigo_erro != null ? String(retorno.codigo_erro) : undefined,
        raw,
      })
    }
    return { success: true, xml: retorno.xml_nfe ?? retorno.xml_cancelamento, raw }
  }
}

export const tinyClient = new TinyClient()
