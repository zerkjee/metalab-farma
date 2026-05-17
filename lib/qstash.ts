import type { OrderEmailData } from '@/lib/resend'

export const BASE = process.env.NEXT_PUBLIC_URL ?? 'https://metalab-farma.vercel.app'

// Publica mensagem genérica no QStash. No-op em dev sem QSTASH_TOKEN.
export async function enqueueJob(
  path: string,
  body: Record<string, unknown>,
  delaySeconds = 0,
): Promise<void> {
  const token = process.env.QSTASH_TOKEN
  if (!token) return

  const { Client } = await import('@upstash/qstash')
  const client = new Client({ token })
  await client.publishJSON({
    url: `${BASE}${path}`,
    body,
    retries: 3,
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

  await enqueueJob('/api/jobs/email-pedido', data as unknown as Record<string, unknown>, 2)
}
