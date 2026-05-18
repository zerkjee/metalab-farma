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
  total: z.number().min(0),
  cupomCodigo: z.string().max(20).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const { success } = await cartRatelimit.limit(getIp(request))
    if (!success) return NextResponse.json({ ok: true })

    const parsed = cartSchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) return NextResponse.json({ ok: true })
    const body = parsed.data

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
          total: body.total,
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
          total: body.total,
          cupomCodigo: body.cupomCodigo,
        },
      })
      sessionId = created.id
      // Only schedule jobs on first cart save (new session)
      void enqueueJob('/api/jobs/abandoned-cart', { cartSessionId: sessionId, stage: '1h' }, 60 * 60)
      void enqueueJob('/api/jobs/abandoned-cart', { cartSessionId: sessionId, stage: '24h' }, 24 * 60 * 60)
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    logger.error('Erro salvando cart session', error)
    return NextResponse.json({ ok: true })
  }
}
