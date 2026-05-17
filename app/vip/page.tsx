'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import LevelBadge from '@/components/loyalty/LevelBadge';
import PointsRedemption from '@/components/loyalty/PointsRedemption';
import { levels, achievements, getLevelConfig, getNextLevel, getProgressToNext } from '@/data/loyalty';
import type { LevelId } from '@/types/loyalty';
import { fmtCurrency as formatCurrency, fmtDate as formatDate } from '@/utils/formatters';

interface UserStats {
  level: LevelId;
  points: number;
  pontosAcumulados: number;
  pontosResgatados: number;
  multiplier: number;
  totalPedidos: number;
  totalGasto: number;
  cashbackBalance: number;
  cashbackUsed: number;
  memberSince: string;
  period: {
    start: string;
    nextReset: string;
    months: number;
  };
  recentOrders: {
    id: string;
    numero: string;
    total: number;
    status: string;
    criadoEm: string;
    primeiroProduto: string | null;
  }[];
}

const statusLabel: Record<string, { label: string; color: string }> = {
  AGUARDANDO_PAGAMENTO: { label: 'Aguardando', color: 'text-amber-400' },
  PAGAMENTO_APROVADO: { label: 'Aprovado', color: 'text-emerald-400' },
  EM_SEPARACAO: { label: 'Em separação', color: 'text-blue-400' },
  ENVIADO: { label: 'Enviado', color: 'text-sky-400' },
  ENTREGUE: { label: 'Entregue', color: 'text-emerald-400' },
  CANCELADO: { label: 'Cancelado', color: 'text-red-400' },
  REEMBOLSADO: { label: 'Reembolsado', color: 'text-orange-400' },
};

function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-sm ${className}`}>
      {children}
    </div>
  );
}

function StatChip({
  label, value, sub, color,
}: { label: string; value: string | number; sub: string; color: string }) {
  return (
    <GlassCard className="p-5 text-center group hover:border-white/20 transition-all">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: `radial-gradient(circle at 50% 0%, ${color}18 0%, transparent 70%)` }} />
      <p className="relative text-white/40 text-[11px] uppercase tracking-widest mb-2">{label}</p>
      <p className="relative text-2xl font-black" style={{ color }}>{value}</p>
      <p className="relative text-white/30 text-xs mt-0.5">{sub}</p>
    </GlassCard>
  );
}

export default function VipPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  const [stats, setStats] = useState<UserStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.replace('/login');
      return;
    }
    if (sessionStatus !== 'authenticated') return;

    fetch('/api/user/stats')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((data) => setStats(data))
      .catch(() => { /* stats indisponíveis — página continua sem elas */ })
      .finally(() => setLoadingStats(false));
  }, [sessionStatus, router]);

  if (sessionStatus === 'loading' || loadingStats) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0f0522, #0f172a)' }}>
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-2xl animate-pulse" style={{ background: 'linear-gradient(135deg, #6b21a8, #7c3aed)' }} />
            <p className="text-white/40 text-sm animate-pulse">Carregando área VIP...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const firstName = session?.user?.name?.split(' ')[0] ?? 'Atleta';
  const level = stats?.level ?? 'silver';
  const levelCfg = getLevelConfig(level);
  const nextLevel = getNextLevel(level);
  const fakeUser = {
    name: session?.user?.name ?? '',
    firstName,
    email: session?.user?.email ?? '',
    memberSince: stats?.memberSince ?? new Date().toISOString(),
    level,
    points: stats?.points ?? 0,              // displayed (multiplied) — for stats chip
    cashbackBalance: stats?.cashbackBalance ?? 0,
    cashbackUsed: stats?.cashbackUsed ?? 0,
    totalOrders: stats?.totalPedidos ?? 0,
    totalSpent: stats?.totalGasto ?? 0,       // R$ spent (base 1:1) — for progress bar
  };
  const progress = getProgressToNext(fakeUser);
  // pointsToNext uses totalSpent (R$) vs threshold — same scale as minPoints
  const pointsToNext = nextLevel ? Math.max(0, nextLevel.minPoints - fakeUser.totalSpent) : 0;

  return (
    <>
      <ScrollToTop />
      <Header />

      {/* ── HERO ── */}
      <section
        className="relative overflow-hidden pb-40 pt-16"
        style={{ background: 'linear-gradient(160deg, #0a0118 0%, #12032a 30%, #1a1040 60%, #0f172a 100%)' }}
      >
        {/* Glows */}
        <div className="pointer-events-none absolute -right-32 -top-32 h-[600px] w-[600px] rounded-full opacity-20 blur-3xl"
          style={{ background: levelCfg.color }} />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-80 w-80 rounded-full opacity-10 blur-3xl"
          style={{ background: '#7c3aed' }} />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '36px 36px' }} />
        {/* Noise grain */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.015]"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'400\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.75\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'400\' height=\'400\' filter=\'url(%23n)\' opacity=\'1\'/%3E%3C/svg%3E")' }} />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-12">
            <div>
              <p className="text-white/40 text-xs uppercase tracking-[0.3em] mb-2">Área VIP</p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
                Olá, <span style={{ color: levelCfg.color }}>{firstName}</span>
              </h1>
              {stats?.memberSince && (
                <p className="text-white/30 text-sm mt-2">
                  Membro Metalab desde {formatDate(stats.memberSince)}
                </p>
              )}
            </div>

            <div
              className="flex items-center gap-4 rounded-2xl border border-white/10 px-5 py-3.5 backdrop-blur-sm"
              style={{ background: `linear-gradient(135deg, ${levelCfg.color}18, transparent)` }}
            >
              <LevelBadge level={level} size="lg" />
              <div>
                <p className="text-[10px] text-white/40 uppercase tracking-[0.3em]">Nível atual</p>
                <p className="font-black text-xl uppercase tracking-wider mt-0.5" style={{ color: levelCfg.color }}>
                  {levelCfg.name}
                </p>
                <p className="text-[10px] text-white/30 mt-0.5">
                  {levelCfg.cashbackPct}% cashback · {levelCfg.multiplier}x pontos
                </p>
              </div>
            </div>
          </div>

          {/* Período semestral */}
          {stats?.period && (
            <div className="flex items-center gap-2 mb-6 flex-wrap">
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs text-white/50">
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Período: <span className="text-white/70 font-semibold">
                  {formatDate(stats.period.start)} – hoje
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs text-white/50">
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Próximo reset: <span className="text-amber-400/80 font-semibold">
                  {formatDate(stats.period.nextReset)}
                </span>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
            <StatChip label="Pontos" value={fakeUser.points.toLocaleString('pt-BR')} sub="acumulados" color={levelCfg.color} />
            <StatChip label="Pedidos" value={fakeUser.totalOrders} sub="realizados" color="#60a5fa" />
            <StatChip label="Total gasto" value={formatCurrency(fakeUser.totalSpent)} sub="em compras" color="#34d399" />
            <StatChip label="Cashback" value={fakeUser.cashbackBalance > 0 ? formatCurrency(fakeUser.cashbackBalance) : 'Em breve'} sub="disponível" color="#f472b6" />
          </div>

          {/* Progress */}
          {nextLevel && (
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <LevelBadge level={level} size="sm" />
                  <svg className="w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                  <LevelBadge level={nextLevel.id} size="sm" />
                  <p className="text-white text-sm font-semibold">
                    Faltam{' '}
                    <span className="font-black" style={{ color: nextLevel.color }}>
                      R$ {pointsToNext.toLocaleString('pt-BR', { minimumFractionDigits: 0 })} em compras
                    </span>{' '}
                    para o <span className="font-black">{nextLevel.name}</span>
                  </p>
                </div>
                <span className="text-white/40 text-sm font-black tabular-nums">{progress}%</span>
              </div>
              <div className="relative w-full h-3 bg-white/8 rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000"
                  style={{ width: `${progress}%`, background: levelCfg.gradient }}
                />
                <div
                  className="absolute inset-y-0 left-0 rounded-full opacity-40 blur-sm transition-all duration-1000"
                  style={{ width: `${progress}%`, background: levelCfg.gradient }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-white/25">
                <span>R$ {fakeUser.totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</span>
                <span>R$ {nextLevel.minPoints.toLocaleString('pt-BR')}</span>
              </div>
            </GlassCard>
          )}
        </div>
      </section>

      {/* ── CONTEÚDO ── */}
      <div
        className="-mt-24 pt-4 pb-24"
        style={{ background: 'linear-gradient(180deg, #0f172a 0%, #080d1a 100%)' }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Pedidos recentes */}
          {stats && stats.recentOrders.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-white font-black text-xl">Pedidos Recentes</h2>
                <Link href="/pedidos" className="text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors">
                  Ver todos →
                </Link>
              </div>
              <div className="flex flex-col gap-3">
                {stats.recentOrders.map((order) => {
                  const s = statusLabel[order.status] ?? { label: order.status, color: 'text-white/60' };
                  return (
                    <GlassCard key={order.id} className="flex items-center gap-4 px-5 py-4 hover:border-white/15 transition-all">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-black text-white"
                        style={{ background: 'linear-gradient(135deg, #1e1b4b, #3730a3)' }}
                      >
                        #
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-bold text-sm">{order.numero}</p>
                        <p className="text-white/40 text-xs truncate">{order.primeiroProduto ?? 'Pedido'}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-white font-black text-sm">{formatCurrency(order.total)}</p>
                        <p className={`text-xs font-semibold ${s.color}`}>{s.label}</p>
                      </div>
                      <div className="hidden sm:block text-right flex-shrink-0">
                        <p className="text-white/30 text-xs">{formatDate(order.criadoEm)}</p>
                      </div>
                    </GlassCard>
                  );
                })}
              </div>
            </div>
          )}

          {/* Resgate de Pontos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
            <PointsRedemption stats={stats} levelCfg={levelCfg} onRedeemed={() => {
              // Recarrega stats após resgate
              fetch('/api/user/stats').then((r) => r.ok && r.json()).then((d) => d && setStats(d)).catch(() => {});
            }} />

            {/* Conquistas (4 primeiras) */}
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-white font-black text-lg">Conquistas</h2>
                <span className="text-white/40 text-sm tabular-nums">
                  {achievements.filter((a) => a.unlocked).length}/{achievements.length}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {achievements.slice(0, 4).map((ach) => (
                  <div
                    key={ach.id}
                    className={`rounded-xl p-3.5 border transition-all ${
                      ach.unlocked
                        ? 'bg-white/[0.06] border-white/12 hover:bg-white/10'
                        : 'bg-white/[0.02] border-white/5 opacity-50'
                    }`}
                  >
                    <span className={`text-2xl block mb-2 ${!ach.unlocked ? 'grayscale opacity-30' : ''}`}>{ach.icon}</span>
                    <p className={`text-xs font-bold leading-snug ${ach.unlocked ? 'text-white' : 'text-white/30'}`}>
                      {ach.title}
                    </p>
                    {ach.unlocked && (
                      <p className="text-[10px] font-bold text-emerald-400 mt-1">{ach.reward}</p>
                    )}
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Benefícios por nível */}
          <div className="mb-10">
            <h2 className="text-white font-black text-xl mb-5">Benefícios por Nível</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {levels.map((lvl) => {
                const isCurrent = lvl.id === level;
                return (
                  <div
                    key={lvl.id}
                    className={`relative rounded-2xl border p-6 transition-all ${
                      isCurrent ? 'border-white/20' : 'border-white/6 opacity-70 hover:opacity-90'
                    }`}
                    style={{ background: isCurrent ? lvl.gradientCard : 'rgba(255,255,255,0.02)' }}
                  >
                    {isCurrent && (
                      <span
                        className="absolute right-3 top-3 rounded-full px-2.5 py-0.5 text-[10px] font-black text-white"
                        style={{ background: lvl.color + '50' }}
                      >
                        Seu nível
                      </span>
                    )}

                    <div className="flex items-center gap-3 mb-5">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg flex-shrink-0"
                        style={{ background: lvl.gradient }}
                      >
                        {lvl.emoji}
                      </div>
                      <div>
                        <p className="font-black text-sm uppercase tracking-widest" style={{ color: lvl.color }}>
                          {lvl.name}
                        </p>
                        <p className="text-white/35 text-xs">
                          {lvl.maxPoints
                            ? `${lvl.minPoints.toLocaleString('pt-BR')}–${lvl.maxPoints.toLocaleString('pt-BR')} pts`
                            : `${lvl.minPoints.toLocaleString('pt-BR')}+ pts`}
                        </p>
                      </div>
                    </div>

                    <div className="mb-5 grid grid-cols-2 gap-2">
                      <div className="py-3 px-2 rounded-xl bg-white/5 text-center">
                        <p className="text-2xl font-black" style={{ color: lvl.color }}>{lvl.cashbackPct}%</p>
                        <p className="text-white/35 text-[10px] mt-0.5">cashback</p>
                      </div>
                      <div className="py-3 px-2 rounded-xl bg-white/5 text-center">
                        <p className="text-2xl font-black" style={{ color: lvl.color }}>{lvl.multiplier}x</p>
                        <p className="text-white/35 text-[10px] mt-0.5">pts por R$1</p>
                      </div>
                    </div>

                    <ul className="flex flex-col gap-2">
                      {lvl.benefits.map((b) => (
                        <li key={b.text} className="flex items-start gap-2 text-xs">
                          <span className="text-sm leading-none mt-0.5 flex-shrink-0">{b.icon}</span>
                          <span className={isCurrent ? 'text-white/75' : 'text-white/35'}>{b.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CTA upgrade */}
          {nextLevel && (
            <div
              className="rounded-2xl border border-white/10 p-8 text-center relative overflow-hidden"
              style={{ background: nextLevel.gradientCard }}
            >
              <div className="absolute inset-0 opacity-[0.04]"
                style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '28px 28px' }} />
              <div className="pointer-events-none absolute inset-0 opacity-20"
                style={{ background: `radial-gradient(ellipse at 50% 0%, ${nextLevel.color}40 0%, transparent 60%)` }} />
              <div className="relative">
                <div
                  className="w-20 h-20 rounded-3xl flex items-center justify-center text-5xl mx-auto mb-5 shadow-2xl"
                  style={{ background: nextLevel.gradient }}
                >
                  {nextLevel.emoji}
                </div>
                <h3 className="text-2xl font-black text-white mb-2">
                  Faltam{' '}
                  <span style={{ color: nextLevel.color }}>
                    R$ {pointsToNext.toLocaleString('pt-BR', { minimumFractionDigits: 0 })} em compras
                  </span>{' '}
                  para o {nextLevel.name}
                </h3>
                <p className="text-white/55 mb-3 max-w-md mx-auto text-sm leading-relaxed">
                  Suba para {nextLevel.name} e desbloqueie {nextLevel.cashbackPct}% cashback e ganhe{' '}
                  <strong className="text-white">{nextLevel.multiplier}x pontos</strong> em cada compra.
                </p>
                <p className="text-white/30 text-xs mb-5">
                  Seus pontos atuais serão recalculados com o novo multiplicador ao atingir o nível.
                </p>
                <Link
                  href="/#produtos"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white text-sm transition-all hover:scale-105 hover:shadow-2xl"
                  style={{ background: 'linear-gradient(135deg, #6b21a8, #7c3aed)' }}
                >
                  Comprar e ganhar pontos
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>

      <Footer />
    </>
  );
}
