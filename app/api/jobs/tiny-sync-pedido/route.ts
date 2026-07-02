/**
 * Consumer QStash — sincroniza um pedido com o ERP Tiny.
 *
 * ⚠️ WAVE 2A: a infraestrutura existe mas está DESLIGADA. Nenhum fluxo enfileira
 * este job ainda (o webhook do Mercado Pago não foi alterado). Mesmo se invocado,
 * sem TINY_API_TOKEN o cliente Tiny não faz chamadas reais (responde 200, sem retry).
 *
 * Idempotência (lock atômico via tinySyncStatus):
 *   PENDENTE | ERRO  → PROCESSANDO  (só um worker vence a corrida)
 *   PROCESSANDO       → skip (outro worker já está cuidando)
 *   ENVIADO           → skip (já sincronizado)
 *
 * Política de retry:
 *   - Erro de negócio/transporte do Tiny → grava ERRO + responde 500 (QStash retenta;
 *     o próximo run reprocessa porque ERRO é elegível ao lock).
 *   - Tiny desligado / pedido inexistente → responde 200 (não faz sentido retentar).
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { criarOuLocalizarPedidoTiny, tinyConfigurado, TINY_DISABLED, type TinyPedidoInput } from '@/lib/tiny'
import { logAudit } from '@/lib/audit'
import { logger } from '@/lib/logger'
import type { TinySyncJobPayload } from '@/lib/qstash'
import { verifyQStashRequest } from '@/lib/qstashAuth'

const ROUTE = 'POST /api/jobs/tiny-sync-pedido'

// Identidade de sistema para o audit trail (jobs não têm sessão de admin).
const SYSTEM_ACTOR = { adminId: 'system', adminEmail: 'tiny-sync@sistema' }

export async function POST(request: NextRequest) {
  const bodyText = await request.text()

  // ── Autenticação: assinatura QStash ──────────────────────────────────────────
  const verify = await verifyQStashRequest('/api/jobs/tiny-sync-pedido', bodyText, request.headers.get('Upstash-Signature'))
  if (!verify.valid) {
    logger.warn(verify.reason, { route: ROUTE })
    return NextResponse.json({ erro: verify.reason }, { status: verify.httpStatus })
  }

  // ── Validação do payload ─────────────────────────────────────────────────────
  let pedidoId: string
  try {
    const payload = JSON.parse(bodyText) as TinySyncJobPayload
    if (!payload?.pedidoId || typeof payload.pedidoId !== 'string') {
      throw new Error('pedidoId ausente ou inválido')
    }
    pedidoId = payload.pedidoId
  } catch (err) {
    logger.warn('Payload inválido no tiny-sync', { route: ROUTE, err: err instanceof Error ? err.message : String(err) })
    // 400 — não adianta retentar um payload malformado.
    return NextResponse.json({ erro: 'Payload inválido' }, { status: 400 })
  }

  // ── Guard: integração desligada ──────────────────────────────────────────────
  if (!tinyConfigurado()) {
    logger.info('tiny-sync ignorado — TINY_API_TOKEN ausente (integração desligada)', { route: ROUTE, pedidoId })
    return NextResponse.json({ ok: true, skipped: 'tiny_disabled' })
  }

  // ── Idempotência: lock atômico PENDENTE|ERRO → PROCESSANDO ───────────────────
  const lock = await prisma.pedido.updateMany({
    where: { id: pedidoId, tinySyncStatus: { in: ['PENDENTE', 'ERRO'] } },
    data: { tinySyncStatus: 'PROCESSANDO', tinySyncAt: new Date() },
  })
  if (lock.count === 0) {
    logger.info('tiny-sync skip — pedido não está PENDENTE/ERRO (já enviado ou em processamento)', { route: ROUTE, pedidoId })
    return NextResponse.json({ ok: true, skipped: 'not_eligible' })
  }

  // ── Carrega o pedido completo ─────────────────────────────────────────────────
  const pedido = await prisma.pedido.findUnique({
    where: { id: pedidoId },
    select: {
      id: true, numero: true,
      compradorNome: true, compradorCpf: true, compradorEmail: true, compradorTelefone: true,
      enderecoSnap: true,
      subtotal: true, desconto: true, frete: true, total: true,
      itens: { select: { produtoSku: true, produtoNome: true, quantidade: true, precoUnit: true } },
    },
  })

  if (!pedido) {
    // Pedido sumiu entre o lock e a leitura — improvável. Não retenta.
    logger.error('tiny-sync: pedido não encontrado após lock', { route: ROUTE, pedidoId })
    return NextResponse.json({ ok: true, skipped: 'not_found' })
  }

  const input: TinyPedidoInput = {
    numero: pedido.numero,
    compradorNome: pedido.compradorNome,
    compradorCpf: pedido.compradorCpf,
    compradorEmail: pedido.compradorEmail,
    compradorTelefone: pedido.compradorTelefone,
    enderecoSnap: pedido.enderecoSnap,
    subtotal: Number(pedido.subtotal),
    desconto: Number(pedido.desconto),
    frete: Number(pedido.frete),
    total: Number(pedido.total),
    itens: pedido.itens.map((it) => ({
      sku: it.produtoSku,
      nome: it.produtoNome,
      quantidade: it.quantidade,
      precoUnit: Number(it.precoUnit),
    })),
  }

  // ── Chamada ao Tiny ───────────────────────────────────────────────────────────
  const outcome = await criarOuLocalizarPedidoTiny(input)

  if (outcome.ok) {
    await prisma.pedido.update({
      where: { id: pedido.id },
      data: {
        tinyPedidoId: outcome.tinyPedidoId,
        tinySyncStatus: 'ENVIADO',
        tinySyncAt: new Date(),
        tinyErro: null,
        tinyPayload: outcome.raw || null,
      },
    })
    void logAudit({
      ...SYSTEM_ACTOR,
      acao: 'tiny.pedido.sincronizado',
      recurso: 'Pedido',
      recursoId: pedido.id,
      detalhe: { numero: pedido.numero, tinyPedidoId: outcome.tinyPedidoId, jaExistia: outcome.jaExistia },
    })
    logger.info('tiny-sync OK', { route: ROUTE, pedidoId: pedido.id, numero: pedido.numero, tinyPedidoId: outcome.tinyPedidoId, jaExistia: outcome.jaExistia })
    return NextResponse.json({ ok: true, tinyPedidoId: outcome.tinyPedidoId, jaExistia: outcome.jaExistia })
  }

  // ── Falha ─────────────────────────────────────────────────────────────────────
  // Tiny desligou no meio do caminho (token removido) — não retenta.
  if (outcome.erro === TINY_DISABLED) {
    await prisma.pedido.update({ where: { id: pedido.id }, data: { tinySyncStatus: 'PENDENTE' } })
    logger.warn('tiny-sync abortado — integração ficou desligada', { route: ROUTE, pedidoId: pedido.id })
    return NextResponse.json({ ok: true, skipped: 'tiny_disabled' })
  }

  // Erro real do Tiny → grava ERRO e responde 500 para o QStash retentar.
  await prisma.pedido.update({
    where: { id: pedido.id },
    data: { tinySyncStatus: 'ERRO', tinySyncAt: new Date(), tinyErro: outcome.erro, tinyPayload: outcome.raw || null },
  })
  void logAudit({
    ...SYSTEM_ACTOR,
    acao: 'tiny.pedido.erro',
    recurso: 'Pedido',
    recursoId: pedido.id,
    detalhe: { numero: pedido.numero, erro: outcome.erro, codigoErro: outcome.codigoErro },
  })
  logger.error('tiny-sync ERRO', { route: ROUTE, pedidoId: pedido.id, numero: pedido.numero, erro: outcome.erro })
  return NextResponse.json({ erro: outcome.erro }, { status: 500 })
}
