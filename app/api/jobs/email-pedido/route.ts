import { NextRequest, NextResponse } from 'next/server'
import { sendOrderConfirmationEmail } from '@/lib/resend'
import { logger } from '@/lib/logger'
import { verifyQStashRequest } from '@/lib/qstashAuth'

export async function POST(request: NextRequest) {
  const bodyText = await request.text()
  const route = 'POST /api/jobs/email-pedido'

  const verify = await verifyQStashRequest('/api/jobs/email-pedido', bodyText, request.headers.get('Upstash-Signature'))
  if (!verify.valid) {
    logger.warn(verify.reason, { route })
    return NextResponse.json({ erro: verify.reason }, { status: verify.httpStatus })
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
