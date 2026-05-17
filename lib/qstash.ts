import type { OrderEmailData } from '@/lib/resend'

const BASE = process.env.NEXT_PUBLIC_URL ?? 'https://metalab-farma.vercel.app'

// Publica o envio de e-mail como job assíncrono no QStash.
// Fallback síncrono quando QSTASH_TOKEN não está configurado (dev/test).
export async function enqueueOrderEmail(data: OrderEmailData): Promise<void> {
  const token = process.env.QSTASH_TOKEN
  if (!token) {
    const { sendOrderConfirmationEmail } = await import('@/lib/resend')
    void sendOrderConfirmationEmail(data)
    return
  }

  const { Client } = await import('@upstash/qstash')
  const client = new Client({ token })

  await client.publishJSON({
    url: `${BASE}/api/jobs/email-pedido`,
    body: data,
    retries: 3,
    delay: 2, // 2 segundos — garante que o pedido foi commitado no DB antes do job rodar
  })
}
