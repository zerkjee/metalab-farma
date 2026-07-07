import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { logger } from "@/lib/logger"
import { auditFromSession } from "@/lib/audit"
import { ADMIN_ORDER_SELECT, CUSTOMER_ORDER_SELECT } from "@/lib/orderSelect"
import { isAdminRole, requireAdmin } from "@/lib/adminGuard"

const patchSchema = z.object({
  status: z.enum(['AGUARDANDO_PAGAMENTO', 'PAGAMENTO_APROVADO', 'EM_SEPARACAO', 'ENVIADO', 'ENTREGUE', 'CANCELADO', 'REEMBOLSADO']).optional(),
  codigoRastreio: z.string().max(100).nullable().optional(),
})

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await auth()
    const { id } = await params

    // Admin recebe os campos de plumbing Tiny (ADMIN_ORDER_SELECT); o cliente dono
    // do pedido recebe apenas CUSTOMER_ORDER_SELECT (sem vazar dados internos do ERP).
    const isAdmin = isAdminRole(session?.user?.role)

    const pedido = await prisma.pedido.findUnique({
      where: { id },
      select: isAdmin ? ADMIN_ORDER_SELECT : CUSTOMER_ORDER_SELECT,
    })

    if (!pedido) {
      return NextResponse.json({ erro: "Pedido não encontrado" }, { status: 404 })
    }

    // Cliente só vê o próprio pedido
    if (!isAdmin && pedido.usuarioId !== session?.user?.id) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 })
    }

    return NextResponse.json({
      ...pedido,
      subtotal: Number(pedido.subtotal),
      desconto: Number(pedido.desconto),
      frete: Number(pedido.frete),
      total: Number(pedido.total),
    })
  } catch (error) {
    logger.error("Erro buscando pedido por id", error)
    return NextResponse.json({ erro: "Erro interno" }, { status: 500 })
  }
}

// PATCH /api/pedidos/:id — atualizar status (apenas admin)
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 })
    }

    const { id } = await params
    const parsed = patchSchema.safeParse(await request.json().catch(() => null))
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

    return NextResponse.json({
      ...pedido,
      subtotal: Number(pedido.subtotal),
      desconto: Number(pedido.desconto),
      frete: Number(pedido.frete),
      total: Number(pedido.total),
    })
  } catch (error) {
    logger.error("Erro atualizando pedido", error)
    return NextResponse.json({ erro: "Erro interno" }, { status: 500 })
  }
}
