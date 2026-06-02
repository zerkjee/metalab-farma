import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

// GET /api/banners — banners ativos para a home
export async function GET() {
  try {
    const banners = await prisma.banner.findMany({
      where: { ativo: true },
      orderBy: { ordem: 'asc' },
    })
    return NextResponse.json({ banners }, {
      headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=120' },
    })
  } catch (error) {
    logger.error('Erro carregando banners', error)
    return NextResponse.json({ banners: [] })
  }
}
