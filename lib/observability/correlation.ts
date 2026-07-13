import { AsyncLocalStorage } from 'node:async_hooks'

/**
 * Strangler-Fig FOUNDATION — propagação de correlation/request IDs.
 *
 * ADDITIVE ONLY. Não importado por nenhuma rota ainda. PRs futuros vão
 * envolver handlers com `runWithCorrelation` para que logs e eventos de
 * domínio compartilhem o mesmo rastro. Node-safe, sem dependências externas.
 *
 * Todas as leituras são seguras sem store ativo: retornam undefined, nunca
 * lançam.
 */
export interface CorrelationContext {
  correlationId: string
  requestId: string
  causationId?: string
}

const storage = new AsyncLocalStorage<CorrelationContext>()

/** Executa `fn` com o contexto de correlação ativo (inclusive aninhado). */
export function runWithCorrelation<T>(ctx: CorrelationContext, fn: () => T): T {
  return storage.run(ctx, fn)
}

/** Contexto ativo, ou undefined se não houver store. */
export function getContext(): CorrelationContext | undefined {
  return storage.getStore()
}

/** correlationId ativo, ou undefined. */
export function getCorrelationId(): string | undefined {
  return storage.getStore()?.correlationId
}

/** requestId ativo, ou undefined. */
export function getRequestId(): string | undefined {
  return storage.getStore()?.requestId
}

/** Gera um novo correlationId (UUID v4). */
export function newCorrelationId(): string {
  return crypto.randomUUID()
}
