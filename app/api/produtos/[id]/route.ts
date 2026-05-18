import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { logger } from "@/lib/logger"
import { auditFromSession } from "@/lib/audit"
import { Prisma } from "@prisma/client"

const produtoUpdateSchema = z.object({
  nome: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  sku: z.string().min(1).optional(),
  ean: z.string().nullable().optional(),
  marca: z.string().optional(),
  subtitulo: z.string().nullable().optional(),
  descricaoHtml: z.string().optional(),
  descricaoCurta: z.string().nullable().optional(),
  preco: z.number().positive().optional(),
  precoOriginal: z.number().positive().nullable().optional(),
  estoque: z.number().int().min(0).optional(),
  estoqueMin: z.number().int().min(0).optional(),
  categoriaId: z.string().nullable().optional(),
  corPrincipal: z.string().nullable().optional(),
  corSecundaria: z.string().nullable().optional(),
  imagemUrl: z.string().nullable().optional(),
  metaTitulo: z.string().nullable().optional(),
  metaDescricao: z.string().nullable().optional(),
  palavrasChave: z.string().nullable().optional(),
  ativo: z.boolean().optional(),
  destaque: z.boolean().optional(),
}).strict()

type Params = { params: Promise<{ id: string }> }

// GET /api/produtos/:id — público (por ID ou slug)
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params

    const produto = await prisma.produto.findFirst({
      where: { OR: [{ id }, { slug: id }], ativo: true },
      include: {
        imagens: { orderBy: { ordem: "asc" } },
        atributos: true,
        categoria: true,
        avaliacoes: {
          where: { aprovada: true },
          include: { usuario: { select: { nome: true } } },
          orderBy: { criadoEm: "desc" },
          take: 20,
        },
      },
    })

    if (!produto) {
      return NextResponse.json({ erro: "Produto não encontrado" }, { status: 404 })
    }

    return NextResponse.json(produto)
  } catch (error) {
    logger.error("Erro buscando produto por id", error)
    return NextResponse.json({ erro: "Erro interno" }, { status: 500 })
  }
}

// PUT /api/produtos/:id — apenas admin
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const session = await auth()
    if (!session?.user?.role?.includes("ADMIN")) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const parsed = produtoUpdateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { erro: "Dados inválidos", detalhes: parsed.error.issues },
        { status: 400 }
      )
    }

    const produto = await prisma.produto.update({
      where: { id },
      data: parsed.data,
    })

    auditFromSession(session, request, {
      acao: "produto.atualizado",
      recurso: "produto",
      recursoId: produto.id,
      detalhe: { campos: Object.keys(parsed.data) },
    })

    return NextResponse.json(produto)
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ erro: "Slug ou SKU já existe" }, { status: 409 })
    }
    logger.error("Erro atualizando produto", error)
    return NextResponse.json({ erro: "Erro interno" }, { status: 500 })
  }
}

// DELETE /api/produtos/:id — apenas admin (soft delete)
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const session = await auth()
    if (!session?.user?.role?.includes("ADMIN")) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 })
    }

    const { id } = await params

    await prisma.produto.update({
      where: { id },
      data: { ativo: false },
    })

    auditFromSession(session, request, {
      acao: "produto.desativado",
      recurso: "produto",
      recursoId: id,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    logger.error("Erro deletando produto", error)
    return NextResponse.json({ erro: "Erro interno" }, { status: 500 })
  }
}
