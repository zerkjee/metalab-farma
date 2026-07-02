import { Receiver } from '@upstash/qstash'

const BASE = process.env.NEXT_PUBLIC_URL ?? 'https://metalab-farma.vercel.app'

const receiver =
  process.env.QSTASH_CURRENT_SIGNING_KEY
    ? new Receiver({
        currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY,
        nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY ?? '',
      })
    : null

export type QStashVerifyResult =
  | { valid: true }
  | { valid: false; reason: string; httpStatus: 401 | 503 }

/**
 * Verifica a assinatura Upstash-Signature de uma requisição de job.
 * Fail-closed: se QSTASH_CURRENT_SIGNING_KEY não estiver configurado, a
 * requisição é RECUSADA (503) em vez de processada sem checagem — essas
 * rotas mudam estoque, cupons e status de pedido, então "sem chave = sem
 * validar" não pode significar "aceita qualquer um".
 */
export async function verifyQStashRequest(routePath: string, bodyText: string, signature: string | null): Promise<QStashVerifyResult> {
  if (!receiver) {
    return { valid: false, reason: 'QSTASH_CURRENT_SIGNING_KEY não configurado', httpStatus: 503 }
  }

  const isValid = await receiver
    .verify({ signature: signature ?? '', body: bodyText, url: `${BASE}${routePath}` })
    .catch(() => false)

  return isValid ? { valid: true } : { valid: false, reason: 'Assinatura QStash inválida', httpStatus: 401 }
}
