/**
 * Webhook de ENTRADA do Tiny/Olist (Tiny → loja).
 *
 * ⚠️ WAVE 4: recebe notificações do Tiny sobre mudança de situação do pedido e
 * emissão de NF-e, populando nfNumero/nfChave/nfUrl/nfXmlUrl/nfStatus/nfEmitidaEm,
 * tinyStatus e tinyLastWebhookAt. Complementa o fluxo de SAÍDA (job tiny-sync que
 * cria o pedido no Tiny). Não existe até então — ver docs/tiny-architecture.md §7.7.
 *
 * Estado atual: inerte sem TINY_WEBHOOK_SECRET (fail-closed em produção). O formato
 * exato do payload e o header de assinatura do Tiny devem ser CONFIRMADOS na ativação
 * — a extração abaixo é defensiva (tolera nomes alternativos de campo) e o match do
 * pedido é idempotente (por tinyPedidoId, com fallback no número interno).
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { logger } from '@/lib/logger'
import { verifyTinyWebhook } from '@/lib/webhookUtils'

const ROUTE = 'POST /api/webhooks/tiny'
const SYSTEM_ACTOR = { adminId: 'system', adminEmail: 'tiny-webhook@sistema' }

// ── Helpers de extração defensiva ────────────────────────────────────────────
function asObject(v: unknown): Record<string, unknown> {
  return v && typeof v === 'object' ? (v as Record<string, unknown>) : {}
}

/** Retorna a primeira das chaves presente e não-vazia, como string. */
function pick(obj: Record<string, unknown>, keys: string[]): string | undefined {
  for (const k of keys) {
    const val = obj[k]
    if (val != null && String(val).trim() !== '') return String(val)
  }
  return undefined
}

interface TinyWebhookDados {
  tinyPedidoId?: string
  numero?: string
  tinyNumero?: string
  situacao?: string
  nfNumero?: string
  nfChave?: string
  nfUrl?: string
  nfXmlUrl?: string
  nfStatus?: string
  nfEmitidaEm?: Date
}

/**
 * Normaliza o payload do Tiny para os campos que persistimos. Tolera as variações
 * de nome mais prováveis do Tiny v2 (snake_case / camelCase). Ajustar aqui quando o
 * shape real for confirmado.
 */
function extrairDados(body: Record<string, unknown>): TinyWebhookDados {
  // O Tiny costuma aninhar o conteúdo em `dados` (ou `pedido` / `nota_fiscal`).
  const dados = { ...asObject(body), ...asObject(body.dados), ...asObject(body.pedido), ...asObject(body.nota_fiscal) }

  const emitidaStr = pick(dados, ['dataEmissao', 'data_emissao', 'nfEmitidaEm'])
  const emitida = emitidaStr ? new Date(emitidaStr) : undefined

  return {
    tinyPedidoId: pick(dados, ['idPedido', 'id_pedido', 'tinyPedidoId', 'id']),
    numero: pick(dados, ['numeroPedidoEcommerce', 'numero_pedido_ecommerce', 'numeroEcommerce', 'numeroPedido']),
    tinyNumero: pick(dados, ['numero', 'numeroPedidoTiny']),
    situacao: pick(dados, ['situacao', 'status']),
    nfNumero: pick(dados, ['numeroNota', 'numero_nota', 'nfNumero']),
    nfChave: pick(dados, ['chaveAcesso', 'chave_acesso', 'chaveNfe', 'nfChave']),
    nfUrl: pick(dados, ['urlDanfe', 'url_danfe', 'linkDanfe', 'nfUrl']),
    nfXmlUrl: pick(dados, ['urlXml', 'url_xml', 'linkXml', 'nfXmlUrl']),
    nfStatus: pick(dados, ['situacaoNota', 'situacao_nota', 'statusNota', 'nfStatus']),
    nfEmitidaEm: emitida && !Number.isNaN(emitida.getTime()) ? emitida : undefined,
  }
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text()

  // ── Autenticação: assinatura HMAC do Tiny ────────────────────────────────────
  // NOTA: confirmar o nome do header no painel do Tiny na ativação (Wave 4).
  const signature =
    request.headers.get('x-tiny-signature') ??
    request.headers.get('x-signature') ??
    request.headers.get('tiny-hmac-sha256')
  const verify = verifyTinyWebhook({
    rawBody,
    signature,
    secret: process.env.TINY_WEBHOOK_SECRET,
    isProd: process.env.NODE_ENV === 'production',
    skipVerify: process.env.TINY_WEBHOOK_SKIP_VERIFY === '1',
  })
  if (!verify.valid) {
    logger.warn('Webhook Tiny: verificação falhou', { route: ROUTE, reason: verify.reason })
    return NextResponse.json({ erro: verify.reason }, { status: verify.httpStatus })
  }

  // ── Parse do payload ─────────────────────────────────────────────────────────
  let body: Record<string, unknown>
  try {
    body = asObject(JSON.parse(rawBody))
  } catch {
    logger.warn('Webhook Tiny: body inválido / não-JSON', { route: ROUTE })
    return NextResponse.json({ erro: 'Body inválido' }, { status: 400 })
  }

  const dados = extrairDados(body)

  // ── Localiza o pedido (idempotente): por tinyPedidoId, senão pelo número interno ─
  if (!dados.tinyPedidoId && !dados.numero) {
    logger.warn('Webhook Tiny: sem identificador de pedido no payload', { route: ROUTE })
    // 200 — não há o que retentar; payload sem id de pedido é definitivo.
    return NextResponse.json({ ok: true, skipped: 'sem_identificador' })
  }

  const where = dados.tinyPedidoId
    ? { tinyPedidoId: dados.tinyPedidoId }
    : { numero: dados.numero as string }

  // Só grava campos presentes no payload (não sobrescreve com null).
  const updateData: Record<string, unknown> = { tinyLastWebhookAt: new Date() }
  if (dados.situacao) updateData.tinyStatus = dados.situacao
  if (dados.tinyNumero) updateData.tinyNumero = dados.tinyNumero
  if (dados.nfNumero) updateData.nfNumero = dados.nfNumero
  if (dados.nfChave) updateData.nfChave = dados.nfChave
  if (dados.nfUrl) updateData.nfUrl = dados.nfUrl
  if (dados.nfXmlUrl) updateData.nfXmlUrl = dados.nfXmlUrl
  if (dados.nfStatus) updateData.nfStatus = dados.nfStatus
  if (dados.nfEmitidaEm) updateData.nfEmitidaEm = dados.nfEmitidaEm

  const result = await prisma.pedido.updateMany({ where, data: updateData })

  if (result.count === 0) {
    logger.warn('Webhook Tiny: pedido não encontrado', { route: ROUTE, tinyPedidoId: dados.tinyPedidoId, numero: dados.numero })
    // 200 — o pedido pode não existir aqui (ex.: criado direto no Tiny). Nada a retentar.
    return NextResponse.json({ ok: true, skipped: 'pedido_nao_encontrado' })
  }

  // Auditoria: uma ação específica quando houve emissão de NF, senão mudança de situação.
  void logAudit({
    ...SYSTEM_ACTOR,
    acao: dados.nfNumero ? 'tiny.nf.emitida' : 'tiny.webhook.recebido',
    recurso: 'Pedido',
    detalhe: {
      tinyPedidoId: dados.tinyPedidoId,
      numero: dados.numero,
      situacao: dados.situacao,
      nfNumero: dados.nfNumero,
      nfStatus: dados.nfStatus,
    },
  })
  logger.info('Webhook Tiny processado', { route: ROUTE, tinyPedidoId: dados.tinyPedidoId, numero: dados.numero, nfNumero: dados.nfNumero, situacao: dados.situacao })

  return NextResponse.json({ ok: true })
}
