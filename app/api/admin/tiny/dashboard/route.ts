import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/adminGuard'
import { logger } from '@/lib/logger'

function money(value: unknown) {
  return Number(value ?? 0)
}

export async function GET() {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
    }

    const [orders, totalProducts, lowStockProducts] = await Promise.all([
      prisma.pedido.findMany({
        orderBy: { criadoEm: 'desc' },
        take: 120,
        select: {
          id: true,
          numero: true,
          status: true,
          pago: true,
          compradorNome: true,
          compradorEmail: true,
          total: true,
          criadoEm: true,
          tinyPedidoId: true,
          tinyNumero: true,
          tinyStatus: true,
          tinySyncStatus: true,
          tinySyncAt: true,
          tinyErro: true,
          nfTinyId: true,
          nfNumero: true,
          nfSerie: true,
          nfChave: true,
          nfUrl: true,
          nfStatus: true,
          nfXmlUrl: true,
          nfErro: true,
          nfEmitidaEm: true,
          itens: {
            select: {
              produtoNome: true,
              produtoSku: true,
              quantidade: true,
            },
          },
        },
      }),
      prisma.produto.count({ where: { ativo: true } }),
      prisma.produto.count({ where: { ativo: true, estoque: { lte: 5 } } }),
    ])

    const normalized = orders.map((order) => ({
      ...order,
      total: money(order.total),
      criadoEm: order.criadoEm.toISOString(),
      tinySyncAt: order.tinySyncAt?.toISOString() ?? null,
      nfEmitidaEm: order.nfEmitidaEm?.toISOString() ?? null,
      itemSummary: order.itens.slice(0, 2).map((item) => `${item.quantidade}x ${item.produtoNome}`).join(', '),
    }))

    const paidOrders = normalized.filter((order) => order.pago)
    const readyToSend = paidOrders.filter((order) =>
      !order.tinyPedidoId &&
      order.tinySyncStatus !== 'PROCESSANDO' &&
      order.tinySyncStatus !== 'SENDING_TO_TINY' &&
      order.tinySyncStatus !== 'TINY_ORDER_CREATED'
    )
    const sent = normalized.filter((order) => Boolean(order.tinyPedidoId) || order.tinySyncStatus === 'TINY_ORDER_CREATED')
    const errors = normalized.filter((order) => ['ERRO', 'VALIDATION_ERROR', 'SYNC_ERROR'].includes(String(order.tinySyncStatus)))
    const invoicePending = sent.filter((order) => !order.nfNumero)

    return NextResponse.json({
      metrics: {
        totalOrders: normalized.length,
        paidOrders: paidOrders.length,
        readyToSend: readyToSend.length,
        sentToTiny: sent.length,
        syncErrors: errors.length,
        invoicePending: invoicePending.length,
        totalProducts,
        lowStockProducts,
      },
      orders: normalized,
      capabilities: [
        {
          key: 'orders',
          title: 'Pedidos',
          status: 'active',
          description: 'Enviar pedidos pagos, consultar status e acompanhar erros de sincronização.',
        },
        {
          key: 'invoices',
          title: 'NF-e',
          status: 'active',
          description: 'Sincronizar NF-e emitida manualmente no Tiny, DANFE e XML.',
        },
        {
          key: 'products',
          title: 'Produtos',
          status: 'planned',
          description: 'Pesquisar produtos no Tiny e comparar SKU/EAN/cadastro com a loja.',
        },
        {
          key: 'stock',
          title: 'Estoque',
          status: 'planned',
          description: 'Consultar e futuramente reconciliar saldo entre Tiny e loja.',
        },
        {
          key: 'prices',
          title: 'Preços',
          status: 'planned',
          description: 'Comparar e preparar atualização controlada de preços.',
        },
      ],
    })
  } catch (error) {
    logger.error('Erro carregando dashboard Tiny', { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 })
  }
}
