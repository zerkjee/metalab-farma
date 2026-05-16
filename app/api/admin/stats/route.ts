import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { StatusPedido } from "@prisma/client"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.role?.includes("ADMIN")) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 })
    }

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    const statusPago = { notIn: [StatusPedido.CANCELADO, StatusPedido.REEMBOLSADO] }

    const [
      pedidosMes,
      pedidosMesPassado,
      clientesMes,
      clientesTotal,
      produtosAtivos,
      produtosEstoqueBaixo,
      cuponsAtivos,
    ] = await Promise.all([
      prisma.pedido.findMany({
        where: { criadoEm: { gte: startOfMonth }, status: statusPago },
        select: { total: true, criadoEm: true },
      }),
      prisma.pedido.findMany({
        where: { criadoEm: { gte: startOfLastMonth, lte: endOfLastMonth }, status: statusPago },
        select: { total: true },
      }),
      prisma.usuario.count({
        where: { criadoEm: { gte: startOfMonth }, papel: "CLIENTE" },
      }),
      prisma.usuario.count({ where: { papel: "CLIENTE" } }),
      prisma.produto.count({ where: { ativo: true } }),
      prisma.produto.count({ where: { ativo: true, estoque: { lte: 5 } } }),
      prisma.cupom.count({ where: { ativo: true } }),
    ])

    const faturamentoMes = pedidosMes.reduce((s, p) => s + Number(p.total), 0)
    const faturamentoMesPassado = pedidosMesPassado.reduce((s, p) => s + Number(p.total), 0)
    const ticketMedio = pedidosMes.length > 0 ? faturamentoMes / pedidosMes.length : 0

    const pctFaturamento = faturamentoMesPassado > 0
      ? ((faturamentoMes - faturamentoMesPassado) / faturamentoMesPassado) * 100
      : 0

    // Receita dos últimos 7 dias para sparkline
    const revenueByDay: Record<string, number> = {}
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      revenueByDay[d.toISOString().slice(0, 10)] = 0
    }
    pedidosMes.forEach((p) => {
      const day = p.criadoEm.toISOString().slice(0, 10)
      if (day in revenueByDay) {
        revenueByDay[day] += Number(p.total)
      }
    })

    const [ultimos10Pedidos, pedidosReembolsados] = await Promise.all([
      prisma.pedido.findMany({
        orderBy: { criadoEm: "desc" },
        take: 10,
        select: {
          id: true,
          numero: true,
          compradorNome: true,
          compradorEmail: true,
          total: true,
          status: true,
          metodoPagamento: true,
          criadoEm: true,
        },
      }),
      prisma.pedido.findMany({
        where: { status: { in: [StatusPedido.CANCELADO, StatusPedido.REEMBOLSADO] } },
        orderBy: { criadoEm: "desc" },
        select: {
          id: true,
          numero: true,
          compradorNome: true,
          compradorEmail: true,
          total: true,
          status: true,
          metodoPagamento: true,
          criadoEm: true,
        },
      }),
    ])

    const reembolsosMes = pedidosReembolsados
      .filter((p) => p.criadoEm >= startOfMonth)
      .reduce((s, p) => s + Number(p.total), 0)

    return NextResponse.json({
      faturamentoMes,
      faturamentoMesPassado,
      pctFaturamento: Math.round(pctFaturamento * 10) / 10,
      pedidosMes: pedidosMes.length,
      pedidosMesPassado: pedidosMesPassado.length,
      clientesMes,
      clientesTotal,
      ticketMedio,
      produtosAtivos,
      produtosEstoqueBaixo,
      cuponsAtivos,
      sparklinesReceita: Object.values(revenueByDay),
      reembolsosMes,
      reembolsosCount: pedidosReembolsados.length,
      pedidosReembolsados: pedidosReembolsados.map((p) => ({
        ...p,
        total: Number(p.total),
      })),
      recentOrders: ultimos10Pedidos.map((p) => ({
        ...p,
        total: Number(p.total),
      })),
    })
  } catch (error) {
    console.error("[GET /api/admin/stats]", error)
    return NextResponse.json({ erro: "Erro interno" }, { status: 500 })
  }
}
