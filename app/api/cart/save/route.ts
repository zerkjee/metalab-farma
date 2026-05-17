import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { enqueueJob } from '@/lib/qstash'
import { cartRatelimit, getIp } from '@/lib/rateLimit'

export async function POST(request: NextRequest) {
  try {
    const { success } = await cartRatelimit.limit(getIp(request))
    if (!success) return NextResponse.json({ ok: true })

    const body = await request.json() as {
      email: string
      nome?: string
      itens: { nome: string; quantidade: number; precoUnit: number }[]
      total: number
      cupomCodigo?: string
    }

    if (!body.email || !body.itens?.length) {
      return NextResponse.json({ ok: true })
    }

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
  } catch {
    return NextResponse.json({ ok: true })
  }
}
