import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { sendOrderConfirmationEmail } from '@/lib/resend'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { verifyQStashRequest } from '@/lib/qstashAuth'
import { orderOutboxEnabled } from '@/lib/outbox'
import { EVENT_TYPES } from '@/lib/contracts'

const CONSUMER = 'email-pedido'

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
    const idempotencyKey: string | undefined =
      typeof payload?.idempotencyKey === 'string' ? payload.idempotencyKey : undefined

    // Dedup no consumo (flag ON + chave presente): claim atômico no inbox antes
    // de enviar. Isso corrige o bug de reenvio em reentregas do QStash. Sem flag
    // ou sem chave → comportamento legado EXATO (envia incondicionalmente).
    if (orderOutboxEnabled() && idempotencyKey) {
      try {
        // Insert-or-skip: PK `eventId` garante atomicidade contra concorrência.
        await prisma.inboxEvent.create({
          data: {
            eventId: idempotencyKey,
            eventType: EVENT_TYPES.ORDER_PAID,
            consumer: CONSUMER,
            status: 'RECEIVED',
          },
        })
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
          // Linha já existe. SÓ deduplica se o envio anterior foi CONFIRMADO
          // (PROCESSED). Se ficou em RECEIVED (reivindicado mas caiu antes de
          // enviar/confirmar), reenvia — dedup em qualquer linha causaria perda
          // do e-mail (at-most-once) na janela crash-entre-claim-e-envio.
          const existing = await prisma.inboxEvent.findUnique({ where: { eventId: idempotencyKey } })
          if (existing?.status === 'PROCESSED') {
            logger.info('E-mail já processado — reentrega ignorada (inbox dedup)', {
              route,
              idempotencyKey,
            })
            return NextResponse.json({ ok: true, deduped: true })
          }
          logger.info('Inbox reivindicado mas não confirmado — reenviando', { route, idempotencyKey })
        } else {
          throw e
        }
      }

      // Chave nova (ou reivindicada sem confirmação): envia e marca processado.
      await sendOrderConfirmationEmail(payload)
      await prisma.inboxEvent.update({
        where: { eventId: idempotencyKey },
        data: { status: 'PROCESSED', processedAt: new Date() },
      })
      logger.info('E-mail de confirmação enviado via QStash (inbox dedup)', {
        route,
        pedidoNumero: payload.numero,
        idempotencyKey,
      })
      return NextResponse.json({ ok: true })
    }

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
