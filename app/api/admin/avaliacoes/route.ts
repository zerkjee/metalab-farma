import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { logAudit, getClientIp } from '@/lib/audit'
import { logger } from '@/lib/logger'

const updateSchema = z.object({
  id: z.string().min(1),
  aprovada: z.boolean(),
})

// GET /api/admin/avaliacoes?status=pendentes|aprovadas|todas
export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.role?.includes('ADMIN')) {
    return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') ?? 'pendentes'

  const where = status === 'aprovadas' ? { aprovada: true } : status === 'todas' ? {} : { aprovada: false }

  try {
    const avaliacoes = await prisma.avaliacao.findMany({
      where,
      orderBy: { criadoEm: 'desc' },
      take: 100,
      include: {
        usuario: { select: { nome: true, email: true } },
        produto: { select: { nome: true, slug: true } },
      },
    })

    return NextResponse.json({ avaliacoes })
  } catch (error) {
    logger.error('Erro listando avaliações admin', error)
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 })
  }
}

// PATCH /api/admin/avaliacoes — aprovar / reprovar
export async function PATCH(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.role?.includes('ADMIN') || !session.user.id || !session.user.email) {
    return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
  }

  const parsed = updateSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ erro: 'Dados inválidos' }, { status: 400 })

  try {
    const updated = await prisma.avaliacao.update({
      where: { id: parsed.data.id },
      data: { aprovada: parsed.data.aprovada },
      select: { id: true, produtoId: true },
    })

    void logAudit({
      adminId: session.user.id,
      adminEmail: session.user.email,
      acao: parsed.data.aprovada ? 'avaliacao.aprovada' : 'avaliacao.reprovada',
      recurso: 'avaliacao',
      recursoId: updated.id,
      detalhe: { produtoId: updated.produtoId },
      ip: getClientIp(request),
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    logger.error('Erro atualizando avaliação', error)
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 })
  }
}

// DELETE /api/admin/avaliacoes?id=X
export async function DELETE(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.role?.includes('ADMIN') || !session.user.id || !session.user.email) {
    return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ erro: 'id obrigatório' }, { status: 400 })

  try {
    await prisma.avaliacao.delete({ where: { id } })

    void logAudit({
      adminId: session.user.id,
      adminEmail: session.user.email,
      acao: 'avaliacao.deletada',
      recurso: 'avaliacao',
      recursoId: id,
      ip: getClientIp(request),
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    logger.error('Erro deletando avaliação', error)
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 })
  }
}
