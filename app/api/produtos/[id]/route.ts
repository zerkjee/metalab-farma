import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

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
    console.error("[GET /api/produtos/:id]", error)
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

    const produto = await prisma.produto.update({
      where: { id },
      data: body,
    })

    return NextResponse.json(produto)
  } catch (error) {
    console.error("[PUT /api/produtos/:id]", error)
    return NextResponse.json({ erro: "Erro interno" }, { status: 500 })
  }
}

// DELETE /api/produtos/:id — apenas admin (soft delete)
export async function DELETE(_req: NextRequest, { params }: Params) {
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

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[DELETE /api/produtos/:id]", error)
    return NextResponse.json({ erro: "Erro interno" }, { status: 500 })
  }
}
