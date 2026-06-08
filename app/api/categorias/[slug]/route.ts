import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { publicStock } from "@/lib/publicProduct"
import { logger } from "@/lib/logger"

type Params = { params: Promise<{ slug: string }> }

// GET /api/categorias/:slug — público.
// Categoria + produtos da categoria (preview para a mini-janela / página).
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { slug } = await params
    const { searchParams } = new URL(req.url)
    const limit = Math.min(Math.max(1, parseInt(searchParams.get("limit") ?? "8")), 50)

    const categoria = await prisma.categoria.findUnique({
      where: { slug },
      select: { id: true, nome: true, slug: true, ordem: true },
    })
    if (!categoria) {
      return NextResponse.json({ erro: "Categoria não encontrada" }, { status: 404 })
    }

    const [rows, total] = await Promise.all([
      prisma.produto.findMany({
        where: { ativo: true, categoriaId: categoria.id },
        orderBy: [{ destaque: "desc" }, { criadoEm: "desc" }],
        take: limit,
        select: {
          id: true, slug: true, nome: true, marca: true, tipo: true,
          preco: true, precoOriginal: true, estoque: true,
          imagemUrl: true, corPrincipal: true, descricaoCurta: true, tags: true,
        },
      }),
      prisma.produto.count({ where: { ativo: true, categoriaId: categoria.id } }),
    ])

    const produtos = rows.map((p) => ({
      id: p.id,
      slug: p.slug,
      nome: p.nome,
      marca: p.marca,
      tipo: p.tipo,
      preco: Number(p.preco),
      precoOriginal: p.precoOriginal != null ? Number(p.precoOriginal) : null,
      estoque: publicStock(p.estoque),
      imagemUrl: p.imagemUrl ?? null,
      corPrincipal: p.corPrincipal ?? null,
      descricaoCurta: p.descricaoCurta ?? null,
      tags: p.tags,
      ativo: true as const,
    }))

    return NextResponse.json({ categoria, produtos, total }, {
      headers: { 'Cache-Control': 's-maxage=120, stale-while-revalidate=300' },
    })
  } catch (error) {
    logger.error("Erro buscando categoria por slug", error)
    return NextResponse.json({ erro: "Erro interno" }, { status: 500 })
  }
}
