import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { publicStock } from "@/lib/publicProduct"
import { requireAdmin } from "@/lib/adminGuard"
import { logger } from "@/lib/logger"
import { auditFromSession } from "@/lib/audit"

const kitItemInputSchema = z.object({
  produtoId:  z.string().min(1),
  quantidade: z.number().int().positive(),
  ordem:      z.number().int().min(0).optional(),
})

const produtoUpdateSchema = z.object({
  nome:          z.string().min(1).optional(),
  slug:          z.string().min(1).optional(),
  sku:           z.string().min(1).optional(),
  ean:           z.string().nullable().optional(),
  marca:         z.string().optional(),
  subtitulo:     z.string().nullable().optional(),
  categoriaId:   z.string().nullable().optional(),
  tipo:          z.enum(["SIMPLES", "KIT"]).optional(),
  // Conteúdo
  descricaoCurta: z.string().nullable().optional(),
  descricaoHtml:  z.string().optional(),
  composicao:     z.string().nullable().optional(),
  modoDeUso:      z.string().nullable().optional(),
  // Preço
  preco:         z.number().positive().optional(),
  precoOriginal: z.number().positive().nullable().optional(),
  // Estoque
  estoque:       z.number().int().min(0).optional(),
  estoqueMin:    z.number().int().min(0).optional(),
  // Logística
  pesoGramas:    z.number().int().positive().nullable().optional(),
  alturaCm:      z.number().int().positive().nullable().optional(),
  larguraCm:     z.number().int().positive().nullable().optional(),
  comprimentoCm: z.number().int().positive().nullable().optional(),
  // Descoberta
  tags:          z.array(z.string()).optional(),
  // Visual
  corPrincipal:  z.string().nullable().optional(),
  corSecundaria: z.string().nullable().optional(),
  imagemUrl:     z.string().nullable().optional(),
  // SEO
  metaTitulo:    z.string().nullable().optional(),
  metaDescricao: z.string().nullable().optional(),
  palavrasChave: z.string().nullable().optional(),
  // Flags
  ativo:         z.boolean().optional(),
  destaque:      z.boolean().optional(),
  // Kit
  kitItens:      z.array(kitItemInputSchema).optional(),
}).strict()

type Params = { params: Promise<{ id: string }> }

// GET /api/produtos/:id — público (por ID ou slug)
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params

    const produto = await prisma.produto.findFirst({
      where: { OR: [{ id }, { slug: id }], ativo: true },
      include: {
        imagens:   { orderBy: { ordem: "asc" } },
        atributos: true,
        categoria: true,
        avaliacoes: {
          where:   { aprovada: true },
          include: { usuario: { select: { nome: true } } },
          orderBy: { criadoEm: "desc" },
          take: 20,
        },
        kitItens: {
          include: {
            produto: {
              select: { id: true, nome: true, slug: true, preco: true, imagemUrl: true, imagens: { take: 1 } },
            },
          },
          orderBy: { ordem: "asc" },
        },
      },
    })

    if (!produto) {
      return NextResponse.json({ erro: "Produto não encontrado" }, { status: 404 })
    }

    // Kits que contêm este produto como componente (relação reversa)
    const kitsRelacionados = produto.tipo === "SIMPLES"
      ? await prisma.kitItem.findMany({
          where: { produtoId: produto.id },
          include: {
            kit: {
              select: {
                id: true, nome: true, slug: true, preco: true, precoOriginal: true,
                estoque: true, ativo: true,
              },
            },
          },
          orderBy: { quantidade: "asc" },
        })
      : []

    const kitsDisponiveis = kitsRelacionados
      .filter((k) => k.kit.ativo && k.kit.estoque > 0)
      .map((k) => ({
        id:            k.kit.id,
        nome:          k.kit.nome,
        slug:          k.kit.slug,
        preco:         Number(k.kit.preco),
        precoOriginal: k.kit.precoOriginal != null ? Number(k.kit.precoOriginal) : null,
        estoque:       publicStock(k.kit.estoque),
        quantidade:    k.quantidade,
      }))

    return NextResponse.json({
      ...produto,
      preco:         Number(produto.preco),
      precoOriginal: produto.precoOriginal != null ? Number(produto.precoOriginal) : null,
      // Estoque é info administrativa — cliente só vê se tem ou não
      estoque:       publicStock(produto.estoque),
      estoqueMin:    undefined,
      kitItens: produto.kitItens.map((k) => ({
        ...k,
        produto: { ...k.produto, preco: Number(k.produto.preco) },
      })),
      kitsDisponiveis,
    })
  } catch (error) {
    logger.error("Erro buscando produto por id", error)
    return NextResponse.json({ erro: "Erro interno" }, { status: 500 })
  }
}

// PUT /api/produtos/:id — apenas admin
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json().catch(() => null)

    const parsed = produtoUpdateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { erro: "Dados inválidos", detalhes: parsed.error.issues },
        { status: 400 }
      )
    }

    const { kitItens, ...produtoData } = parsed.data

    // Valida que kit não referencia ele mesmo
    if (kitItens) {
      const invalido = kitItens.find((k) => k.produtoId === id)
      if (invalido) {
        return NextResponse.json({ erro: "Kit não pode referenciar ele mesmo" }, { status: 400 })
      }
    }

    const produto = await prisma.$transaction(async (tx) => {
      const p = await tx.produto.update({
        where: { id },
        data: produtoData,
      })

      // Quando kitItens é fornecido, substitui completamente os componentes
      if (kitItens !== undefined) {
        await tx.kitItem.deleteMany({ where: { kitId: id } })
        if (kitItens.length > 0 && p.tipo === "KIT") {
          await tx.kitItem.createMany({
            data: kitItens.map((k, i) => ({
              kitId:      id,
              produtoId:  k.produtoId,
              quantidade: k.quantidade,
              ordem:      k.ordem ?? i,
            })),
          })
        }
      }
      return p
    })

    auditFromSession(session, request, {
      acao:      "produto.atualizado",
      recurso:   "produto",
      recursoId: produto.id,
      detalhe:   { campos: Object.keys(produtoData) },
    })

    return NextResponse.json({
      ...produto,
      preco:         Number(produto.preco),
      precoOriginal: produto.precoOriginal != null ? Number(produto.precoOriginal) : null,
    })
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
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 })
    }

    const { id } = await params

    await prisma.produto.update({
      where: { id },
      data: { ativo: false },
    })

    auditFromSession(session, request, {
      acao:      "produto.desativado",
      recurso:   "produto",
      recursoId: id,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    logger.error("Erro deletando produto", error)
    return NextResponse.json({ erro: "Erro interno" }, { status: 500 })
  }
}
