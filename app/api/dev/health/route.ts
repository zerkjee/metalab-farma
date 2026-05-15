import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const REQUIRED_ENV = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'MERCADOPAGO_ACCESS_TOKEN',
  'NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY',
  'RESEND_API_KEY',
  'CLOUDINARY_CLOUD_NAME',
  'NEXT_PUBLIC_URL',
] as const;

async function checkRoute(path: string, baseUrl: string): Promise<{ path: string; ok: boolean; latencyMs: number }> {
  const start = Date.now();
  try {
    const res = await fetch(`${baseUrl}${path}`, { signal: AbortSignal.timeout(3000) });
    return { path, ok: res.ok || res.status === 401, latencyMs: Date.now() - start };
  } catch {
    return { path, ok: false, latencyMs: Date.now() - start };
  }
}

export async function GET() {
  const session = await auth();
  const isSuperAdmin = session?.user?.role === 'SUPER_ADMIN';
  const isDev = process.env.NODE_ENV === 'development';

  if (!isSuperAdmin && !isDev) {
    return NextResponse.json({ erro: 'Acesso negado' }, { status: 403 });
  }

  const dbStart = Date.now();
  let dbOk = false;
  let counts: Record<string, number> = {};
  try {
    const [usuarios, produtos, pedidos, cupons] = await Promise.all([
      prisma.usuario.count(),
      prisma.produto.count(),
      prisma.pedido.count(),
      prisma.cupom.count(),
    ]);
    counts = { usuarios, produtos, pedidos, cupons };
    dbOk = true;
  } catch {
    dbOk = false;
  }
  const dbLatency = Date.now() - dbStart;

  const env: Record<string, 'ok' | 'missing'> = {};
  for (const key of REQUIRED_ENV) {
    env[key] = process.env[key] ? 'ok' : 'missing';
  }

  const baseUrl = process.env.NEXT_PUBLIC_URL ?? 'http://localhost:3000';
  const routes = await Promise.all([
    checkRoute('/api/produtos', baseUrl),
    checkRoute('/api/admin/stats', baseUrl),
    checkRoute('/api/auth/session', baseUrl),
    checkRoute('/api/cupons', baseUrl),
  ]);

  let nextVersion = 'unknown';
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pkg = require('../../../../../package.json') as { dependencies?: { next?: string } };
    nextVersion = pkg.dependencies?.next ?? 'unknown';
  } catch { /* ignore */ }

  return NextResponse.json({
    db: { ok: dbOk, latencyMs: dbLatency, counts },
    env,
    build: {
      nodeVersion: process.version,
      nextVersion,
      env: process.env.NODE_ENV ?? 'unknown',
    },
    routes,
  });
}
