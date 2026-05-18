import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { logger } from "@/lib/logger"
import { pollingRatelimit, getIp } from "@/lib/rateLimit"

type Params = { params: Promise<{ pedidoId: string }> }

// GET /api/pagamento/status/:pedidoId — polling de confirmação de pagamento
// - Autenticado como dono ou admin: retorna dados completos
// - Não autenticado: retorna apenas { pago, status } para polling anônimo
// - O QR Code já é retornado por /api/pagamento/criar, não precisa ser re-exposto aqui
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { success } = await pollingRatelimit.limit(getIp(req))
    if (!success) {
      return NextResponse.json({ erro: "Muitas requisições. Aguarde." }, { status: 429 })
    }

    const { pedidoId } = await params
    const session = await auth()

    const pedido = await prisma.pedido.findUnique({
      where: { id: pedidoId },
      select: {
        id: true,
        numero: true,
        status: true,
        pago: true,
        pagoEm: true,
        total: true,
        usuarioId: true,
      },
    })

    if (!pedido) {
      return NextResponse.json({ erro: "Pedido não encontrado" }, { status: 404 })
    }

    const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN"
    const isOwner = session?.user?.id && session.user.id === pedido.usuarioId

    if (isAdmin || isOwner) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { usuarioId: _, ...dados } = pedido
      return NextResponse.json({ ...dados, total: Number(dados.total) })
    }

    // Unauthenticated or different user: only return polling data
    return NextResponse.json({ pago: pedido.pago, status: pedido.status })
  } catch (error) {
    logger.error("Erro consultando status de pagamento", error)
    return NextResponse.json({ erro: "Erro interno" }, { status: 500 })
  }
}
