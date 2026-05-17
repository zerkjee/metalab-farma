import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { logger } from '@/lib/logger'
import { resgateRatelimit, getIp } from '@/lib/rateLimit'
import type { LevelId } from '@/types/loyalty'

// Tabela de resgates: pontos → valor em R$ (cupom de valor fixo)
// 100 pontos = R$ 10, 250 pontos = R$ 30 (10% extra), 500 pontos = R$ 70 (40% extra), 1000 = R$ 150 (50% extra)
const REDEMPTIONS = [
  { pontos: 100, valor: 10 },
  { pontos: 250, valor: 30 },
  { pontos: 500, valor: 70 },
  { pontos: 1000, valor: 150 },
] as const

const schema = z.object({
  pontos: z.number().int().refine((v) => REDEMPTIONS.some((r) => r.pontos === v), {
    message: 'Quantidade de pontos inválida',
  }),
})

function calcLevel(totalGasto: number): LevelId {
  if (totalGasto >= 1500) return 'black'
  if (totalGasto >= 300) return 'gold'
  return 'silver'
}

const MULTIPLIER: Record<LevelId, number> = { silver: 1.0, gold: 1.5, black: 2.0 }

function generateCouponCode(prefix = 'VIP') {
  return prefix + Math.random().toString(36).slice(2, 7).toUpperCase()
}

export async function GET() {
  return NextResponse.json({ opcoes: REDEMPTIONS })
}

export async function POST(request: NextRequest) {
  try {
    const { success } = await resgateRatelimit.limit(getIp(request))
    if (!success) {
      return NextResponse.json({ erro: 'Muitas tentativas de resgate. Aguarde uma hora.' }, { status: 429 })
    }

    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ erro: 'Não autenticado' }, { status: 401 })

    const parsed = schema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ erro: parsed.error.issues[0]?.message ?? 'Dados inválidos' }, { status: 400 })

    const opcao = REDEMPTIONS.find((r) => r.pontos === parsed.data.pontos)!

    // Verifica saldo: pontos acumulados no período − já resgatados
    const periodStart = new Date()
    periodStart.setMonth(periodStart.getMonth() - 6)

    const [pedidos, usuario] = await Promise.all([
      prisma.pedido.findMany({
        where: { usuarioId: session.user.id, pago: true, criadoEm: { gte: periodStart } },
        select: { total: true },
      }),
      prisma.usuario.findUnique({ where: { id: session.user.id }, select: { pontosResgatados: true, nome: true } }),
    ])

    const totalGasto = pedidos.reduce((s, p) => s + Number(p.total), 0)
    const level = calcLevel(totalGasto)
    const pontosAcumulados = Math.floor(totalGasto * MULTIPLIER[level])
    const saldo = Math.max(0, pontosAcumulados - (usuario?.pontosResgatados ?? 0))

    if (saldo < opcao.pontos) {
      return NextResponse.json({ erro: `Saldo insuficiente. Você tem ${saldo} pontos.` }, { status: 400 })
    }

    // Cria cupom de valor fixo (uso único, 30 dias)
    const codigo = generateCouponCode('VIP')
    const validade = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    await prisma.$transaction([
      prisma.cupom.create({
        data: {
          codigo,
          tipo: 'VALOR_FIXO',
          valor: opcao.valor,
          ativo: true,
          validade,
          usoMaximo: 1,
        },
      }),
      prisma.usuario.update({
        where: { id: session.user.id },
        data: { pontosResgatados: { increment: opcao.pontos } },
      }),
    ])

    logger.info('Pontos resgatados', {
      route: 'POST /api/user/resgatar-pontos',
      usuarioId: session.user.id,
      pontos: opcao.pontos,
      valor: opcao.valor,
      codigo,
    })

    return NextResponse.json({
      ok: true,
      codigo,
      valor: opcao.valor,
      validade: validade.toISOString(),
      mensagem: `Cupom ${codigo} criado! R$ ${opcao.valor.toFixed(2)} de desconto. Válido por 30 dias.`,
    })
  } catch (error) {
    logger.error('Erro ao resgatar pontos', error)
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 })
  }
}
