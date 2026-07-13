import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { verifyQStashRequest } from '@/lib/qstashAuth'
import { orderOutboxEnabled } from '@/lib/outbox'
import { enqueueOrderEmail, enqueueTinySync } from '@/lib/qstash'
import { EVENT_TYPES, orderPaidV1PayloadSchema } from '@/lib/contracts'

/**
 * OUTBOX RELAY — fecha a janela de crash da §6.2.
 *
 * O caminho rápido do webhook grava o evento no outbox (PENDING) na MESMA
 * transação do commit do pedido e, DEPOIS, enfileira o e-mail/Tiny e marca a
 * linha PUBLISHED (best-effort). Se o processo cair ENTRE o commit e o enqueue,
 * a linha fica PENDING órfã e o efeito colateral (e-mail/Tiny) nunca sai.
 *
 * Este relay varre linhas PENDING antigas o suficiente para não estarem no meio
 * do caminho rápido (RELAY_MIN_AGE_MS) e as publica de verdade. É seguro reentregar:
 * o consumidor (/api/jobs/email-pedido) deduplica via inbox (claim atômico por
 * eventId), então se o caminho rápido de fato enviou, a reentrega é no-op.
 *
 * FLAG-GATED por ORDER_OUTBOX_ENABLED (default OFF). Com a flag desligada a rota
 * não toca no banco. Aditivo e inerte em produção até a flag ligar e a migration
 * do outbox ser aplicada.
 */

// Idade mínima para uma linha PENDING ser considerada órfã. 2 min evita corrida
// com o caminho rápido do webhook, que marca PUBLISHED em segundos.
const RELAY_MIN_AGE_MS = 120_000
const BATCH_SIZE = 50

export async function POST(request: NextRequest) {
  const bodyText = await request.text()
  const route = 'POST /api/jobs/outbox-relay'

  const verify = await verifyQStashRequest(
    '/api/jobs/outbox-relay',
    bodyText,
    request.headers.get('Upstash-Signature'),
  )
  if (!verify.valid) {
    logger.warn(verify.reason, { route })
    return NextResponse.json({ erro: verify.reason }, { status: verify.httpStatus })
  }

  // Flag OFF: caminho legado inerte — NÃO toca no banco.
  if (!orderOutboxEnabled()) {
    return NextResponse.json({ ok: true, skipped: 'flag-off' })
  }

  const cutoff = new Date(Date.now() - RELAY_MIN_AGE_MS)
  const rows = await prisma.outboxEvent.findMany({
    where: { status: 'PENDING', createdAt: { lt: cutoff } },
    orderBy: { createdAt: 'asc' },
    take: BATCH_SIZE,
  })

  let published = 0
  let failed = 0

  for (const row of rows) {
    try {
      // CLAIM ATÔMICO: garante que relays concorrentes não processem a mesma
      // linha. Só quem virar PENDING→PUBLISHED (count 1) segue; count 0 = já
      // reivindicada por outra execução → pula.
      const claim = await prisma.outboxEvent.updateMany({
        where: { id: row.id, status: 'PENDING' },
        data: { status: 'PUBLISHED', publishedAt: new Date() },
      })
      if (claim.count === 0) {
        continue
      }

      if (row.eventType === EVENT_TYPES.ORDER_PAID) {
        const parsed = orderPaidV1PayloadSchema.safeParse(row.payload)
        if (!parsed.success) {
          await prisma.integrationFailure.create({
            data: {
              source: 'outbox-relay',
              eventId: row.eventId,
              eventType: row.eventType,
              error: `Payload inválido: ${parsed.error.message}`,
            },
          })
          await prisma.outboxEvent.updateMany({
            where: { id: row.id },
            data: { status: 'FAILED' },
          })
          failed += 1
          continue
        }

        const payload = parsed.data
        await enqueueOrderEmail(payload, row.idempotencyKey ?? undefined)
        if (process.env.TINY_AUTO_SEND_ORDERS === 'true') {
          await enqueueTinySync(payload.pedidoId)
        }
        published += 1
        logger.info('Outbox relay: evento republicado', {
          route,
          eventId: row.eventId,
          eventType: row.eventType,
        })
        continue
      }

      // eventType desconhecido: sem consumidor → registra falha e marca FAILED.
      logger.warn('Outbox relay: eventType desconhecido', {
        route,
        eventId: row.eventId,
        eventType: row.eventType,
      })
      await prisma.integrationFailure.create({
        data: {
          source: 'outbox-relay',
          eventId: row.eventId,
          eventType: row.eventType,
          error: `eventType desconhecido: ${row.eventType}`,
        },
      })
      await prisma.outboxEvent.updateMany({
        where: { id: row.id },
        data: { status: 'FAILED' },
      })
      failed += 1
    } catch (error) {
      // Erro na entrega APÓS o claim: volta a linha para FAILED (com lastError +
      // attempts++) para uma execução posterior / requeue manual tratar.
      const message = error instanceof Error ? error.message : String(error)
      logger.error('Outbox relay: falha ao republicar evento', error)
      try {
        await prisma.outboxEvent.updateMany({
          where: { id: row.id },
          data: { status: 'FAILED', lastError: message, attempts: { increment: 1 } },
        })
        await prisma.integrationFailure.create({
          data: {
            source: 'outbox-relay',
            eventId: row.eventId,
            eventType: row.eventType,
            error: message,
          },
        })
      } catch (recordErr) {
        logger.error('Outbox relay: falha ao registrar erro de entrega', recordErr)
      }
      failed += 1
    }
  }

  return NextResponse.json({ ok: true, published, failed })
}
