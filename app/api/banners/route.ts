import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

// GET /api/banners — banners ativos para a home
export async function GET() {
  try {
    const banners = await prisma.banner.findMany({
      where: { ativo: true },
      orderBy: { ordem: 'asc' },
    })
    return NextResponse.json({ banners })
  } catch (error) {
    logger.error('Erro carregando banners', error)
    return NextResponse.json({ banners: [] })
  }
}
