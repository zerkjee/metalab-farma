import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import type { Prisma } from '@prisma/client'
import {
  testarConexaoTiny,
  tinyConfigurado,
} from '@/lib/tiny'
import { TinyApiError, sanitizeTinyPayload, tinyClient } from '@/lib/tiny/tiny-client'
import { mapTinyInvoiceToOrderUpdate } from '@/lib/tiny/tiny-invoice-mapper'
import { mapOrderToTinyPayload } from '@/lib/tiny/tiny-mapper'
import { validateOrderBeforeTiny } from '@/lib/tiny/tiny-validation'
import type { SendOrderToTinyResult, SyncTinyInvoiceResult, TinyInvoiceData } from '@/lib/tiny/tiny-types'

interface TinyActor {
  adminId: string
  adminEmail: string
  ip?: string | null
}

const SYSTEM_ACTOR: TinyActor = { adminId: 'system', adminEmail: 'tiny-service@sistema' }
type TinyAuditParams = Omit<Parameters<typeof logAudit>[0], 'adminId' | 'adminEmail' | 'ip'>

export interface TinySendResult {
  success: boolean
  status: 'SENT' | 'VALIDATION_ERROR' | 'ALREADY_SENT' | 'TINY_DISABLED' | 'TINY_ERROR' | 'NOT_FOUND' | 'NOT_ELIGIBLE'
  tinyPedidoId?: string
  tinyNumero?: string
  errors: string[]
  warnings: string[]
}

async function loadPedidoForTiny(orderId: string) {
  return prisma.pedido.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      numero: true,
      status: true,
      pago: true,
      compradorNome: true,
      compradorCpf: true,
      compradorEmail: true,
      compradorTelefone: true,
      enderecoSnap: true,
      metodoPagamento: true,
      subtotal: true,
      desconto: true,
      frete: true,
      total: true,
      criadoEm: true,
      tinyPedidoId: true,
      tinyNumero: true,
      tinySyncStatus: true,
      tinyErro: true,
      nfTinyId: true,
      nfNumero: true,
      nfSerie: true,
      nfChave: true,
      nfUrl: true,
      nfXmlUrl: true,
      nfStatus: true,
      nfErro: true,
      nfEmitidaEm: true,
      itens: {
        select: {
          produtoSku: true,
          produtoNome: true,
          quantidade: true,
          precoUnit: true,
          produto: { select: { ean: true, pesoGramas: true } },
        },
      },
    },
  })
}

async function audit(actor: TinyActor | undefined, params: TinyAuditParams) {
  await logAudit({
    ...(actor ?? SYSTEM_ACTOR),
    ...params,
  })
}

function toJsonValue(value: unknown): Prisma.InputJsonValue | undefined {
  if (value === undefined) return undefined
  return JSON.parse(JSON.stringify(sanitizeTinyPayload(value))) as Prisma.InputJsonValue
}

async function logTinyIntegration(params: {
  orderId?: string
  action: string
  status: string
  requestPayload?: unknown
  responsePayload?: unknown
  errorMessage?: string
}) {
  await prisma.tinyIntegrationLog.create({
    data: {
      orderId: params.orderId,
      action: params.action,
      status: params.status,
      requestPayload: toJsonValue(params.requestPayload),
      responsePayload: toJsonValue(params.responsePayload),
      errorMessage: params.errorMessage,
    },
  })
}

export async function testTinyConnection(actor?: TinyActor) {
  const result = await testarConexaoTiny()
  await audit(actor, {
    acao: result.ok ? 'tiny.conexao.ok' : 'tiny.conexao.erro',
    recurso: 'Tiny',
    detalhe: { ok: result.ok, message: result.message },
  })
  return result
}

export async function sendOrderToTiny(orderId: string, actor?: TinyActor): Promise<SendOrderToTinyResult> {
  const pedido = await loadPedidoForTiny(orderId)
  if (!pedido) {
    return {
      success: false,
      status: 'NOT_FOUND',
      errors: ['Pedido não encontrado.'],
      warnings: [],
      message: 'Pedido não encontrado.',
    }
  }

  const validation = validateOrderBeforeTiny(pedido)
  if (!validation.valid) {
    const alreadySent = Boolean(pedido.tinyPedidoId) || pedido.tinySyncStatus === 'TINY_ORDER_CREATED'
    if (!alreadySent) {
      await prisma.pedido.update({
        where: { id: pedido.id },
        data: { tinySyncStatus: 'VALIDATION_ERROR', tinySyncAt: new Date(), tinyErro: validation.errors.join(' ') },
      })
    }
    await logTinyIntegration({
      orderId: pedido.id,
      action: 'CREATE_ORDER_VALIDATION_ERROR',
      status: alreadySent ? 'ALREADY_SENT' : 'VALIDATION_ERROR',
      requestPayload: { orderId: pedido.id },
      errorMessage: validation.errors.join(' '),
    })
    await audit(actor, {
      acao: 'tiny.pedido.validacao_erro',
      recurso: 'Pedido',
      recursoId: pedido.id,
      detalhe: { numero: pedido.numero, errors: validation.errors, warnings: validation.warnings },
    })
    return {
      success: false,
      status: alreadySent ? 'ALREADY_SENT' : 'VALIDATION_ERROR',
      errors: validation.errors,
      warnings: validation.warnings,
      message: alreadySent ? 'Pedido já enviado para o Tiny.' : 'Pedido não pode ser enviado para o Tiny.',
    }
  }

  if (!tinyConfigurado()) {
    return {
      success: false,
      status: 'TINY_DISABLED',
      errors: ['TINY_API_TOKEN não configurado.'],
      warnings: validation.warnings,
      message: 'TINY_API_TOKEN não configurado.',
    }
  }

  const lock = await prisma.pedido.updateMany({
    where: {
      id: pedido.id,
      pago: true,
      tinyPedidoId: null,
      tinySyncStatus: { in: ['PENDENTE', 'ERRO', 'NOT_SENT_TO_TINY', 'VALIDATION_ERROR', 'SYNC_ERROR'] },
    },
    data: { tinySyncStatus: 'SENDING_TO_TINY', tinySyncAt: new Date(), tinyErro: null },
  })
  if (lock.count === 0) {
    return {
      success: false,
      status: 'NOT_ELIGIBLE',
      errors: ['Pedido não está elegível para envio ao Tiny.'],
      warnings: validation.warnings,
      message: 'Pedido não está elegível para envio ao Tiny.',
    }
  }

  const payload = mapOrderToTinyPayload(pedido)
  await logTinyIntegration({
    orderId: pedido.id,
    action: 'CREATE_ORDER_REQUEST',
    status: 'SENDING_TO_TINY',
    requestPayload: payload,
  })

  try {
    const response = await tinyClient.createOrder(payload)
    await logTinyIntegration({
      orderId: pedido.id,
      action: 'CREATE_ORDER_RESPONSE',
      status: 'TINY_ORDER_CREATED',
      requestPayload: payload,
      responsePayload: response.raw,
    })
    await prisma.pedido.update({
      where: { id: pedido.id },
      data: {
        tinyPedidoId: response.tinyOrderId,
        tinyNumero: response.tinyOrderNumber ?? pedido.tinyNumero,
        tinySyncStatus: 'TINY_ORDER_CREATED',
        tinySyncAt: new Date(),
        tinyErro: null,
        tinyPayload: JSON.stringify(sanitizeTinyPayload(response.raw)),
      },
    })
    await audit(actor, {
      acao: 'tiny.pedido.sincronizado',
      recurso: 'Pedido',
      recursoId: pedido.id,
      detalhe: { numero: pedido.numero, tinyPedidoId: response.tinyOrderId, tinyNumero: response.tinyOrderNumber },
    })
    return {
      success: true,
      status: 'TINY_ORDER_CREATED',
      tinyOrderId: response.tinyOrderId,
      tinyOrderNumber: response.tinyOrderNumber,
      tinyPedidoId: response.tinyOrderId,
      tinyNumero: response.tinyOrderNumber,
      errors: [],
      warnings: validation.warnings,
      message: 'Pedido enviado para o Tiny com sucesso.',
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    const raw = error instanceof TinyApiError ? error.raw : undefined

    await logTinyIntegration({
      orderId: pedido.id,
      action: 'CREATE_ORDER_ERROR',
      status: 'SYNC_ERROR',
      requestPayload: payload,
      responsePayload: raw,
      errorMessage: message,
    })
    await prisma.pedido.update({
      where: { id: pedido.id },
      data: {
        tinySyncStatus: 'SYNC_ERROR',
        tinySyncAt: new Date(),
        tinyErro: message,
        tinyPayload: raw === undefined ? null : JSON.stringify(sanitizeTinyPayload(raw)),
      },
    })
    await audit(actor, {
      acao: 'tiny.pedido.erro',
      recurso: 'Pedido',
      recursoId: pedido.id,
      detalhe: { numero: pedido.numero, erro: message, codigoErro: error instanceof TinyApiError ? error.code : undefined },
    })

    return {
      success: false,
      status: 'SYNC_ERROR',
      errors: [message],
      warnings: validation.warnings,
      message,
    }
  }
}

function invoiceResultStatus(tinySyncStatus?: string): SyncTinyInvoiceResult['status'] {
  if (tinySyncStatus === 'INVOICE_REJECTED') return 'INVOICE_REJECTED'
  if (tinySyncStatus === 'INVOICE_CANCELLED') return 'INVOICE_CANCELLED'
  if (tinySyncStatus === 'INVOICE_ISSUED' || tinySyncStatus === 'INVOICE_FOUND') return 'INVOICE_ISSUED'
  return 'INVOICE_PENDING'
}

function invoiceResultMessage(status: SyncTinyInvoiceResult['status']): string {
  if (status === 'INVOICE_REJECTED') return 'NF-e sincronizada com status rejeitada.'
  if (status === 'INVOICE_CANCELLED') return 'NF-e sincronizada com status cancelada.'
  if (status === 'INVOICE_PENDING') return 'NF-e encontrada, mas ainda não está emitida/autorizada.'
  return 'NF-e sincronizada com sucesso.'
}

function mergeInvoice(searchInvoice: TinyInvoiceData, detailInvoice?: TinyInvoiceData): TinyInvoiceData {
  return {
    ...searchInvoice,
    ...Object.fromEntries(Object.entries(detailInvoice ?? {}).filter(([, value]) => value != null && String(value).trim() !== '')),
    raw: {
      search: searchInvoice.raw,
      detail: detailInvoice?.raw,
    },
  }
}

export async function syncInvoiceFromTiny(orderId: string, actor?: TinyActor): Promise<SyncTinyInvoiceResult> {
  const pedido = await loadPedidoForTiny(orderId)
  if (!pedido) {
    return { success: false, status: 'NOT_FOUND', message: 'Pedido não encontrado.' }
  }

  if (!pedido.tinyPedidoId && !pedido.tinyNumero) {
    return { success: false, status: 'NOT_SENT_TO_TINY', message: 'Este pedido ainda não foi enviado ao Tiny.' }
  }

  if (!tinyConfigurado()) {
    return { success: false, status: 'TINY_DISABLED', message: 'TINY_API_TOKEN não configurado.' }
  }

  const requestPayload = {
    orderId: pedido.id,
    tinyOrderId: pedido.tinyPedidoId,
    tinyOrderNumber: pedido.tinyNumero,
    ecommerceOrderNumber: pedido.numero,
  }
  const searchParams = {
    orderId: pedido.id,
    tinyOrderId: pedido.tinyPedidoId ?? undefined,
    tinyOrderNumber: pedido.tinyNumero ?? undefined,
    ecommerceOrderNumber: pedido.numero,
  }

  await logTinyIntegration({
    orderId: pedido.id,
    action: 'SYNC_INVOICE_REQUEST',
    status: 'PROCESSING',
    requestPayload,
  })

  try {
    const search = await tinyClient.searchInvoices(searchParams)
    if (search.invoices.length === 0) {
      await prisma.pedido.update({
        where: { id: pedido.id },
        data: {
          tinySyncStatus: 'INVOICE_PENDING',
          tinySyncAt: new Date(),
          tinyErro: null,
          nfStatus: 'NOT_FOUND',
        },
      })
      await logTinyIntegration({
        orderId: pedido.id,
        action: 'SYNC_INVOICE_NOT_FOUND',
        status: 'INVOICE_NOT_FOUND',
        requestPayload,
        responsePayload: search.raw,
      })
      await audit(actor, {
        acao: 'tiny.nf.nao_encontrada',
        recurso: 'Pedido',
        recursoId: pedido.id,
        detalhe: { numero: pedido.numero, tinyPedidoId: pedido.tinyPedidoId, tinyNumero: pedido.tinyNumero },
      })
      return {
        success: false,
        status: 'INVOICE_NOT_FOUND',
        message: 'NF-e ainda não encontrada no Tiny. Verifique se a nota já foi emitida.',
      }
    }

    const searchInvoice =
      search.invoices.find((invoice) => ['ISSUED', 'AUTHORIZED'].includes(String(invoice.status))) ??
      search.invoices[0]
    const detail = searchInvoice?.tinyInvoiceId ? await tinyClient.getInvoice(searchInvoice.tinyInvoiceId) : undefined
    const invoice = mergeInvoice(searchInvoice, detail?.invoice)
    const xmlUrl = invoice.xmlUrl === 'XML_AVAILABLE'
      ? `/api/admin/tiny/invoices/xml?orderId=${encodeURIComponent(pedido.id)}`
      : invoice.xmlUrl
    const update = mapTinyInvoiceToOrderUpdate({ ...invoice, xmlUrl })
    const resultStatus = invoiceResultStatus(update.tinySyncStatus)

    await prisma.pedido.update({
      where: { id: pedido.id },
      data: {
        nfTinyId: update.nfTinyId ?? null,
        nfNumero: update.nfNumero ?? null,
        nfSerie: update.nfSerie ?? null,
        nfChave: update.nfChave ?? null,
        nfUrl: update.nfUrl ?? null,
        nfXmlUrl: update.nfXmlUrl ?? null,
        nfStatus: update.nfStatus ?? null,
        nfErro: update.nfErro ?? null,
        nfEmitidaEm: update.nfEmitidaEm ?? null,
        tinySyncStatus: update.tinySyncStatus as Prisma.EnumTinySyncStatusFieldUpdateOperationsInput['set'],
        tinySyncAt: update.tinySyncAt,
        tinyErro: null,
        tinyPayload: JSON.stringify(sanitizeTinyPayload({
          action: 'syncInvoiceFromTiny',
          requestPayload,
          searchRaw: search.raw,
          invoiceRaw: invoice.raw,
        })),
      },
    })
    await logTinyIntegration({
      orderId: pedido.id,
      action: 'SYNC_INVOICE_RESPONSE',
      status: resultStatus,
      requestPayload,
      responsePayload: invoice.raw,
    })
    await audit(actor, {
      acao: 'tiny.nf.sincronizada',
      recurso: 'Pedido',
      recursoId: pedido.id,
      detalhe: { numero: pedido.numero, tinyInvoiceId: invoice.tinyInvoiceId, nfNumero: invoice.number, nfStatus: update.nfStatus },
    })

    return {
      success: true,
      status: resultStatus,
      message: invoiceResultMessage(resultStatus),
      invoice: {
        tinyInvoiceId: invoice.tinyInvoiceId,
        number: invoice.number,
        series: invoice.series,
        key: invoice.key,
        danfeUrl: invoice.danfeUrl,
        xmlUrl,
        issuedAt: update.nfEmitidaEm,
      },
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    const raw = error instanceof TinyApiError ? error.raw : undefined
    await prisma.pedido.update({
      where: { id: pedido.id },
      data: {
        tinySyncStatus: 'SYNC_ERROR',
        tinySyncAt: new Date(),
        tinyErro: message,
        tinyPayload: raw === undefined ? null : JSON.stringify(sanitizeTinyPayload(raw)),
      },
    })
    await logTinyIntegration({
      orderId: pedido.id,
      action: 'SYNC_INVOICE_ERROR',
      status: 'SYNC_ERROR',
      requestPayload,
      responsePayload: raw,
      errorMessage: message,
    })
    await audit(actor, {
      acao: 'tiny.nf.erro',
      recurso: 'Pedido',
      recursoId: pedido.id,
      detalhe: { numero: pedido.numero, erro: message, codigoErro: error instanceof TinyApiError ? error.code : undefined },
    })
    return { success: false, status: 'SYNC_ERROR', message, errors: [message] }
  }
}

export async function getInvoiceXmlForOrder(orderId: string): Promise<{ ok: true; xml: string; filename: string } | { ok: false; message: string }> {
  const pedido = await loadPedidoForTiny(orderId)
  if (!pedido) return { ok: false, message: 'Pedido não encontrado.' }
  if (!pedido.tinyPedidoId && !pedido.tinyNumero) return { ok: false, message: 'Pedido ainda não foi enviado ao Tiny.' }
  if (pedido.nfTinyId) {
    const xml = await tinyClient.getInvoiceXml(pedido.nfTinyId).catch((error: unknown) => ({
      success: false,
      xml: undefined,
      raw: error instanceof TinyApiError ? error.raw : undefined,
    }))
    if (xml.success && xml.xml) return { ok: true, xml: xml.xml, filename: `nfe-${pedido.numero}.xml` }
  }

  const search = await tinyClient.searchInvoices({
    orderId: pedido.id,
    tinyOrderId: pedido.tinyPedidoId ?? undefined,
    tinyOrderNumber: pedido.tinyNumero ?? undefined,
    ecommerceOrderNumber: pedido.numero,
  }).catch(() => ({ success: false, invoices: [], raw: null }))
  const invoiceId = search.invoices[0]?.tinyInvoiceId
  if (!invoiceId) return { ok: false, message: 'NF-e não encontrada no Tiny.' }

  const xml = await tinyClient.getInvoiceXml(invoiceId).catch((error: unknown) => ({
    success: false,
    xml: undefined,
    raw: error instanceof TinyApiError ? error.raw : undefined,
  }))
  if (!xml.success || !xml.xml) return { ok: false, message: 'XML não disponível no Tiny.' }

  return { ok: true, xml: xml.xml, filename: `nfe-${pedido.numero}.xml` }
}
