import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/adminGuard"
import { logger } from "@/lib/logger"
import { z } from "zod"

// GET /api/categorias — público. Retorna só categorias com >= 1 produto ATIVO,
// já com a contagem, para o menu/filtro nunca levar o cliente a um beco vazio.
export async function GET() {
  try {
    const [categorias, counts] = await Promise.all([
      prisma.categoria.findMany({
        orderBy: [{ ordem: "asc" }, { nome: "asc" }],
        select: { id: true, nome: true, slug: true, ordem: true },
      }),
      prisma.produto.groupBy({
        by: ["categoriaId"],
        where: { ativo: true, categoriaId: { not: null } },
        _count: { _all: true },
      }),
    ])

    const countMap = new Map(counts.map((c) => [c.categoriaId, c._count._all]))
    const comProdutos = categorias
      .map((c) => ({ ...c, totalProdutos: countMap.get(c.id) ?? 0 }))
      .filter((c) => c.totalProdutos > 0)

    return NextResponse.json({ categorias: comProdutos }, {
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
    if (!(await requireAdmin())) {
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
