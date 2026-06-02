import { NextRequest, NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { produtoSchema } from "@/lib/validations"
import { logger } from "@/lib/logger"
import { auditFromSession } from "@/lib/audit"
import { produtosRatelimit, getIp } from "@/lib/rateLimit"
import { z } from "zod"

// GET /api/produtos — público
export async function GET(request: NextRequest) {
  try {
    const { success } = await produtosRatelimit.limit(getIp(request))
    if (!success) {
      return NextResponse.json({ erro: "Muitas requisições. Aguarde." }, { status: 429 })
    }

    const { searchParams } = new URL(request.url)
    const categoria  = searchParams.get("categoria")
    const busca      = searchParams.get("busca")
    const tag        = searchParams.get("tag")
    const marca      = searchParams.get("marca")
    const tipo       = searchParams.get("tipo")
    const precoMin   = searchParams.get("preco_min")
    const precoMax   = searchParams.get("preco_max")
    const pagina     = Math.max(1, parseInt(searchParams.get("pagina") ?? "1"))
    const porPagina  = Math.min(Math.max(1, parseInt(searchParams.get("por_pagina") ?? "20") || 20), 100)
    const destaque   = searchParams.get("destaque") === "true"

    const where: Prisma.ProdutoWhereInput = { ativo: true }

    if (categoria) where.categoria = { slug: categoria }
    if (destaque)  where.destaque  = true
    if (tag)       where.tags = { has: tag }
    if (marca)     where.marca = { equals: marca, mode: "insensitive" }
    if (tipo && (tipo === "SIMPLES" || tipo === "KIT")) where.tipo = tipo

    if (precoMin || precoMax) {
      where.preco = {
        ...(precoMin ? { gte: new Prisma.Decimal(precoMin) } : {}),
        ...(precoMax ? { lte: new Prisma.Decimal(precoMax) } : {}),
      }
    }

    if (busca) {
      where.OR = [
        { nome:         { contains: busca, mode: "insensitive" } },
        { descricaoCurta: { contains: busca, mode: "insensitive" } },
        { marca:        { contains: busca, mode: "insensitive" } },
        { sku:          { contains: busca, mode: "insensitive" } },
        { tags:         { has: busca } },
      ]
    }

    const rows = await prisma.produto.findMany({
      where,
      include: {
        imagens:   { orderBy: { ordem: "asc" }, take: 1 },
        categoria: { select: { id: true, nome: true, slug: true } },
      },
      orderBy: [{ destaque: "desc" }, { criadoEm: "desc" }],
      skip: (pagina - 1) * porPagina,
      take: porPagina,
    })

    // Evita query de contagem quando o resultado cabe em uma página
    const total = rows.length < porPagina
      ? (pagina - 1) * porPagina + rows.length
      : await prisma.produto.count({ where })

    return NextResponse.json({
      produtos: rows.map((p) => ({
        ...p,
        preco:         Number(p.preco),
        precoOriginal: p.precoOriginal != null ? Number(p.precoOriginal) : null,
      })),
      total,
      pagina,
      totalPaginas: Math.ceil(total / porPagina),
    }, {
      headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=120' },
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

    const body = await request.json().catch(() => null)
    const data = produtoSchema.parse(body)
    const { kitItens, ...produtoData } = data

    // Valida que kit não referencia ele mesmo (só possível em update, mas mantemos aqui por segurança)
    const produto = await prisma.$transaction(async (tx) => {
      const p = await tx.produto.create({
        data: produtoData as Prisma.ProdutoUncheckedCreateInput,
      })

      if (p.tipo === "KIT" && kitItens && kitItens.length > 0) {
        const invalido = kitItens.find((k) => k.produtoId === p.id)
        if (invalido) throw new Error("KIT_SELF_REFERENCE")

        await tx.kitItem.createMany({
          data: kitItens.map((k, i) => ({
            kitId:      p.id,
            produtoId:  k.produtoId,
            quantidade: k.quantidade,
            ordem:      k.ordem ?? i,
          })),
        })
      }
      return p
    })

    auditFromSession(session, request, {
      acao:      "produto.criado",
      recurso:   "produto",
      recursoId: produto.id,
      detalhe:   { nome: produto.nome, tipo: produto.tipo, preco: Number(produto.preco) },
    })

    return NextResponse.json({
      ...produto,
      preco:         Number(produto.preco),
      precoOriginal: produto.precoOriginal != null ? Number(produto.precoOriginal) : null,
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ erro: "Dados inválidos", detalhes: error.issues }, { status: 400 })
    }
    if (error instanceof Error && error.message === "KIT_SELF_REFERENCE") {
      return NextResponse.json({ erro: "Kit não pode referenciar ele mesmo" }, { status: 400 })
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ erro: "Slug ou SKU já existe" }, { status: 409 })
    }
    logger.error("Erro criando produto", error)
    return NextResponse.json({ erro: "Erro interno" }, { status: 500 })
  }
}
