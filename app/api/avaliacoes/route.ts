import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { logger } from '@/lib/logger'
import { avaliacaoRatelimit, getIp } from '@/lib/rateLimit'

const createSchema = z.object({
  produtoId: z.string().min(1),
  nota: z.number().int().min(1).max(5),
  titulo: z.string().min(2).max(120).optional(),
  texto: z.string().min(5).max(2000).optional(),
})

// GET /api/avaliacoes?produtoId=X — lista avaliações aprovadas
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const produtoId = searchParams.get('produtoId')
  if (!produtoId) return NextResponse.json({ erro: 'produtoId é obrigatório' }, { status: 400 })

  try {
    const avaliacoes = await prisma.avaliacao.findMany({
      where: { produtoId, aprovada: true },
      orderBy: { criadoEm: 'desc' },
      include: {
        usuario: {
          select: {
            nome: true,
            enderecos: { select: { cidade: true, estado: true }, take: 1 },
          },
        },
      },
    })

    const lista = avaliacoes.map((a) => {
      const partes = a.usuario.nome.split(' ')
      const ender = a.usuario.enderecos[0]
      return {
        id: a.id,
        nota: a.nota,
        titulo: a.titulo ?? '',
        texto: a.texto ?? '',
        data: a.criadoEm.toISOString(),
        cliente: {
          primeiroNome: partes[0],
          iniciais: ((partes[0]?.[0] ?? '') + (partes[1]?.[0] ?? '')).toUpperCase(),
          cidade: ender?.cidade ?? '',
          estado: ender?.estado ?? '',
        },
        verificada: true,
      }
    })

    const agg = lista.reduce(
      (acc, a) => {
        acc.total++
        acc.soma += a.nota
        acc.dist[a.nota as 1 | 2 | 3 | 4 | 5]++
        return acc
      },
      { total: 0, soma: 0, dist: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<1 | 2 | 3 | 4 | 5, number> },
    )

    return NextResponse.json({
      avaliacoes: lista,
      resumo: {
        total: agg.total,
        media: agg.total ? +(agg.soma / agg.total).toFixed(1) : 0,
        distribuicao: agg.dist,
      },
    })
  } catch (error) {
    logger.error('Erro listando avaliações', error)
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 })
  }
}

// POST /api/avaliacoes — criar (login + ter comprado o produto)
export async function POST(request: NextRequest) {
  try {
    const { success } = await avaliacaoRatelimit.limit(getIp(request))
    if (!success) {
      return NextResponse.json({ erro: 'Muitas avaliações. Aguarde antes de enviar outra.' }, { status: 429 })
    }

    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ erro: 'Login necessário para avaliar' }, { status: 401 })
    }

    const parsed = createSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ erro: 'Dados inválidos' }, { status: 400 })
    }
    const { produtoId, nota, titulo, texto } = parsed.data

    // Verificar se usuário comprou e o pedido foi pago
    const comprou = await prisma.itemPedido.findFirst({
      where: {
        produtoId,
        pedido: { usuarioId: session.user.id, pago: true },
      },
      select: { id: true },
    })

    if (!comprou) {
      return NextResponse.json({ erro: 'Você precisa ter comprado o produto' }, { status: 403 })
    }

    // Uma avaliação por usuário/produto
    const existente = await prisma.avaliacao.findFirst({
      where: { produtoId, usuarioId: session.user.id },
      select: { id: true },
    })
    if (existente) {
      return NextResponse.json({ erro: 'Você já avaliou este produto' }, { status: 409 })
    }

    const avaliacao = await prisma.avaliacao.create({
      data: {
        produtoId,
        usuarioId: session.user.id,
        nota,
        titulo,
        texto,
        aprovada: false,
      },
      select: { id: true },
    })

    logger.info('Avaliação criada — aguardando moderação', { route: 'POST /api/avaliacoes', avaliacaoId: avaliacao.id })
    return NextResponse.json({ ok: true, id: avaliacao.id, mensagem: 'Avaliação enviada para moderação' }, { status: 201 })
  } catch (error) {
    logger.error('Erro ao criar avaliação', error)
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 })
  }
}
