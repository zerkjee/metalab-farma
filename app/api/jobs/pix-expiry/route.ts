import { NextRequest, NextResponse } from 'next/server'
import { Receiver } from '@upstash/qstash'
import { prisma } from '@/lib/prisma'
import { sendPixExpiryEmail } from '@/lib/resend'
import { logger } from '@/lib/logger'

const BASE = process.env.NEXT_PUBLIC_URL ?? 'https://metalab-farma.vercel.app'

const receiver =
  process.env.QSTASH_CURRENT_SIGNING_KEY
    ? new Receiver({
        currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY,
        nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY ?? '',
      })
    : null

export async function POST(request: NextRequest) {
  const bodyText = await request.text()

  if (receiver) {
    const signature = request.headers.get('Upstash-Signature') ?? ''
    const isValid = await receiver
      .verify({ signature, body: bodyText, url: `${BASE}/api/jobs/pix-expiry` })
      .catch(() => false)

    if (!isValid) {
      logger.warn('Assinatura QStash inválida', { route: 'POST /api/jobs/pix-expiry' })
      return NextResponse.json({ erro: 'Assinatura inválida' }, { status: 401 })
    }
  }

  try {
    const { pedidoId } = JSON.parse(bodyText) as { pedidoId: string }

    const pedido = await prisma.pedido.findUnique({
      where: { id: pedidoId },
      select: { id: true, numero: true, compradorNome: true, compradorEmail: true, total: true, pago: true, status: true },
    })

    if (!pedido || pedido.pago || pedido.status !== 'AGUARDANDO_PAGAMENTO') {
      logger.info('PIX expiry job: pedido já pago ou cancelado, skip', { pedidoId })
      return NextResponse.json({ ok: true, skipped: true })
    }

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
