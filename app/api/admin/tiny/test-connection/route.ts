import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminGuard'
import { getClientIp } from '@/lib/audit'
import { testTinyConnection } from '@/lib/tiny-service'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin()
    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
    }

    const result = await testTinyConnection({
      adminId: session.user.id,
      adminEmail: session.user.email,
      ip: getClientIp(request),
    })

    return NextResponse.json(result, { status: result.ok ? 200 : 400 })
  } catch (error) {
    logger.error('Erro testando conexão Tiny', { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 })
  }
}
