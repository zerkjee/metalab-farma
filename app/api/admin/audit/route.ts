import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const session = await auth()
  if (session?.user?.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ erro: 'Acesso negado' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const pagina = Math.max(1, parseInt(searchParams.get('pagina') ?? '1'))
  const porPagina = 50
  const acao = searchParams.get('acao') ?? undefined

  const where = acao ? { acao: { contains: acao } } : {}

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { criadoEm: 'desc' },
      skip: (pagina - 1) * porPagina,
      take: porPagina,
    }),
    prisma.auditLog.count({ where }),
  ])

  return NextResponse.json({ logs, total, pagina, totalPaginas: Math.ceil(total / porPagina) })
}
