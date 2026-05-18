import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/adminGuard'
import { logger } from '@/lib/logger'

export async function GET() {
  try {
    const session = await requireAdmin()
    if (!session) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })

    const since = new Date(Date.now() - 6 * 60 * 60 * 1000)

    const [novoPedidos, pagamentosAprovados, estoqueBaixo] = await Promise.all([
      prisma.pedido.findMany({
        where: { criadoEm: { gte: since }, status: 'AGUARDANDO_PAGAMENTO' },
        select: { id: true, numero: true, compradorNome: true, criadoEm: true },
        orderBy: { criadoEm: 'desc' },
        take: 10,
      }),
      prisma.pedido.findMany({
        where: { pagoEm: { gte: since }, pago: true },
        select: { id: true, numero: true, compradorNome: true, pagoEm: true, criadoEm: true },
        orderBy: { pagoEm: 'desc' },
        take: 10,
      }),
      prisma.produto.findMany({
        where: { ativo: true, estoque: { lte: 5 } },
        select: { id: true, nome: true, estoque: true, estoqueMin: true },
        take: 10,
      }),
    ])

    type Notif = { id: string; tipo: string; texto: string; link: string; criadoEm: string }
    const notifications: Notif[] = [
      ...novoPedidos.map((p) => ({
        id: `order-${p.id}`,
        tipo: 'pedido',
        texto: `Novo pedido ${p.numero} — ${p.compradorNome.split(' ')[0]}`,
        link: `/admin/pedidos/${p.id}`,
        criadoEm: p.criadoEm.toISOString(),
      })),
      ...pagamentosAprovados.map((p) => ({
        id: `pay-${p.id}`,
        tipo: 'pagamento',
        texto: `Pagamento aprovado ${p.numero} — ${p.compradorNome.split(' ')[0]}`,
        link: `/admin/pedidos/${p.id}`,
        criadoEm: (p.pagoEm ?? p.criadoEm).toISOString(),
      })),
      ...estoqueBaixo.map((p) => ({
        id: `stock-${p.id}`,
        tipo: 'estoque',
        texto: `Estoque baixo: ${p.nome} (${p.estoque} un.)`,
        link: `/admin/produtos`,
        criadoEm: new Date().toISOString(),
      })),
    ].sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime())

    return NextResponse.json({ notifications, total: notifications.length })
  } catch (error) {
    logger.error('Erro buscando notificações admin', error)
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 })
  }
}
