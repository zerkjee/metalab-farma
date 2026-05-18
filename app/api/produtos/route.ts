import { NextRequest, NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { produtoSchema } from "@/lib/validations"
import { logger } from "@/lib/logger"
import { auditFromSession } from "@/lib/audit"
import { z } from "zod"

// GET /api/produtos — público
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoria = searchParams.get("categoria")
    const busca = searchParams.get("busca")
    const pagina = Math.max(1, parseInt(searchParams.get("pagina") ?? "1"))
    const porPagina = Math.min(Math.max(1, parseInt(searchParams.get("por_pagina") ?? "20") || 20), 100)
    const destaque = searchParams.get("destaque") === "true"

    const where: Prisma.ProdutoWhereInput = { ativo: true }
    if (categoria) where.categoria = { slug: categoria }
    if (destaque) where.destaque = true
    if (busca) {
      where.OR = [
        { nome: { contains: busca, mode: "insensitive" } },
        { descricaoCurta: { contains: busca, mode: "insensitive" } },
        { marca: { contains: busca, mode: "insensitive" } },
      ]
    }

    const [produtos, total] = await Promise.all([
      prisma.produto.findMany({
        where,
        include: {
          imagens: { orderBy: { ordem: "asc" }, take: 1 },
          categoria: { select: { nome: true, slug: true } },
        },
        orderBy: [{ destaque: "desc" }, { criadoEm: "desc" }],
        skip: (pagina - 1) * porPagina,
        take: porPagina,
      }),
      prisma.produto.count({ where }),
    ])

    return NextResponse.json({
      produtos,
      total,
      pagina,
      totalPaginas: Math.ceil(total / porPagina),
    })
  } catch (error) {
    logger.error("Erro listando produtos", error)
    return NextResponse.json({ erro: "Erro interno" }, { status: 500 })
  }
}

// POST /api/produtos — apenas admin
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.role?.includes("ADMIN")) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const data = produtoSchema.parse(body)

    const produto = await prisma.produto.create({ data: data as Prisma.ProdutoUncheckedCreateInput })
    auditFromSession(session, request, {
      acao: "produto.criado",
      recurso: "produto",
      recursoId: produto.id,
      detalhe: { nome: produto.nome, slug: produto.slug, preco: Number(produto.preco), estoque: produto.estoque },
    })
    return NextResponse.json(produto, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ erro: "Dados inválidos", detalhes: error.issues }, { status: 400 })
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ erro: "Slug ou SKU já existe" }, { status: 409 })
    }
    logger.error("Erro criando produto", error)
    return NextResponse.json({ erro: "Erro interno" }, { status: 500 })
  }
}
