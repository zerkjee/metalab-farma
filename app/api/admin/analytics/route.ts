import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { logger } from "@/lib/logger"

function fmtDia(date: Date) {
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
}

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.role?.includes("ADMIN")) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 })
    }

    const hoje = new Date()
    const inicio14d = new Date(hoje)
    inicio14d.setDate(hoje.getDate() - 13)
    inicio14d.setHours(0, 0, 0, 0)
    const inicioDia = new Date(hoje)
    inicioDia.setHours(0, 0, 0, 0)

    const [pedidos14d, itensPorProduto, pedidosPorStatus, pedidosPorMetodo, ticketAgg, clientesPorPedidos, pedidosHoje, totalPedidos] = await Promise.all([
      // Pedidos pagos dos últimos 14 dias para o gráfico de receita
      prisma.pedido.findMany({
        where: { pago: true, criadoEm: { gte: inicio14d } },
        select: { total: true, criadoEm: true },
      }),

      // Top produtos por quantidade vendida
      prisma.itemPedido.groupBy({
        by: ["produtoNome"],
        _sum: { quantidade: true, subtotal: true },
        orderBy: { _sum: { quantidade: "desc" } },
        take: 5,
      }),

      // Contagem por status
      prisma.pedido.groupBy({
        by: ["status"],
        _count: { id: true },
      }),

      // Contagem por método de pagamento (apenas pagos)
      prisma.pedido.groupBy({
        by: ["metodoPagamento"],
        where: { pago: true },
        _count: { id: true },
      }),

      // Ticket médio global
      prisma.pedido.aggregate({
        where: { pago: true },
        _avg: { total: true },
      }),

      // Clientes com pedidos pagos — para calcular LTV e taxa de recompra
      prisma.pedido.groupBy({
        by: ["usuarioId"],
        where: { pago: true, usuarioId: { not: null } },
        _count: { id: true },
        _sum: { total: true },
      }),

      // Pedidos criados hoje
      prisma.pedido.count({ where: { criadoEm: { gte: inicioDia } } }),

      // Total de pedidos (funil)
      prisma.pedido.count(),
    ])

    // Montar gráfico de receita por dia (últimos 14 dias)
    const receitaPorDia: Record<string, number> = {}
    for (let i = 0; i < 14; i++) {
      const d = new Date(inicio14d)
      d.setDate(inicio14d.getDate() + i)
      receitaPorDia[fmtDia(d)] = 0
    }
    for (const p of pedidos14d) {
      const label = fmtDia(new Date(p.criadoEm))
      if (label in receitaPorDia) {
        receitaPorDia[label] += Number(p.total)
      }
    }
    const receitaDiaria = Object.entries(receitaPorDia).map(([label, value]) => ({ label, value }))

    // Top produtos
    const cores = ["#7c3aed", "#0ea5e9", "#10b981", "#f59e0b", "#f87171"]
    const maxVendas = itensPorProduto[0]?._sum.quantidade ?? 1
    const topProdutos = itensPorProduto.map((item, i) => ({
      nome: item.produtoNome,
      vendas: item._sum.quantidade ?? 0,
      receita: Number(item._sum.subtotal ?? 0),
      pct: Math.round(((item._sum.quantidade ?? 0) / maxVendas) * 100),
      cor: cores[i] ?? "#94a3b8",
    }))

    // Pedidos por status
    const statusLabels: Record<string, string> = {
      AGUARDANDO_PAGAMENTO: "Aguardando",
      PAGAMENTO_APROVADO: "Aprovado",
      EM_SEPARACAO: "Separação",
      ENVIADO: "Enviado",
      ENTREGUE: "Entregue",
      CANCELADO: "Cancelado",
      REEMBOLSADO: "Reembolsado",
    }
    const statusCores: Record<string, string> = {
      AGUARDANDO_PAGAMENTO: "#f59e0b",
      PAGAMENTO_APROVADO: "#10b981",
      EM_SEPARACAO: "#7c3aed",
      ENVIADO: "#0ea5e9",
      ENTREGUE: "#10b981",
      CANCELADO: "#f87171",
      REEMBOLSADO: "#94a3b8",
    }
    const porStatus = pedidosPorStatus.map((s) => ({
      label: statusLabels[s.status] ?? s.status,
      value: s._count.id,
      cor: statusCores[s.status] ?? "#94a3b8",
    }))

    // Métodos de pagamento
    const metodoLabels: Record<string, string> = {
      PIX: "PIX",
      CARTAO_CREDITO: "Cartão crédito",
      CARTAO_DEBITO: "Cartão débito",
      BOLETO: "Boleto",
    }
    const metodoCores: Record<string, string> = {
      PIX: "#10b981",
      CARTAO_CREDITO: "#7c3aed",
      CARTAO_DEBITO: "#0ea5e9",
      BOLETO: "#f59e0b",
    }
    const totalPagos = pedidosPorMetodo.reduce((s, m) => s + m._count.id, 0) || 1
    const metodosPagamento = pedidosPorMetodo
      .filter((m) => m.metodoPagamento)
      .map((m) => ({
        label: metodoLabels[m.metodoPagamento!] ?? m.metodoPagamento,
        pct: Math.round((m._count.id / totalPagos) * 100),
        cor: metodoCores[m.metodoPagamento!] ?? "#94a3b8",
      }))

    // LTV e taxa de recompra
    const totalClientesComPedido = clientesPorPedidos.length
    const receitaTotalClientes = clientesPorPedidos.reduce((s, c) => s + Number(c._sum.total ?? 0), 0)
    const ltvMedio = totalClientesComPedido > 0 ? receitaTotalClientes / totalClientesComPedido : 0
    const clientesRecompra = clientesPorPedidos.filter((c) => c._count.id >= 2).length
    const taxaRecompra = totalClientesComPedido > 0
      ? Math.round((clientesRecompra / totalClientesComPedido) * 100)
      : 0

    const ticketMedio = Number(ticketAgg._avg.total ?? 0)

    // Funil de conversão
    const totalPago = pedidosPorStatus.find((s) => s.status === 'PAGAMENTO_APROVADO')?._count.id ?? 0
    const conversaoFunil = totalPedidos > 0 ? Math.round((totalPago / totalPedidos) * 100) : 0

    return NextResponse.json({
      receitaDiaria,
      topProdutos,
      porStatus,
      metodosPagamento,
      ltvMedio,
      taxaRecompra,
      ticketMedio,
      pedidosHoje,
      totalPedidos,
      totalPago,
      conversaoFunil,
    })
  } catch (error) {
    logger.error("Erro carregando analytics", error)
    return NextResponse.json({ erro: "Erro interno" }, { status: 500 })
  }
}
