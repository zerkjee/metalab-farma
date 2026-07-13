import type {
  OrderPaidV1Payload,
  PixExpiredV1Payload,
  CartAbandonedV1Payload,
} from '@/lib/contracts'

/**
 * Strangler-Fig FOUNDATION — Notification port.
 *
 * ADDITIVE ONLY. Interface + adapter LOCAL que apenas delega para as funções já
 * existentes de e-mail/fila (@/lib/resend via @/lib/qstash). Não é chamado por
 * nenhuma rota/job ainda — é o ponto de extensão para, num PR futuro, plugar um
 * serviço de notificações remoto sem tocar nos chamadores. Zero mudança de
 * comportamento hoje.
 *
 * Os métodos são tipados com os PAYLOADS DE CONTRATO (lib/contracts), não com os
 * DTOs internos das libs — é a fronteira estável do port.
 */
export interface NotificationPort {
  /** Confirmação de pedido pago (order.paid.v1). */
  orderConfirmation(payload: OrderPaidV1Payload): Promise<void>
  /** Recovery de PIX expirado (pix.expired.v1). */
  pixExpiry(payload: PixExpiredV1Payload): Promise<void>
  /** Recuperação de carrinho abandonado (cart.abandoned.v1). */
  abandonedCart(payload: CartAbandonedV1Payload): Promise<void>
}

/**
 * Adapter local: delega para os helpers de fila existentes (@/lib/qstash), que
 * por sua vez caem em @/lib/resend (envio síncrono) quando QSTASH_TOKEN ausente.
 * THIN — nenhuma regra de negócio nova. Espelha exatamente o que os fluxos
 * atuais já fazem.
 */
export class LocalNotificationAdapter implements NotificationPort {
  async orderConfirmation(payload: OrderPaidV1Payload): Promise<void> {
    const { enqueueOrderEmail } = await import('@/lib/qstash')
    await enqueueOrderEmail({
      numero: payload.numero,
      compradorNome: payload.compradorNome,
      compradorEmail: payload.compradorEmail,
      total: payload.total,
      metodoPagamento: payload.metodoPagamento,
      itens: payload.itens,
      pixQrCode: payload.pixQrCode,
    })
  }

  async pixExpiry(payload: PixExpiredV1Payload): Promise<void> {
    // Mesmo caminho do fluxo real: enfileira o job, que carrega os dados
    // completos e envia via @/lib/resend. Só o pedidoId é necessário aqui.
    const { enqueueJob } = await import('@/lib/qstash')
    await enqueueJob('/api/jobs/pix-expiry', { pedidoId: payload.pedidoId, stage: 'email' })
  }

  async abandonedCart(payload: CartAbandonedV1Payload): Promise<void> {
    const { enqueueJob } = await import('@/lib/qstash')
    await enqueueJob('/api/jobs/abandoned-cart', {
      cartSessionId: payload.cartSessionId,
      stage: payload.stage,
    })
  }
}

/**
 * Factory do port. Lê os flags de rollout e devolve o adapter apropriado.
 *
 * - NOTIFICATIONS_SERVICE_ENABLED (default false): liga o serviço remoto.
 * - NOTIFICATIONS_FALLBACK_LOCAL  (default true):  mantém o adapter local.
 *
 * Hoje sempre retorna o adapter local. O adapter remoto ainda não existe; se
 * alguém ligar o serviço E desligar o fallback, falha explícita em vez de
 * silenciosamente não notificar.
 */
export function getNotificationPort(): NotificationPort {
  const serviceEnabled = process.env.NOTIFICATIONS_SERVICE_ENABLED === 'true'
  const fallbackLocal = process.env.NOTIFICATIONS_FALLBACK_LOCAL !== 'false'

  if (serviceEnabled && !fallbackLocal) {
    // TODO(strangler): implementar RemoteNotificationAdapter (serviço dedicado)
    // antes de habilitar este caminho em produção.
    throw new Error('RemoteNotificationAdapter not implemented')
  }

  return new LocalNotificationAdapter()
}
