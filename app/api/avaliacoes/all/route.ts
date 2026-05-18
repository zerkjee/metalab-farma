import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

const AVATAR_COLORS = [
  '#7c3aed', '#059669', '#dc2626', '#d97706', '#0284c7',
  '#db2777', '#16a34a', '#9333ea', '#ea580c', '#0891b2',
]

function avatarColor(id: string): string {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}

export async function GET() {
  try {
    const avaliacoes = await prisma.avaliacao.findMany({
      where: { aprovada: true },
      orderBy: { criadoEm: 'desc' },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            enderecos: { select: { cidade: true, estado: true }, take: 1 },
          },
        },
        produto: {
          select: { id: true, nome: true, imagemUrl: true, corPrincipal: true },
        },
      },
    })

    const lista = avaliacoes.map((a) => {
      const partes = a.usuario.nome.split(' ')
      const ender = a.usuario.enderecos[0]
      return {
        id: a.id,
        productId: a.produto.id,
        productName: a.produto.nome,
        productImage: a.produto.imagemUrl ?? null,
        productColor: a.produto.corPrincipal ?? '#7c3aed',
        customerName: a.usuario.nome,
        customerCity: ender?.cidade ?? '',
        customerState: ender?.estado ?? '',
        customerInitials: ((partes[0]?.[0] ?? '') + (partes[1]?.[0] ?? '')).toUpperCase(),
        avatarColor: avatarColor(a.usuario.id),
        rating: a.nota,
        title: a.titulo ?? '',
        comment: a.texto ?? '',
        date: a.criadoEm.toISOString().slice(0, 10),
        verified: true,
      }
    })

    const agg = lista.reduce(
      (acc, a) => {
        acc.total++
        acc.soma += a.rating
        acc.dist[a.rating as 1 | 2 | 3 | 4 | 5]++
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
    logger.error('Erro listando todas as avaliações', error)
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 })
  }
}
