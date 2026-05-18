import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { logAudit, getClientIp } from "@/lib/audit"
import { z } from "zod"
import { Prisma } from "@prisma/client"

const cupomSchema = z.object({
  codigo: z.string().min(2).transform((s) => s.toUpperCase().trim()),
  tipo: z.enum(["PERCENTUAL", "VALOR_FIXO", "FRETE_GRATIS"]),
  valor: z.coerce.number().nonnegative(),
  usoMaximo: z.coerce.number().int().positive().optional().nullable(),
  validade: z.string().optional().nullable(),
  ativo: z.boolean().default(true),
})

async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.role?.includes("ADMIN")) return null
  return session
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 })
  try {
    const cupons = await prisma.cupom.findMany({ orderBy: { id: "desc" } })
    return NextResponse.json(cupons.map((c) => ({ ...c, valor: Number(c.valor) })))
  } catch {
    return NextResponse.json({ erro: "Erro interno" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 })
  try {
    const body = await request.json()
    const data = cupomSchema.parse(body)
    const cupom = await prisma.cupom.create({
      data: {
        codigo: data.codigo,
        tipo: data.tipo,
        valor: data.valor,
        usoMaximo: data.usoMaximo ?? null,
        validade: data.validade ? new Date(data.validade) : null,
        ativo: data.ativo,
      },
    })
    void logAudit({
      adminId: session.user.id!,
      adminEmail: session.user.email!,
      acao: 'cupom.criado',
      recurso: 'Cupom',
      recursoId: cupom.id,
      detalhe: { codigo: cupom.codigo, tipo: cupom.tipo, valor: Number(cupom.valor) },
      ip: getClientIp(request),
    })
    return NextResponse.json({ ...cupom, valor: Number(cupom.valor) }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ erro: "Dados inválidos", detalhes: error.issues }, { status: 400 })
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ erro: "Código de cupom já existe" }, { status: 409 })
    }
    return NextResponse.json({ erro: "Erro interno" }, { status: 500 })
  }
}
