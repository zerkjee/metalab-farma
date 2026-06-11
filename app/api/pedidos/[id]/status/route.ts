import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { pollingRatelimit, getIp } from "@/lib/rateLimit"
import { logger } from "@/lib/logger"

type Params = { params: Promise<{ id: string }> }

// GET /api/pedidos/:id/status — acompanhamento de pedido para CONVIDADO (sem login).
// Retorna apenas campos seguros para exibição (sem CPF, e-mail, endereço).
// O id é um cuid não-enumerável; é a "chave" que o navegador do comprador guardou.
export async function GET(req: NextRequest, { params }: Params) {
  const { success } = await pollingRatelimit.limit(getIp(req))
  if (!success) {
    return NextResponse.json({ erro: "Muitas consultas. Aguarde alguns instantes." }, { status: 429 })
  }

  try {
    const { id } = await params

    const pedido = await prisma.pedido.findUnique({
      where: { id },
      select: {
        id: true,
        numero: true,
        status: true,
        metodoPagamento: true,
        pago: true,
        criadoEm: true,
        codigoRastreio: true,
        subtotal: true,
        desconto: true,
        frete: true,
        total: true,
        itens: {
          select: {
            id: true,
            produtoNome: true,
            produtoImagem: true,
            quantidade: true,
            precoUnit: true,
            subtotal: true,
          },
        },
      },
    })

    if (!pedido) {
      return NextResponse.json({ erro: "Pedido não encontrado" }, { status: 404 })
    }

    return NextResponse.json({
      ...pedido,
      subtotal: Number(pedido.subtotal),
      desconto: Number(pedido.desconto),
      frete: Number(pedido.frete),
      total: Number(pedido.total),
      itens: pedido.itens.map((i) => ({
        ...i,
        precoUnit: Number(i.precoUnit),
        subtotal: Number(i.subtotal),
      })),
    })
  } catch (error) {
    logger.error("Erro buscando status do pedido (convidado)", error)
    return NextResponse.json({ erro: "Erro interno" }, { status: 500 })
  }
}
