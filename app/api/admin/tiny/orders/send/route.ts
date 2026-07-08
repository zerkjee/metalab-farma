import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/adminGuard'
import { getClientIp } from '@/lib/audit'
import { sendOrderToTiny } from '@/lib/tiny/tiny-service'
import { logger } from '@/lib/logger'

const bodySchema = z.object({
  orderId: z.string().min(1),
})

function statusCode(status: string) {
  if (status === 'VALIDATION_ERROR' || status === 'ALREADY_SENT' || status === 'NOT_ELIGIBLE' || status === 'NOT_FOUND') return 400
  if (status === 'TINY_DISABLED' || status === 'SYNC_ERROR') return 500
  return 200
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin()
    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json({ success: false, message: 'Não autenticado.', status: 'UNAUTHENTICATED' }, { status: 401 })
    }

    const parsed = bodySchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) {
      return NextResponse.json({
        success: false,
        message: 'Dados inválidos.',
        status: 'VALIDATION_ERROR',
        errors: parsed.error.issues.map((issue) => issue.message),
      }, { status: 400 })
    }

    const result = await sendOrderToTiny(parsed.data.orderId, {
      adminId: session.user.id,
      adminEmail: session.user.email,
      ip: getClientIp(request),
    })

    return NextResponse.json(result, { status: statusCode(result.status) })
  } catch (error) {
    logger.error('Erro enviando pedido ao Tiny', { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json({ success: false, message: 'Erro interno.', status: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
