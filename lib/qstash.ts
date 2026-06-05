import type { OrderEmailData } from '@/lib/resend'

export const BASE = process.env.NEXT_PUBLIC_URL ?? 'https://metalab-farma.vercel.app'

// Publica mensagem genérica no QStash. No-op em dev sem QSTASH_TOKEN.
export async function enqueueJob(
  path: string,
  body: object,
  delaySeconds = 0,
  retries = 3,
): Promise<void> {
  const token = process.env.QSTASH_TOKEN
  if (!token) return

  const { Client } = await import('@upstash/qstash')
  const client = new Client({ token })
  await client.publishJSON({
    url: `${BASE}${path}`,
    body,
    retries,
    delay: delaySeconds,
  })
}

// Publica o envio de e-mail como job assíncrono no QStash.
// Fallback síncrono quando QSTASH_TOKEN não está configurado (dev/test).
export async function enqueueOrderEmail(data: OrderEmailData): Promise<void> {
  const token = process.env.QSTASH_TOKEN
  if (!token) {
    const { sendOrderConfirmationEmail } = await import('@/lib/resend')
    void sendOrderConfirmationEmail(data)
    return
  }

  await enqueueJob('/api/jobs/email-pedido', data, 2)
}

// ─── Integração ERP Tiny (Wave 2A) ─────────────────────────────────────────────

export interface TinySyncJobPayload {
  pedidoId: string
}

/**
 * Enfileira a sincronização de um pedido com o Tiny ERP.
 *
 * ⚠️ WAVE 2A: este helper EXISTE mas ainda NÃO é chamado por nenhum fluxo
 * (o webhook do Mercado Pago permanece inalterado). A ativação acontece na Wave 3.
 *
 * No-op silencioso se QSTASH_TOKEN ausente — NÃO há fallback síncrono, pois um
 * fallback chamaria o Tiny diretamente, o que contraria "manter desligado".
 *
 * @param pedidoId    ID do pedido a sincronizar.
 * @param delaySeconds Atraso antes da 1ª tentativa (default 5s — dá folga ao commit do pagamento).
 * @param retries     Tentativas do QStash em caso de falha (default 5, backoff exponencial do QStash).
 */
export async function enqueueTinySync(
  pedidoId: string,
  delaySeconds = 5,
  retries = 5,
): Promise<void> {
  const payload: TinySyncJobPayload = { pedidoId }
  await enqueueJob('/api/jobs/tiny-sync-pedido', payload, delaySeconds, retries)
}
