import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

type Params = { params: Promise<{ id: string }> }

async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.role?.includes("ADMIN")) return null
  return session
}

export async function PUT(request: NextRequest, { params }: Params) {
  if (!(await requireAdmin())) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 })
  try {
    const { id } = await params
    const body = await request.json()
    const cupom = await prisma.cupom.update({
      where: { id },
      data: {
        ...(body.codigo !== undefined && { codigo: String(body.codigo).toUpperCase().trim() }),
        ...(body.tipo !== undefined && { tipo: body.tipo }),
        ...(body.valor !== undefined && { valor: Number(body.valor) }),
        ...(body.usoMaximo !== undefined && { usoMaximo: body.usoMaximo }),
        ...(body.validade !== undefined && { validade: body.validade ? new Date(body.validade) : null }),
        ...(body.ativo !== undefined && { ativo: body.ativo }),
      },
    })
    return NextResponse.json({ ...cupom, valor: Number(cupom.valor) })
  } catch {
    return NextResponse.json({ erro: "Erro interno" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  if (!(await requireAdmin())) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 })
  try {
    const { id } = await params
    await prisma.cupom.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ erro: "Erro interno" }, { status: 500 })
  }
}
