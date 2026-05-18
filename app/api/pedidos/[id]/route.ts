import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { logger } from "@/lib/logger"
import { auditFromSession } from "@/lib/audit"

const patchSchema = z.object({
  status: z.enum(['AGUARDANDO_PAGAMENTO', 'PAGAMENTO_APROVADO', 'EM_SEPARACAO', 'ENVIADO', 'ENTREGUE', 'CANCELADO', 'REEMBOLSADO']).optional(),
  codigoRastreio: z.string().max(100).nullable().optional(),
})

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
    const parsed = patchSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ erro: "Dados inválidos", detalhes: parsed.error.issues }, { status: 400 })
    }
    const { status, codigoRastreio } = parsed.data

    const pedido = await prisma.pedido.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(codigoRastreio !== undefined && { codigoRastreio }),
        ...(status === "ENVIADO" && { enviadoEm: new Date() }),
      },
    })

    auditFromSession(session, request, {
      acao: status === "REEMBOLSADO" ? "pedido.reembolsado" : "pedido.atualizado",
      recurso: "pedido",
      recursoId: pedido.id,
      detalhe: {
        numero: pedido.numero,
        status,
        codigoRastreio: codigoRastreio ?? undefined,
      },
    })

    return NextResponse.json(pedido)
  } catch (error) {
    logger.error("Erro atualizando pedido", error)
    return NextResponse.json({ erro: "Erro interno" }, { status: 500 })
  }
}
