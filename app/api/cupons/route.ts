import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

// POST /api/cupons — validar cupom (público)
export async function POST(request: NextRequest) {
  try {
    const { codigo, subtotal } = await request.json()

    if (!codigo) {
      return NextResponse.json({ erro: "Código obrigatório" }, { status: 400 })
    }

    const cupom = await prisma.cupom.findUnique({
      where: { codigo: codigo.toUpperCase().trim() },
    })

    if (!cupom || !cupom.ativo) {
      return NextResponse.json({ erro: "Cupom inválido ou inativo" }, { status: 404 })
    }

    if (cupom.validade && new Date(cupom.validade) < new Date()) {
      return NextResponse.json({ erro: "Cupom expirado" }, { status: 400 })
    }

    if (cupom.usoMaximo && cupom.usoAtual >= cupom.usoMaximo) {
      return NextResponse.json({ erro: "Cupom esgotado" }, { status: 400 })
    }

    let desconto = 0
    let freteGratis = false

    if (cupom.tipo === "PERCENTUAL") {
      desconto = (subtotal * Number(cupom.valor)) / 100
    } else if (cupom.tipo === "VALOR_FIXO") {
      desconto = Math.min(Number(cupom.valor), subtotal)
    } else if (cupom.tipo === "FRETE_GRATIS") {
      freteGratis = true
    }

    return NextResponse.json({
      codigo: cupom.codigo,
      tipo: cupom.tipo,
      valor: Number(cupom.valor),
      desconto,
      freteGratis,
    })
  } catch (error) {
    console.error("[POST /api/cupons]", error)
    return NextResponse.json({ erro: "Erro interno" }, { status: 500 })
  }
}

// GET /api/cupons — listar todos (apenas admin)
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.role?.includes("ADMIN")) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 })
    }

    const cupons = await prisma.cupom.findMany({
      orderBy: { id: "desc" },
    })

    return NextResponse.json(cupons)
  } catch (error) {
    return NextResponse.json({ erro: "Erro interno" }, { status: 500 })
  }
}
