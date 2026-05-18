import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/adminGuard'
import { logAudit, getClientIp } from '@/lib/audit'
import { logger } from '@/lib/logger'

const bannerSchema = z.object({
  titulo: z.string().max(120).optional().nullable(),
  subtitulo: z.string().max(500).optional().nullable(),
  imagemUrl: z.string().min(1).max(500),
  linkUrl: z.string().max(500).optional().nullable(),
  cta: z.string().max(80).optional().nullable(),
  bg: z.string().max(500).optional().nullable(),
  accent: z.string().max(40).optional().nullable(),
  campanha: z.string().max(80).optional().nullable(),
  ordem: z.number().int().min(0).default(0),
  ativo: z.boolean().default(true),
})

// GET /api/admin/banners
export async function GET() {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })

  try {
    const banners = await prisma.banner.findMany({ orderBy: { ordem: 'asc' } })
    return NextResponse.json({ banners })
  } catch (error) {
    logger.error('Erro listando banners', error)
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 })
  }
}

// POST /api/admin/banners — criar
export async function POST(request: NextRequest) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })

  const parsed = bannerSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ erro: 'Dados inválidos', detalhes: parsed.error.issues }, { status: 400 })

  try {
    const banner = await prisma.banner.create({ data: parsed.data })

    void logAudit({
      adminId: session.user.id!,
      adminEmail: session.user.email!,
      acao: 'banner.criado',
      recurso: 'banner',
      recursoId: banner.id,
      detalhe: { titulo: banner.titulo },
      ip: getClientIp(request),
    })

    return NextResponse.json({ banner }, { status: 201 })
  } catch (error) {
    logger.error('Erro criando banner', error)
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 })
  }
}

// PATCH /api/admin/banners?id=X
export async function PATCH(request: NextRequest) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ erro: 'id obrigatório' }, { status: 400 })

  const parsed = bannerSchema.partial().safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ erro: 'Dados inválidos' }, { status: 400 })

  try {
    const banner = await prisma.banner.update({ where: { id }, data: parsed.data })

    void logAudit({
      adminId: session.user.id!,
      adminEmail: session.user.email!,
      acao: 'banner.atualizado',
      recurso: 'banner',
      recursoId: id,
      ip: getClientIp(request),
    })

    return NextResponse.json({ banner })
  } catch (error) {
    logger.error('Erro atualizando banner', error)
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 })
  }
}

// DELETE /api/admin/banners?id=X
export async function DELETE(request: NextRequest) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ erro: 'id obrigatório' }, { status: 400 })

  try {
    await prisma.banner.delete({ where: { id } })

    void logAudit({
      adminId: session.user.id!,
      adminEmail: session.user.email!,
      acao: 'banner.deletado',
      recurso: 'banner',
      recursoId: id,
      ip: getClientIp(request),
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    logger.error('Erro deletando banner', error)
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 })
  }
}
