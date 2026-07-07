import crypto from 'crypto'

export type VerifyResult =
  | { valid: true }
  | { valid: false; reason: string; httpStatus: 401 | 503 }

export interface VerifyMPInput {
  xSignature: string | null
  xRequestId: string | null
  paymentId: string
  secret: string | undefined
  isProd: boolean
  skipVerify: boolean
}

export function verifyMPSignature(input: VerifyMPInput): VerifyResult {
  const { xSignature, xRequestId, paymentId, secret, isProd, skipVerify } = input

  if (!secret) {
    if (isProd) {
      return { valid: false, reason: 'Webhook secret não configurado', httpStatus: 503 }
    }
    if (skipVerify) return { valid: true }
    return {
      valid: false,
      reason: 'Webhook secret não configurado (dev sem MP_WEBHOOK_SKIP_VERIFY)',
      httpStatus: 503,
    }
  }

  if (!xSignature || !xRequestId) {
    return { valid: false, reason: 'Headers x-signature/x-request-id ausentes', httpStatus: 401 }
  }

  const parts = Object.fromEntries(
    xSignature.split(',').flatMap((part) => {
      const [k, v] = part.trim().split('=')
      return k && v ? [[k, v]] : []
    }),
  )
  const { ts, v1 } = parts
  if (!ts || !v1) {
    return { valid: false, reason: 'Formato inválido de x-signature', httpStatus: 401 }
  }

  const tsNum = Number(ts)
  if (!Number.isFinite(tsNum) || Math.abs(Date.now() / 1000 - tsNum) > 300) {
    return { valid: false, reason: 'Request expirado ou ts inválido (possível replay attack)', httpStatus: 401 }
  }

  const manifest = `id:${paymentId};request-id:${xRequestId};ts:${ts};`
  const expectedHex = crypto.createHmac('sha256', secret).update(manifest).digest('hex')

  let receivedBuf: Buffer
  let expectedBuf: Buffer
  try {
    receivedBuf = Buffer.from(v1, 'hex')
    expectedBuf = Buffer.from(expectedHex, 'hex')
  } catch {
    return { valid: false, reason: 'Assinatura não-hex', httpStatus: 401 }
  }

  if (receivedBuf.length !== expectedBuf.length || receivedBuf.length === 0) {
    return { valid: false, reason: 'Tamanho de assinatura inválido', httpStatus: 401 }
  }

  const valid = crypto.timingSafeEqual(receivedBuf, expectedBuf)
  return valid
    ? { valid: true }
    : { valid: false, reason: 'Assinatura HMAC não confere', httpStatus: 401 }
}

export interface VerifyTinyInput {
  /** Corpo bruto (string) da requisição — a assinatura é calculada sobre ele. */
  rawBody: string
  /** Assinatura recebida no header (hex). Ver nota sobre o nome do header no route. */
  signature: string | null
  secret: string | undefined
  isProd: boolean
  skipVerify: boolean
}

/**
 * Verifica a assinatura HMAC-SHA256 de um webhook recebido do Tiny.
 *
 * ⚠️ WAVE 4: o esquema exato de assinatura do Tiny (nome do header e se o HMAC é
 * sobre o corpo bruto ou sobre um manifesto) deve ser CONFIRMADO no painel do Tiny
 * na ativação. Este helper assume o padrão mais comum: HMAC-SHA256(rawBody) em hex.
 * Ajustar `manifest` aqui se o Tiny usar outro formato. Fail-closed em produção.
 */
export function verifyTinyWebhook(input: VerifyTinyInput): VerifyResult {
  const { rawBody, signature, secret, isProd, skipVerify } = input

  if (!secret) {
    if (isProd) {
      return { valid: false, reason: 'TINY_WEBHOOK_SECRET não configurado', httpStatus: 503 }
    }
    if (skipVerify) return { valid: true }
    return {
      valid: false,
      reason: 'TINY_WEBHOOK_SECRET não configurado (dev sem TINY_WEBHOOK_SKIP_VERIFY)',
      httpStatus: 503,
    }
  }

  if (!signature) {
    return { valid: false, reason: 'Assinatura do webhook Tiny ausente', httpStatus: 401 }
  }

  const manifest = rawBody
  const expectedHex = crypto.createHmac('sha256', secret).update(manifest).digest('hex')

  let receivedBuf: Buffer
  let expectedBuf: Buffer
  try {
    receivedBuf = Buffer.from(signature.trim(), 'hex')
    expectedBuf = Buffer.from(expectedHex, 'hex')
  } catch {
    return { valid: false, reason: 'Assinatura não-hex', httpStatus: 401 }
  }

  if (receivedBuf.length !== expectedBuf.length || receivedBuf.length === 0) {
    return { valid: false, reason: 'Tamanho de assinatura inválido', httpStatus: 401 }
  }

  return crypto.timingSafeEqual(receivedBuf, expectedBuf)
    ? { valid: true }
    : { valid: false, reason: 'Assinatura HMAC não confere', httpStatus: 401 }
}
