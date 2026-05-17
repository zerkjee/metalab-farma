import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { logAudit, getClientIp } from "@/lib/audit"

type Params = { params: Promise<{ id: string }> }

async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.role?.includes("ADMIN")) return null
  return session
}

export async function PUT(request: NextRequest, { params }: Params) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 })
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
    void logAudit({
      adminId: session.user.id!,
      adminEmail: session.user.email!,
      acao: 'cupom.atualizado',
      recurso: 'Cupom',
      recursoId: id,
      detalhe: { campos: Object.keys(body) },
      ip: getClientIp(request),
    })
    return NextResponse.json({ ...cupom, valor: Number(cupom.valor) })
  } catch {
    return NextResponse.json({ erro: "Erro interno" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 })
  try {
    const { id } = await params
    const cupom = await prisma.cupom.findUnique({ where: { id }, select: { codigo: true } })
    await prisma.cupom.delete({ where: { id } })
    void logAudit({
      adminId: session.user.id!,
      adminEmail: session.user.email!,
      acao: 'cupom.deletado',
      recurso: 'Cupom',
      recursoId: id,
      detalhe: { codigo: cupom?.codigo },
      ip: getClientIp(req),
    })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ erro: "Erro interno" }, { status: 500 })
  }
}
