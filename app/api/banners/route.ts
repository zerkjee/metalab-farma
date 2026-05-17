import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/banners — banners ativos para a home
export async function GET() {
  try {
    const banners = await prisma.banner.findMany({
      where: { ativo: true },
      orderBy: { ordem: 'asc' },
    })
    return NextResponse.json({ banners })
  } catch {
    return NextResponse.json({ banners: [] })
  }
}
