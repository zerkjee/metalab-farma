import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { logger } from "@/lib/logger"
import { z } from "zod"

// GET /api/categorias — público
export async function GET() {
  try {
    const categorias = await prisma.categoria.findMany({
      orderBy: [{ ordem: "asc" }, { nome: "asc" }],
      select: { id: true, nome: true, slug: true, ordem: true },
    })
    return NextResponse.json({ categorias }, {
      headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=600' },
    })
  } catch (error) {
    logger.error("Erro listando categorias", error)
    return NextResponse.json({ erro: "Erro interno" }, { status: 500 })
  }
}

// POST /api/categorias — apenas admin
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.role?.includes("ADMIN")) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json().catch(() => null)
    const schema = z.object({
      nome: z.string().min(2),
      slug: z.string().min(2),
      ordem: z.number().int().min(0).optional(),
    })
    const data = schema.parse(body)

    const categoria = await prisma.categoria.create({ data })
    return NextResponse.json(categoria, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ erro: "Dados inválidos", detalhes: error.issues }, { status: 400 })
    }
    logger.error("Erro criando categoria", error)
    return NextResponse.json({ erro: "Erro interno" }, { status: 500 })
  }
}
