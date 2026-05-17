import { NextRequest, NextResponse } from 'next/server'
import { Receiver } from '@upstash/qstash'
import { prisma } from '@/lib/prisma'
import { sendAbandonedCartEmail } from '@/lib/resend'
import { logger } from '@/lib/logger'

const BASE = process.env.NEXT_PUBLIC_URL ?? 'https://metalab-farma.vercel.app'

const receiver =
  process.env.QSTASH_CURRENT_SIGNING_KEY
    ? new Receiver({
        currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY,
        nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY ?? '',
      })
    : null

function generateCouponCode() {
  return 'VOLTA' + Math.random().toString(36).slice(2, 7).toUpperCase()
}

export async function POST(request: NextRequest) {
  const bodyText = await request.text()

  if (receiver) {
    const signature = request.headers.get('Upstash-Signature') ?? ''
    const isValid = await receiver
      .verify({ signature, body: bodyText, url: `${BASE}/api/jobs/abandoned-cart` })
      .catch(() => false)

    if (!isValid) {
      logger.warn('Assinatura QStash inválida', { route: 'POST /api/jobs/abandoned-cart' })
      return NextResponse.json({ erro: 'Assinatura inválida' }, { status: 401 })
    }
  }

  try {
    const { cartSessionId, stage } = JSON.parse(bodyText) as { cartSessionId: string; stage: '1h' | '24h' }

    const cart = await prisma.cartSession.findUnique({
      where: { id: cartSessionId },
    })

    if (!cart || cart.convertido) {
      logger.info('Abandoned cart job: carrinho convertido ou inexistente, skip', { cartSessionId })
      return NextResponse.json({ ok: true, skipped: true })
    }

    const itens = cart.itens as { nome: string; quantidade: number; precoUnit: number }[]

    if (stage === '1h') {
      await sendAbandonedCartEmail({
        email: cart.email,
        nome: cart.nome ?? undefined,
        items: itens,
        total: Number(cart.total),
        cupomCodigo: cart.cupomCodigo ?? undefined,
      })
      logger.info('E-mail carrinho abandonado (1h) enviado', { cartSessionId, email: cart.email })
    } else {
      // 24h: gerar cupom de 10% e enviar
      const codigo = generateCouponCode()
      const expira = new Date(Date.now() + 48 * 60 * 60 * 1000)

      await prisma.cupom.create({
        data: {
          codigo,
          valor: 10,
          tipo: 'PERCENTUAL',
          ativo: true,
          validade: expira,
          usoMaximo: 1,
        },
      })

      await sendAbandonedCartEmail({
        email: cart.email,
        nome: cart.nome ?? undefined,
        items: itens,
        total: Number(cart.total),
        cupomCodigo: codigo,
        cupomDesconto: '10%',
      })

      logger.info('E-mail carrinho abandonado (24h) com cupom enviado', { cartSessionId, email: cart.email, codigo })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    logger.error('Falha no job abandoned-cart', error)
    return NextResponse.json({ erro: 'Falha interna' }, { status: 500 })
  }
}
