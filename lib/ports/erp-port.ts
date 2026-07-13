import { sendOrderToTiny, syncInvoiceFromTiny } from '@/lib/tiny-service'
import { tinyConfigurado } from '@/lib/tiny'

/**
 * Strangler-Fig FOUNDATION — ERP port (Tiny/Olist).
 *
 * ADDITIVE ONLY. Interface + adapter LOCAL delegando para @/lib/tiny-service e
 * @/lib/tiny (que já são a "Wave 1/2" desligada). Não é chamado por nenhum
 * fluxo ainda. THIN — nenhuma regra nova. Zero mudança de comportamento hoje.
 */
export interface ErpPort {
  /** True quando o ERP está configurado (TINY_API_TOKEN presente). */
  isConfigured(): boolean
  /** Cria/localiza o pedido no ERP. */
  syncOrder(orderId: string): ReturnType<typeof sendOrderToTiny>
  /** Sincroniza a NF-e do pedido a partir do ERP. */
  syncInvoice(orderId: string): ReturnType<typeof syncInvoiceFromTiny>
}

export class LocalErpAdapter implements ErpPort {
  isConfigured(): boolean {
    return tinyConfigurado()
  }

  syncOrder(orderId: string): ReturnType<typeof sendOrderToTiny> {
    return sendOrderToTiny(orderId)
  }

  syncInvoice(orderId: string): ReturnType<typeof syncInvoiceFromTiny> {
    return syncInvoiceFromTiny(orderId)
  }
}

/** Factory do port. Hoje sempre o adapter local. */
export function getErpPort(): ErpPort {
  return new LocalErpAdapter()
}
