import { NextRequest, NextResponse } from 'next/server'
import { Receiver } from '@upstash/qstash'
import { sendOrderConfirmationEmail } from '@/lib/resend'
import { logger } from '@/lib/logger'

const BASE = process.env.NEXT_PUBLIC_URL ?? 'https://metalab-farma.vercel.app'

const receiver =
  process.env.QSTASH_CURRENT_SIGNING_KEY
    ? new Receiver({
        currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY,
        nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY ?? '',
      })
    : null

export async function POST(request: NextRequest) {
  const bodyText = await request.text()

  if (receiver) {
    const signature = request.headers.get('Upstash-Signature') ?? ''
    const isValid = await receiver.verify({
      signature,
      body: bodyText,
      url: `${BASE}/api/jobs/email-pedido`,
    }).catch(() => false)

    if (!isValid) {
      logger.warn('Assinatura QStash inválida', { route: 'POST /api/jobs/email-pedido' })
      return NextResponse.json({ erro: 'Assinatura inválida' }, { status: 401 })
    }
  }

  try {
    const payload = JSON.parse(bodyText)
    await sendOrderConfirmationEmail(payload)
    logger.info('E-mail de confirmação enviado via QStash', {
      route: 'POST /api/jobs/email-pedido',
      pedidoNumero: payload.numero,
    })
    return NextResponse.json({ ok: true })
  } catch (error) {
    logger.error('Falha ao enviar e-mail via QStash', error)
    return NextResponse.json({ erro: 'Falha no envio' }, { status: 500 })
  }
}
