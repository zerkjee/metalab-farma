import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/adminGuard"
import { logger } from "@/lib/logger"
import { ADMIN_ORDER_SELECT } from "@/lib/orderSelect"

// GET /api/admin/pedidos — lista TODOS os pedidos da loja (visão admin).
//
// Diferente de GET /api/pedidos, que devolve apenas os pedidos do próprio usuário
// logado (área do cliente). O painel admin (app/admin/pedidos/page.tsx) usa esta
// rota para ter a visão geral + campos de plumbing Tiny (via ADMIN_ORDER_SELECT),
// que NÃO são expostos ao cliente. Protegida por requireAdmin.
export async function GET() {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 })
    }

    const pedidos = await prisma.pedido.findMany({
      select: ADMIN_ORDER_SELECT,
      orderBy: { criadoEm: "desc" },
      take: 200,
    })

    return NextResponse.json(
      pedidos.map((p) => ({
        ...p,
        subtotal: Number(p.subtotal),
        desconto: Number(p.desconto),
        frete: Number(p.frete),
        total: Number(p.total),
      }))
    )
  } catch (error) {
    logger.error("Erro listando pedidos (admin)", error)
    return NextResponse.json({ erro: "Erro interno" }, { status: 500 })
  }
}
