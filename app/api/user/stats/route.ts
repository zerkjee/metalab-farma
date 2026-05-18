import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import type { LevelId } from '@/types/loyalty';

// Thresholds match minPoints in data/loyalty.ts — based on R$ spent in the rolling 6-month window
function calcLevel(totalGasto: number): LevelId {
  if (totalGasto >= 1500) return 'black';
  if (totalGasto >= 300) return 'gold';
  return 'silver';
}

const MULTIPLIER: Record<LevelId, number> = {
  silver: 1.0,
  gold: 1.5,
  black: 2.0,
};

const PERIOD_MONTHS = 6;

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ erro: 'Não autenticado' }, { status: 401 });
  }

  // Rolling 6-month window — points reset every semester
  const periodStart = new Date();
  periodStart.setMonth(periodStart.getMonth() - PERIOD_MONTHS);

  try {
  const [pedidos, usuario] = await Promise.all([
    prisma.pedido.findMany({
      where: {
        usuarioId: session.user.id,
        pago: true,
        criadoEm: { gte: periodStart },
      },
      select: {
        id: true,
        numero: true,
        total: true,
        status: true,
        criadoEm: true,
        itens: {
          select: { produtoNome: true },
          take: 1,
        },
      },
      orderBy: { criadoEm: 'desc' },
      take: 50,
    }),
    prisma.usuario.findUnique({
      where: { id: session.user.id },
      select: { criadoEm: true, pontosResgatados: true },
    }),
  ]);

  const totalGasto = pedidos.reduce((sum, p) => sum + Number(p.total), 0);
  const totalPedidos = pedidos.length;
  const level = calcLevel(totalGasto);
  // Pontos acumulados no período (R$ gasto × multiplicador) menos pontos já resgatados
  const pontosAcumulados = Math.floor(totalGasto * MULTIPLIER[level]);
  const pontosResgatados = usuario?.pontosResgatados ?? 0;
  const points = Math.max(0, pontosAcumulados - pontosResgatados);

  // Next reset = periodStart + 6 months from today (i.e., 6 months ahead)
  const nextReset = new Date();
  nextReset.setMonth(nextReset.getMonth() + PERIOD_MONTHS);

  return NextResponse.json({
    level,
    points,
    pontosAcumulados,
    pontosResgatados,
    multiplier: MULTIPLIER[level],
    totalPedidos,
    totalGasto,
    cashbackBalance: 0,
    cashbackUsed: 0,
    memberSince: usuario?.criadoEm ?? new Date().toISOString(),
    period: {
      start: periodStart.toISOString(),
      nextReset: nextReset.toISOString(),
      months: PERIOD_MONTHS,
    },
    recentOrders: pedidos.slice(0, 5).map((p) => ({
      id: p.id,
      numero: p.numero,
      total: Number(p.total),
      status: p.status,
      criadoEm: p.criadoEm,
      primeiroProduto: p.itens[0]?.produtoNome ?? null,
    })),
  });
  } catch (error) {
    logger.error('Erro buscando stats do usuário', error);
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 });
  }
}
