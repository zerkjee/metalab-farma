import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { enqueueJob } from '@/lib/qstash'
import { cartRatelimit, getIp } from '@/lib/rateLimit'
import { logger } from '@/lib/logger'

const cartSchema = z.object({
  email: z.string().email(),
  nome: z.string().max(80).optional(),
  itens: z.array(z.object({
    nome: z.string().max(200),
    quantidade: z.number().int().min(1).max(99),
    precoUnit: z.number().min(0),
  })).min(1).max(50),
  cupomCodigo: z.string().max(20).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const { success } = await cartRatelimit.limit(getIp(request))
    if (!success) return NextResponse.json({ ok: true })

    const parsed = cartSchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) return NextResponse.json({ ok: true })
    const body = parsed.data

    // Calcular total no servidor — não confiar no valor enviado pelo cliente
    const serverTotal = body.itens.reduce((acc, item) => acc + item.precoUnit * item.quantidade, 0)

    const existing = await prisma.cartSession.findFirst({
      where: { email: body.email, convertido: false },
      orderBy: { atualizadoEm: 'desc' },
      select: { id: true },
    })

    let sessionId: string

    if (existing) {
      await prisma.cartSession.update({
        where: { id: existing.id },
        data: {
          nome: body.nome,
          itens: body.itens,
          total: serverTotal,
          cupomCodigo: body.cupomCodigo,
        },
      })
      sessionId = existing.id
    } else {
      const created = await prisma.cartSession.create({
        data: {
          email: body.email,
          nome: body.nome,
          itens: body.itens,
          total: serverTotal,
          cupomCodigo: body.cupomCodigo,
        },
      })
      sessionId = created.id

      // Anti-abuse: só agenda os jobs (e-mail + cupom de 10%) se este e-mail não
      // recebeu um fluxo de abandono nas últimas 24h — independe de `convertido`,
      // pra impedir gerar cupom repetido ou mandar spam pro mesmo destinatário
      // criando sessões novas em sequência. Endpoint é público e sem CAPTCHA
      // (roda em background enquanto o cliente digita o e-mail no checkout).
      const desde24h = new Date(Date.now() - 24 * 60 * 60 * 1000)
      const recente = await prisma.cartSession.count({
        where: { email: body.email, criadoEm: { gte: desde24h }, id: { not: sessionId } },
      })

      if (recente === 0) {
        void enqueueJob('/api/jobs/abandoned-cart', { cartSessionId: sessionId, stage: '1h' }, 60 * 60)
        void enqueueJob('/api/jobs/abandoned-cart', { cartSessionId: sessionId, stage: '24h' }, 24 * 60 * 60)
      } else {
        logger.info('Abandoned-cart jobs pulados — e-mail já recebeu fluxo nas últimas 24h', { route: 'POST /api/cart/save' })
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    logger.error('Erro salvando cart session', error)
    return NextResponse.json({ ok: true })
  }
}
