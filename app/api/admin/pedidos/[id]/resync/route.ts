import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/adminGuard'
import { enqueueTinySync } from '@/lib/qstash'
import { logger } from '@/lib/logger'

// POST /api/admin/pedidos/:id/resync
// Re-enfileira a sincronização de um pedido pago com o Tiny ERP.
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdmin()
    if (!session) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })

    const { id } = await params

    const pedido = await prisma.pedido.findUnique({
      where: { id },
      select: { id: true, numero: true, pago: true },
    })

    if (!pedido) {
      return NextResponse.json({ erro: 'Pedido não encontrado' }, { status: 404 })
    }

    if (!pedido.pago) {
      return NextResponse.json({ erro: 'Pedido ainda não pago — sync não permitido' }, { status: 422 })
    }

    await enqueueTinySync(pedido.id)

    logger.info('Re-sync Tiny enfileirado manualmente', {
      adminEmail: session.user.email,
      pedidoId: pedido.id,
      pedidoNumero: pedido.numero,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    logger.error('Erro ao enfileirar re-sync Tiny', { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 })
  }
}
