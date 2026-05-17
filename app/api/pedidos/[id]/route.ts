import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { logger } from "@/lib/logger"
import { auditFromSession } from "@/lib/audit"

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await auth()
    const { id } = await params

    const pedido = await prisma.pedido.findUnique({
      where: { id },
      include: {
        itens: {
          include: { produto: { select: { nome: true, imagemUrl: true, slug: true } } },
        },
        cupom: true,
      },
    })

    if (!pedido) {
      return NextResponse.json({ erro: "Pedido não encontrado" }, { status: 404 })
    }

    // Cliente só vê o próprio pedido
    const isAdmin = session?.user?.role?.includes("ADMIN")
    if (!isAdmin && pedido.usuarioId !== session?.user?.id) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 })
    }

    return NextResponse.json(pedido)
  } catch (error) {
    logger.error("Erro buscando pedido por id", error)
    return NextResponse.json({ erro: "Erro interno" }, { status: 500 })
  }
}

// PATCH /api/pedidos/:id — atualizar status (apenas admin)
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const session = await auth()
    if (!session?.user?.role?.includes("ADMIN")) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const pedido = await prisma.pedido.update({
      where: { id },
      data: {
        status: body.status,
        codigoRastreio: body.codigoRastreio,
        enviadoEm: body.status === "ENVIADO" ? new Date() : undefined,
      },
    })

    auditFromSession(session, request, {
      acao: body.status === "REEMBOLSADO" ? "pedido.reembolsado" : "pedido.atualizado",
      recurso: "pedido",
      recursoId: pedido.id,
      detalhe: {
        numero: pedido.numero,
        status: body.status,
        codigoRastreio: body.codigoRastreio ?? undefined,
      },
    })

    return NextResponse.json(pedido)
  } catch (error) {
    logger.error("Erro atualizando pedido", error)
    return NextResponse.json({ erro: "Erro interno" }, { status: 500 })
  }
}
