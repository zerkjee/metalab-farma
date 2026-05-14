import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

type Params = { params: Promise<{ pedidoId: string }> }

// GET /api/pagamento/status/:pedidoId — o frontend consulta isto em loop
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { pedidoId } = await params

    const pedido = await prisma.pedido.findUnique({
      where: { id: pedidoId },
      select: {
        id: true,
        numero: true,
        status: true,
        pago: true,
        pagoEm: true,
        total: true,
        pixQrCode: true,
        pixQrCodeBase64: true,
      },
    })

    if (!pedido) {
      return NextResponse.json({ erro: "Pedido não encontrado" }, { status: 404 })
    }

    return NextResponse.json(pedido)
  } catch (error) {
    return NextResponse.json({ erro: "Erro interno" }, { status: 500 })
  }
}
