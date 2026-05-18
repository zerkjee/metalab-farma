import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/adminGuard'
import { logger } from '@/lib/logger'

const STATUS_LABEL: Record<string, string> = {
  AGUARDANDO_PAGAMENTO: 'Aguardando pagamento',
  PAGAMENTO_APROVADO: 'Pagamento aprovado',
  EM_SEPARACAO: 'Em separação',
  ENVIADO: 'Enviado',
  ENTREGUE: 'Entregue',
  CANCELADO: 'Cancelado',
  REEMBOLSADO: 'Reembolsado',
}

const METODO_LABEL: Record<string, string> = {
  PIX: 'PIX',
  CARTAO_CREDITO: 'Cartão de crédito',
  CARTAO_DEBITO: 'Cartão de débito',
  BOLETO: 'Boleto',
}

function csvEscape(value: unknown): string {
  const str = String(value ?? '')
  // Escape commas, quotes, and newlines
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function toRow(values: unknown[]): string {
  return values.map(csvEscape).join(',')
}

// GET /api/admin/pedidos/export?inicio=YYYY-MM-DD&fim=YYYY-MM-DD&status=ENVIADO
export async function GET(request: NextRequest) {
  try {
    const session = await requireAdmin()
    if (!session) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const inicioStr = searchParams.get('inicio')
    const fimStr = searchParams.get('fim')
    const statusFilter = searchParams.get('status') ?? undefined
    const pago = searchParams.get('pago')

    const where: Record<string, unknown> = {}

    if (inicioStr || fimStr) {
      const criadoEm: Record<string, Date> = {}
      if (inicioStr) criadoEm.gte = new Date(inicioStr)
      if (fimStr) {
        const fim = new Date(fimStr)
        fim.setHours(23, 59, 59, 999)
        criadoEm.lte = fim
      }
      where.criadoEm = criadoEm
    }

    if (statusFilter) where.status = statusFilter
    if (pago === 'true') where.pago = true
    if (pago === 'false') where.pago = false

    const pedidos = await prisma.pedido.findMany({
      where,
      orderBy: { criadoEm: 'desc' },
      take: 5000,
      select: {
        numero: true,
        criadoEm: true,
        compradorNome: true,
        compradorEmail: true,
        compradorCpf: true,
        status: true,
        metodoPagamento: true,
        pago: true,
        subtotal: true,
        desconto: true,
        frete: true,
        total: true,
        codigoRastreio: true,
        cupom: { select: { codigo: true } },
      },
    })

    logger.info('Exportação CSV de pedidos', {
      adminEmail: session.user.email,
      count: pedidos.length,
      filtros: { inicioStr, fimStr, statusFilter, pago },
    })

    const header = toRow([
      'Número',
      'Data',
      'Cliente',
      'Email',
      'CPF',
      'Status',
      'Pagamento',
      'Pago',
      'Subtotal',
      'Desconto',
      'Frete',
      'Total',
      'Cupom',
      'Rastreio',
    ])

    const rows = pedidos.map((p) =>
      toRow([
        p.numero,
        new Date(p.criadoEm).toLocaleDateString('pt-BR'),
        p.compradorNome,
        p.compradorEmail,
        p.compradorCpf,
        STATUS_LABEL[p.status] ?? p.status,
        METODO_LABEL[p.metodoPagamento ?? ''] ?? p.metodoPagamento ?? '',
        p.pago ? 'Sim' : 'Não',
        Number(p.subtotal).toFixed(2),
        Number(p.desconto).toFixed(2),
        Number(p.frete).toFixed(2),
        Number(p.total).toFixed(2),
        p.cupom?.codigo ?? '',
        p.codigoRastreio ?? '',
      ]),
    )

    const csv = [header, ...rows].join('\r\n')
    const filename = `pedidos_${new Date().toISOString().slice(0, 10)}.csv`

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    logger.error('Erro exportando CSV de pedidos', error)
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 })
  }
}
