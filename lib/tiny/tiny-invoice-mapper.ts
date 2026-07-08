import type { TinyInvoiceData } from './tiny-types'

function normalizeStatus(status: TinyInvoiceData['status']): string {
  return String(status ?? 'UNKNOWN').toUpperCase()
}

function parseInvoiceDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value

  const [datePart] = value.split(' ')
  const [dd, mm, yyyy] = datePart.split('/')
  if (dd && mm && yyyy) {
    const parsed = new Date(Number(yyyy), Number(mm) - 1, Number(dd))
    if (!Number.isNaN(parsed.getTime())) return parsed
  }

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function mapTinyInvoiceToOrderUpdate(invoice: TinyInvoiceData): {
  nfTinyId?: string
  nfNumero?: string
  nfSerie?: string
  nfChave?: string
  nfXmlUrl?: string
  nfUrl?: string
  nfStatus?: string
  nfErro?: string | null
  nfEmitidaEm?: Date | null
  tinySyncStatus?: string
  tinySyncAt: Date
} {
  const status = normalizeStatus(invoice.status)
  const now = new Date()

  if (status === 'REJECTED') {
    return {
      nfTinyId: invoice.tinyInvoiceId,
      nfNumero: invoice.number,
      nfSerie: invoice.series,
      nfChave: invoice.key,
      nfXmlUrl: invoice.xmlUrl,
      nfUrl: invoice.danfeUrl,
      nfStatus: 'REJECTED',
      nfErro: invoice.errorMessage ?? 'NF-e rejeitada no Tiny.',
      nfEmitidaEm: parseInvoiceDate(invoice.issuedAt),
      tinySyncStatus: 'INVOICE_REJECTED',
      tinySyncAt: now,
    }
  }

  if (status === 'CANCELLED') {
    return {
      nfTinyId: invoice.tinyInvoiceId,
      nfNumero: invoice.number,
      nfSerie: invoice.series,
      nfChave: invoice.key,
      nfXmlUrl: invoice.xmlUrl,
      nfUrl: invoice.danfeUrl,
      nfStatus: 'CANCELLED',
      nfErro: invoice.errorMessage ?? null,
      nfEmitidaEm: parseInvoiceDate(invoice.issuedAt),
      tinySyncStatus: 'INVOICE_CANCELLED',
      tinySyncAt: now,
    }
  }

  if (status === 'ISSUED' || status === 'AUTHORIZED') {
    return {
      nfTinyId: invoice.tinyInvoiceId,
      nfNumero: invoice.number,
      nfSerie: invoice.series,
      nfChave: invoice.key,
      nfXmlUrl: invoice.xmlUrl,
      nfUrl: invoice.danfeUrl,
      nfStatus: 'ISSUED',
      nfErro: null,
      nfEmitidaEm: parseInvoiceDate(invoice.issuedAt),
      tinySyncStatus: 'INVOICE_ISSUED',
      tinySyncAt: now,
    }
  }

  return {
    nfTinyId: invoice.tinyInvoiceId,
    nfNumero: invoice.number,
    nfSerie: invoice.series,
    nfChave: invoice.key,
    nfXmlUrl: invoice.xmlUrl,
    nfUrl: invoice.danfeUrl,
    nfStatus: 'PROCESSING',
    nfErro: invoice.errorMessage ?? null,
    nfEmitidaEm: parseInvoiceDate(invoice.issuedAt),
    tinySyncStatus: 'INVOICE_PENDING',
    tinySyncAt: now,
  }
}
