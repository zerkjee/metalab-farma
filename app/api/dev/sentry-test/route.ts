import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminGuard'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    // Rota de diagnóstico: nunca disponível em produção (não deve haver erro proposital em prod)
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ erro: 'Não encontrado' }, { status: 404 })
    }

    const session = await requireAdmin()
    if (!session) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })

    const type = new URL(request.url).searchParams.get('type') ?? 'exception'

    if (type === 'message') {
      logger.error('Sentry test message from /api/dev/sentry-test')
      return NextResponse.json({ ok: true, sent: 'message' })
    }

    // type === 'exception' (default)
    throw new Error('Sentry test exception from /api/dev/sentry-test')
  } catch (err) {
    if (err instanceof Error && err.message.includes('Sentry test')) {
      // Let Sentry capture via logger + instrumentation
      logger.error('Sentry test: deliberate exception', err)
      return NextResponse.json({ ok: true, sent: 'exception' })
    }
    logger.error('Erro no sentry-test', err)
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 })
  }
}
