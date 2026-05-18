import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { logAudit, getClientIp } from "@/lib/audit"
import { Prisma } from "@prisma/client"

const updateSchema = z.object({
  codigo: z.string().min(2).max(20).optional(),
  tipo: z.enum(["PERCENTUAL", "VALOR_FIXO", "FRETE_GRATIS"]).optional(),
  valor: z.coerce.number().nonnegative().optional(),
  usoMaximo: z.coerce.number().int().positive().nullable().optional(),
  validade: z.string().nullable().optional(),
  ativo: z.boolean().optional(),
})

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
    const parsed = updateSchema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ erro: "Dados inválidos", detalhes: parsed.error.issues }, { status: 400 })
    const body = parsed.data
    const cupom = await prisma.cupom.update({
      where: { id },
      data: {
        ...(body.codigo !== undefined && { codigo: body.codigo.toUpperCase().trim() }),
        ...(body.tipo !== undefined && { tipo: body.tipo }),
        ...(body.valor !== undefined && { valor: body.valor }),
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
      detalhe: { campos: Object.keys(parsed.data) },
      ip: getClientIp(request),
    })
    return NextResponse.json({ ...cupom, valor: Number(cupom.valor) })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ erro: "Código de cupom já existe" }, { status: 409 })
    }
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
