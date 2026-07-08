export type TinyPersonType = 'F' | 'J'

export type TinyCreateOrderPayload = {
  pedido: {
    numero?: string
    numero_ecommerce?: string
    numero_pedido_ecommerce?: string
    data_pedido?: string
    data_prevista?: string
    cliente: {
      nome: string
      tipo_pessoa?: TinyPersonType
      cpf_cnpj: string
      endereco: string
      numero: string
      complemento?: string
      bairro: string
      cep: string
      cidade: string
      uf: string
      fone?: string
      email: string
    }
    itens: Array<{
      item: {
        codigo: string
        descricao: string
        unidade?: string
        quantidade: number
        valor_unitario: number
      }
    }>
    parcelas?: Array<{
      parcela: {
        dias?: number
        data?: string
        valor: number
        forma_pagamento?: string
        meio_pagamento?: string
      }
    }>
    forma_envio?: string
    frete_por_conta?: string
    valor_frete?: number
    valor_desconto?: number
    obs?: string
    obs_interna?: string
  }
}

export type TinyCreateOrderResponse = {
  success: boolean
  tinyOrderId?: string
  tinyOrderNumber?: string
  raw: unknown
  message?: string
}

export type TinySearchInvoicesParams = {
  orderId?: string
  tinyOrderId?: string
  tinyOrderNumber?: string
  ecommerceOrderNumber?: string
  dateFrom?: string
  dateTo?: string
}

export type TinyInvoiceStatus =
  | 'PENDING'
  | 'AUTHORIZED'
  | 'ISSUED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'PROCESSING'
  | 'UNKNOWN'

export type TinyInvoiceData = {
  tinyInvoiceId?: string
  number?: string
  series?: string
  key?: string
  status?: TinyInvoiceStatus | string
  xmlUrl?: string
  danfeUrl?: string
  issuedAt?: string | Date | null
  errorMessage?: string | null
  raw?: unknown
}

export type TinySearchInvoicesResponse = {
  success: boolean
  invoices: TinyInvoiceData[]
  raw: unknown
  message?: string
}

export type TinyGetInvoiceResponse = {
  success: boolean
  invoice?: TinyInvoiceData
  raw: unknown
  message?: string
}

export type SyncTinyInvoiceResult = {
  success: boolean
  status:
    | 'NOT_FOUND'
    | 'NOT_SENT_TO_TINY'
    | 'INVOICE_ISSUED'
    | 'INVOICE_PENDING'
    | 'INVOICE_NOT_FOUND'
    | 'INVOICE_REJECTED'
    | 'INVOICE_CANCELLED'
    | 'SYNC_ERROR'
    | 'TINY_DISABLED'
  message: string
  invoice?: {
    tinyInvoiceId?: string
    number?: string
    series?: string
    key?: string
    danfeUrl?: string
    xmlUrl?: string
    issuedAt?: string | Date | null
  }
  errors?: string[]
}

export type TinyValidationResult = {
  valid: boolean
  errors: string[]
  warnings: string[]
}

export type TinyAddressSnapshot = {
  cep?: string | null
  logradouro?: string | null
  numero?: string | null
  complemento?: string | null
  bairro?: string | null
  cidade?: string | null
  estado?: string | null
}

export type FullOrderForTiny = {
  id: string
  numero: string
  status: string
  pago: boolean
  compradorNome: string | null
  compradorCpf: string | null
  compradorEmail: string | null
  compradorTelefone: string | null
  enderecoSnap: string | null
  metodoPagamento: string | null
  subtotal: unknown
  desconto: unknown
  frete: unknown
  total: unknown
  criadoEm: Date
  tinyPedidoId: string | null
  tinyNumero: string | null
  tinySyncStatus: string | null
  itens: Array<{
    produtoSku: string | null
    produtoNome: string | null
    quantidade: number
    precoUnit: unknown
    produto: {
      ean?: string | null
      pesoGramas?: number | null
    } | null
  }>
}

export type SendOrderToTinyResult = {
  success: boolean
  status:
    | 'NOT_FOUND'
    | 'NOT_SENT_TO_TINY'
    | 'VALIDATION_ERROR'
    | 'SENDING_TO_TINY'
    | 'TINY_ORDER_CREATED'
    | 'SYNC_ERROR'
    | 'ALREADY_SENT'
    | 'TINY_DISABLED'
    | 'NOT_ELIGIBLE'
  tinyOrderId?: string
  tinyOrderNumber?: string
  tinyPedidoId?: string
  tinyNumero?: string
  errors?: string[]
  warnings?: string[]
  message: string
}
