/**
 * Strangler-Fig FOUNDATION — Payment port (Mercado Pago).
 *
 * ADDITIVE ONLY. Apenas a INTERFACE + um adapter local STUB. Hoje o SDK do
 * Mercado Pago é instanciado inline em app/api/pagamento/criar/route.ts (e no
 * webhook). Mover essa lógica para cá é um refactor à parte que MUDARIA
 * comportamento — fora do escopo desta fundação. Por isso o adapter local
 * lança "not implemented" em vez de duplicar/mover a lógica de pagamento.
 * Não é chamado por nenhuma rota. Zero mudança de comportamento hoje.
 */
export interface CreatePixPaymentInput {
  pedidoId: string
  amount: number
  payerEmail: string
  payerFirstName: string
  payerLastName: string
  payerCpf: string
  notificationUrl: string
}

export interface CreatePixPaymentResult {
  paymentId: string
  status: string
  pixQrCode?: string
  pixQrCodeBase64?: string
}

export interface PaymentPort {
  /** Cria um pagamento PIX no provedor. */
  createPixPayment(input: CreatePixPaymentInput): Promise<CreatePixPaymentResult>
}

export class LocalPaymentAdapter implements PaymentPort {
  async createPixPayment(input: CreatePixPaymentInput): Promise<CreatePixPaymentResult> {
    // TODO(strangler): a criação do pagamento PIX ainda vive inline em
    // app/api/pagamento/criar/route.ts. Extrair para cá sem mudar comportamento
    // é um PR dedicado. Stub explícito até lá.
    throw new Error(
      `LocalPaymentAdapter.createPixPayment not implemented (pedido ${input.pedidoId}) — payment logic still lives inline in app/api/pagamento/criar/route.ts`,
    )
  }
}

/** Factory do port. Hoje sempre o adapter local (stub). */
export function getPaymentPort(): PaymentPort {
  return new LocalPaymentAdapter()
}
