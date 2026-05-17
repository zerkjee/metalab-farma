import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { logger } from "@/lib/logger"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.role?.includes("ADMIN")) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const busca = searchParams.get("busca") ?? ""
    const pagina = Math.max(1, parseInt(searchParams.get("pagina") ?? "1"))
    const porPagina = Math.min(Math.max(1, parseInt(searchParams.get("por_pagina") ?? "50") || 50), 200)

    const where = busca
      ? {
          OR: [
            { nome: { contains: busca, mode: "insensitive" as const } },
            { slug: { contains: busca, mode: "insensitive" as const } },
            { marca: { contains: busca, mode: "insensitive" as const } },
            { sku: { contains: busca, mode: "insensitive" as const } },
          ],
        }
      : {}

    const [produtos, total] = await Promise.all([
      prisma.produto.findMany({
        where,
        include: {
          imagens: { orderBy: { ordem: "asc" }, take: 1 },
          categoria: { select: { nome: true, slug: true } },
        },
        orderBy: [{ ativo: "desc" }, { criadoEm: "desc" }],
        skip: (pagina - 1) * porPagina,
        take: porPagina,
      }),
      prisma.produto.count({ where }),
    ])

    return NextResponse.json({
      produtos: produtos.map((p) => ({ ...p, preco: Number(p.preco), precoOriginal: p.precoOriginal ? Number(p.precoOriginal) : null })),
      total,
      pagina,
      totalPaginas: Math.ceil(total / porPagina),
    })
  } catch (error) {
    logger.error("Erro listando produtos admin", error)
    return NextResponse.json({ erro: "Erro interno" }, { status: 500 })
  }
}
