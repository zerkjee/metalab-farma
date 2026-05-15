import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { LevelId } from '@/types/loyalty';

function calcLevel(totalGasto: number): LevelId {
  if (totalGasto >= 5000) return 'black';
  if (totalGasto >= 1000) return 'gold';
  return 'silver';
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ erro: 'Não autenticado' }, { status: 401 });
  }

  const pedidos = await prisma.pedido.findMany({
    where: { usuarioId: session.user.id, pago: true },
    select: {
      id: true,
      numero: true,
      total: true,
      status: true,
      criadoEm: true,
      itens: {
        select: { produtoNome: true, quantidade: true, precoUnit: true },
        take: 1,
      },
    },
    orderBy: { criadoEm: 'desc' },
    take: 50,
  });

  const totalGasto = pedidos.reduce((sum, p) => sum + Number(p.total), 0);
  const totalPedidos = pedidos.length;
  const points = Math.floor(totalGasto);
  const level = calcLevel(totalGasto);

  const usuario = await prisma.usuario.findUnique({
    where: { id: session.user.id },
    select: { criadoEm: true },
  });

  return NextResponse.json({
    level,
    points,
    totalPedidos,
    totalGasto,
    cashbackBalance: 0,
    cashbackUsed: 0,
    memberSince: usuario?.criadoEm ?? new Date().toISOString(),
    recentOrders: pedidos.slice(0, 5).map((p) => ({
      id: p.id,
      numero: p.numero,
      total: Number(p.total),
      status: p.status,
      criadoEm: p.criadoEm,
      primeiroProduto: p.itens[0]?.produtoNome ?? null,
    })),
  });
}
