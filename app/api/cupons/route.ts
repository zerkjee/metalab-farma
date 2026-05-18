import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { cupomRatelimit } from "@/lib/rateLimit"
import { logger } from "@/lib/logger"

const cupomSchema = z.object({
  codigo: z.string().min(3).max(20).regex(/^[A-Za-z0-9_-]+$/, "Código inválido"),
  subtotal: z.number().min(0),
})

// Delay artificial para dificultar brute force (sem revelar o motivo do erro)
function invalidCouponResponse() {
  return new Promise<NextResponse>((resolve) =>
    setTimeout(
      () => resolve(NextResponse.json({ erro: "Cupom inválido" }, { status: 404 })),
      400
    )
  )
}

// POST /api/cupons — validar cupom (público)
export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous"
    const { success } = await cupomRatelimit.limit(ip)
    if (!success) {
      return NextResponse.json({ erro: "Muitas tentativas. Tente novamente em alguns minutos." }, { status: 429 })
    }

    const body = await request.json()
    const parsed = cupomSchema.safeParse(body)

    if (!parsed.success) {
      return invalidCouponResponse()
    }

    const { codigo, subtotal } = parsed.data

    const cupom = await prisma.cupom.findUnique({
      where: { codigo: codigo.toUpperCase().trim() },
    })

    if (!cupom || !cupom.ativo) {
      return invalidCouponResponse()
    }

    if (cupom.validade && new Date(cupom.validade) < new Date()) {
      return invalidCouponResponse()
    }

    if (cupom.usoMaximo && cupom.usoAtual >= cupom.usoMaximo) {
      return invalidCouponResponse()
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
    logger.error("Erro validando cupom público", error)
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
    logger.error("Erro listando cupons", error)
    return NextResponse.json({ erro: "Erro interno" }, { status: 500 })
  }
}
