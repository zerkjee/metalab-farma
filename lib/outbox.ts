import type { Prisma } from '@prisma/client'
import type { DomainEvent } from '@/lib/contracts'

/**
 * Feature flag do outbox no fluxo de aprovação de pagamento.
 *
 * Default OFF: quando `ORDER_OUTBOX_ENABLED !== 'true'`, o webhook mantém o
 * caminho legado EXATO (sem transação interativa, sem gravação no outbox). A
 * gravação durável só entra quando explicitamente ligada por env.
 */
export function orderOutboxEnabled(): boolean {
  return process.env.ORDER_OUTBOX_ENABLED === 'true'
}

/**
 * Strangler-Fig FOUNDATION — transactional outbox.
 *
 * ADDITIVE ONLY. Nada aqui está ligado a rotas/jobs existentes. `writeOutbox` é
 * a primitiva "publica o evento na MESMA transação do agregado": o chamador
 * futuro passa o `tx` da sua transação Prisma e grava o evento junto com a
 * mutação de negócio, garantindo atomicidade (ou os dois persistem, ou nenhum).
 * Um relay separado (PR futuro) lê linhas PENDING e publica de fato.
 *
 * Zero mudança de comportamento hoje — não é chamado em lugar nenhum.
 */

/**
 * Insere UMA linha em `outbox_events` a partir de um envelope de evento de
 * domínio, dentro de uma transação fornecida pelo chamador (`tx`).
 *
 * Deve ser chamado dentro de `prisma.$transaction(async (tx) => { ... })`,
 * na mesma transação da escrita do agregado. Status inicial sempre PENDING.
 *
 * `occurredAt` do envelope é ISO string; convertido para Date na coluna.
 * `aggregateType`/`aggregateId` não fazem parte do envelope genérico — ficam
 * nulos aqui e podem ser preenchidos por variantes futuras.
 */
export async function writeOutbox(
  tx: Prisma.TransactionClient,
  event: DomainEvent<unknown>,
): Promise<string> {
  const created = await tx.outboxEvent.create({
    data: {
      eventId: event.eventId,
      eventType: event.eventType,
      eventVersion: event.eventVersion,
      payload: event.payload as Prisma.InputJsonValue,
      correlationId: event.correlationId,
      causationId: event.causationId ?? null,
      idempotencyKey: event.idempotencyKey,
      producer: event.producer,
      status: 'PENDING',
      occurredAt: new Date(event.occurredAt),
    },
  })
  return created.id
}

/**
 * Marca uma linha do outbox como publicada (status PUBLISHED + publishedAt).
 * Helper puro — usado por um relay futuro. Não chamado ainda.
 */
export async function markPublished(
  tx: Prisma.TransactionClient,
  id: string,
): Promise<void> {
  await tx.outboxEvent.update({
    where: { id },
    data: { status: 'PUBLISHED', publishedAt: new Date() },
  })
}

/**
 * Registra o recebimento de um evento no inbox (deduplicação no consumo).
 * Idempotente via PK `eventId`: se já existir, não sobrescreve.
 * Helper puro — usado por um consumidor futuro. Não chamado ainda.
 */
export async function recordInbox(
  tx: Prisma.TransactionClient,
  args: { eventId: string; eventType: string; consumer: string },
): Promise<void> {
  await tx.inboxEvent.upsert({
    where: { eventId: args.eventId },
    create: {
      eventId: args.eventId,
      eventType: args.eventType,
      consumer: args.consumer,
      status: 'RECEIVED',
    },
    update: {},
  })
}
