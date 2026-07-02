import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPixExpiryEmail } from '@/lib/resend'
import { logger } from '@/lib/logger'
import { verifyQStashRequest } from '@/lib/qstashAuth'

export async function POST(request: NextRequest) {
  const bodyText = await request.text()
  const route = 'POST /api/jobs/pix-expiry'

  const verify = await verifyQStashRequest('/api/jobs/pix-expiry', bodyText, request.headers.get('Upstash-Signature'))
  if (!verify.valid) {
    logger.warn(verify.reason, { route })
    return NextResponse.json({ erro: verify.reason }, { status: verify.httpStatus })
  }

  try {
    const { pedidoId, stage = 'email' } = JSON.parse(bodyText) as { pedidoId: string; stage?: 'email' | 'cancel' }

    const pedido = await prisma.pedido.findUnique({
      where: { id: pedidoId },
      select: {
        id: true, numero: true, compradorNome: true, compradorEmail: true, total: true, pago: true, status: true,
        itens: { select: { produtoId: true, quantidade: true } },
      },
    })

    if (!pedido || pedido.pago || pedido.status !== 'AGUARDANDO_PAGAMENTO') {
      logger.info('PIX expiry job: pedido já pago ou cancelado, skip', { pedidoId, stage })
      return NextResponse.json({ ok: true, skipped: true })
    }

    if (stage === 'cancel') {
      // Safety net: cancela pedido e restaura estoque se webhook MP nunca chegou
      await prisma.$transaction([
        prisma.pedido.update({ where: { id: pedido.id }, data: { status: 'CANCELADO' } }),
        ...pedido.itens.map((item) =>
          prisma.produto.update({
            where: { id: item.produtoId },
            data: { estoque: { increment: item.quantidade } },
          }),
        ),
      ])
      logger.info('Pedido cancelado por timeout (PIX não pago) — estoque restaurado', { pedidoId, numero: pedido.numero })
      return NextResponse.json({ ok: true, cancelled: true })
    }

    // stage === 'email' (padrão): só envia o e-mail de recovery
    await sendPixExpiryEmail({
      numero: pedido.numero,
      compradorNome: pedido.compradorNome,
      compradorEmail: pedido.compradorEmail,
      total: Number(pedido.total),
      pedidoId: pedido.id,
    })

    logger.info('E-mail PIX expirado enviado', { pedidoId, numero: pedido.numero })
    return NextResponse.json({ ok: true })
  } catch (error) {
    logger.error('Falha no job pix-expiry', error)
    return NextResponse.json({ erro: 'Falha interna' }, { status: 500 })
  }
}
