import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminGuard'
import { getInvoiceXmlForOrder } from '@/lib/tiny-service'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
    }

    const orderId = request.nextUrl.searchParams.get('orderId')
    if (!orderId) {
      return NextResponse.json({ erro: 'orderId é obrigatório' }, { status: 400 })
    }

    const result = await getInvoiceXmlForOrder(orderId)
    if (!result.ok) {
      return NextResponse.json({ erro: result.message }, { status: 404 })
    }

    return new NextResponse(result.xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Content-Disposition': `attachment; filename="${result.filename}"`,
      },
    })
  } catch (error) {
    logger.error('Erro baixando XML Tiny', { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 })
  }
}
