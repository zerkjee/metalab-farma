'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import LevelBadge from '@/components/loyalty/LevelBadge';
import {
  mockUser, levels, achievements, cashbackHistory, coupons,
  getLevelConfig, getNextLevel, getProgressToNext,
} from '@/data/loyalty';
import { CashbackEntry, Coupon } from '@/types/loyalty';

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatCurrency(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
}

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      onClick={copy}
      className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all duration-200 ${
        copied ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-white/30 text-white/70 hover:border-white/60 hover:text-white'
      }`}
    >
      {copied ? '✓ Copiado' : 'Copiar'}
    </button>
  );
}

function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white/[0.06] border border-white/10 rounded-2xl backdrop-blur-sm ${className}`}>
      {children}
    </div>
  );
}

function CashbackRow({ entry }: { entry: CashbackEntry }) {
  const earned = entry.type === 'earned';
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${earned ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
          {earned ? '↑' : '↓'}
        </div>
        <div>
          <p className="text-white text-sm font-medium">{entry.description}</p>
          <p className="text-white/40 text-xs">{formatDate(entry.date)}{entry.orderId ? ` · ${entry.orderId}` : ''}</p>
        </div>
      </div>
      <span className={`font-bold text-sm ${earned ? 'text-emerald-400' : 'text-red-400'}`}>
        {earned ? '+' : '-'}{formatCurrency(entry.amount)}
      </span>
    </div>
  );
}

function CouponCard({ coupon }: { coupon: Coupon }) {
  const cfg = getLevelConfig(coupon.level);
  return (
    <div className="relative rounded-2xl overflow-hidden border border-white/10">
      {/* Stripe lateral */}
      <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ background: cfg.gradient }} />

      <div className="pl-5 pr-4 py-4 bg-white/[0.04]">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <p className="text-white font-bold text-sm">{coupon.title}</p>
            <p className="text-white/50 text-xs mt-0.5">{coupon.description}</p>
          </div>
          <span className="text-lg font-black flex-shrink-0" style={{ color: cfg.color }}>{coupon.discount}</span>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div>
            <code className="text-xs font-mono font-bold tracking-widest px-2.5 py-1 rounded-lg bg-white/10 text-white/80">
              {coupon.code}
            </code>
            {coupon.minOrder > 0 && (
              <p className="text-white/30 text-[10px] mt-1">Mínimo {formatCurrency(coupon.minOrder)}</p>
            )}
          </div>
          <div className="text-right">
            <CopyButton code={coupon.code} />
            <p className="text-white/30 text-[10px] mt-1">Até {formatDate(coupon.validUntil)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VipPage() {
  const user = mockUser;
  const levelCfg = getLevelConfig(user.level);
  const nextLevel = getNextLevel(user.level);
  const progress = getProgressToNext(user);
  const pointsToNext = nextLevel ? nextLevel.minPoints - user.points : 0;

  const [historyExpanded, setHistoryExpanded] = useState(false);
  const visibleHistory = historyExpanded ? cashbackHistory : cashbackHistory.slice(0, 4);

  return (
    <>
      <ScrollToTop />
      <Header />

      {/* ── HERO ── */}
      <section
        className="relative overflow-hidden pb-32 pt-16"
        style={{ background: 'linear-gradient(135deg, #0f0522 0%, #1a0533 40%, #1e3a5f 100%)' }}
      >
        {/* Círculos decorativos */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-10 pointer-events-none"
          style={{ background: `radial-gradient(circle, ${levelCfg.color}, transparent)`, transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-5 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #7c3aed, transparent)', transform: 'translate(-30%, 30%)' }} />
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Topo: badge + nível */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-10">
            <div>
              <p className="text-white/50 text-sm mb-1">Área do Cliente</p>
              <h1 className="text-3xl sm:text-4xl font-black text-white">
                Olá, {user.firstName}! <span style={{ color: levelCfg.color }}>{levelCfg.emoji}</span>
              </h1>
              <p className="text-white/50 text-sm mt-1">Membro desde {formatDate(user.memberSince)}</p>
            </div>
            <div className="flex items-center gap-3 bg-white/[0.07] border border-white/10 rounded-2xl px-5 py-3">
              <LevelBadge level={user.level} size="lg" />
              <div>
                <p className="text-xs text-white/50 uppercase tracking-widest">Nível atual</p>
                <p className="font-black text-xl uppercase tracking-wide" style={{ color: levelCfg.color }}>
                  {levelCfg.name}
                </p>
              </div>
            </div>
          </div>

          {/* Stats rápidos */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            {[
              { label: 'Pontos', value: user.points.toLocaleString('pt-BR'), sub: 'acumulados', color: levelCfg.color },
              { label: 'Cashback', value: formatCurrency(user.cashbackBalance), sub: 'disponível', color: '#34d399' },
              { label: 'Pedidos', value: user.totalOrders, sub: 'realizados', color: '#60a5fa' },
              { label: 'Economia', value: formatCurrency(user.cashbackUsed), sub: 'com cashback', color: '#f472b6' },
            ].map(({ label, value, sub, color }) => (
              <GlassCard key={label} className="p-5 text-center">
                <p className="text-white/40 text-xs uppercase tracking-wide mb-1">{label}</p>
                <p className="text-2xl font-black" style={{ color }}>{value}</p>
                <p className="text-white/30 text-xs mt-0.5">{sub}</p>
              </GlassCard>
            ))}
          </div>

          {/* Progresso ao próximo nível */}
          {nextLevel && (
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <LevelBadge level={user.level} size="sm" />
                  <span className="text-white/50 text-sm">→</span>
                  <LevelBadge level={nextLevel.id} size="sm" />
                  <span className="text-white font-bold text-sm">
                    Faltam <span style={{ color: nextLevel.color }}>{pointsToNext.toLocaleString('pt-BR')} pts</span> para o nível {nextLevel.name}
                  </span>
                </div>
                <span className="text-white/40 text-sm font-bold">{progress}%</span>
              </div>
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${progress}%`, background: levelCfg.gradient }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-white/30">
                <span>{user.points.toLocaleString('pt-BR')} pts</span>
                <span>{nextLevel.minPoints.toLocaleString('pt-BR')} pts</span>
              </div>
            </GlassCard>
          )}
        </div>
      </section>

      {/* ── CONTEÚDO PRINCIPAL (fundo escuro contínuo) ── */}
      <div style={{ background: 'linear-gradient(180deg, #1a0533 0%, #0f172a 100%)' }} className="-mt-20 pt-8 pb-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Cashback + Cupons */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">

            {/* Cashback */}
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-white font-black text-lg">💰 Cashback</h2>
                <div className="text-right">
                  <p className="text-2xl font-black text-emerald-400">{formatCurrency(user.cashbackBalance)}</p>
                  <p className="text-white/40 text-xs">disponível para usar</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <p className="text-emerald-400 font-black text-lg">{levelCfg.cashbackPct}%</p>
                  <p className="text-white/40 text-xs">sua taxa atual</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <p className="text-white font-black text-lg">{formatCurrency(user.cashbackUsed)}</p>
                  <p className="text-white/40 text-xs">já economizados</p>
                </div>
              </div>
              <div className="space-y-0 max-h-56 overflow-y-auto pr-1">
                {visibleHistory.map((e) => <CashbackRow key={e.id} entry={e} />)}
              </div>
              {cashbackHistory.length > 4 && (
                <button
                  onClick={() => setHistoryExpanded((v) => !v)}
                  className="mt-4 text-xs font-bold text-white/40 hover:text-white/70 transition-colors w-full text-center"
                >
                  {historyExpanded ? 'Mostrar menos ↑' : `Ver mais ${cashbackHistory.length - 4} entradas ↓`}
                </button>
              )}
            </GlassCard>

            {/* Cupons */}
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-white font-black text-lg">🎫 Cupons Ativos</h2>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: levelCfg.color + '30', color: levelCfg.color }}>
                  {coupons.filter(c => !c.used).length} disponíveis
                </span>
              </div>
              <div className="flex flex-col gap-4">
                {coupons.filter(c => !c.used).map((c) => <CouponCard key={c.id} coupon={c} />)}
              </div>
            </GlassCard>
          </div>

          {/* Conquistas */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-black text-xl">🏆 Conquistas</h2>
              <span className="text-white/40 text-sm">
                {achievements.filter(a => a.unlocked).length}/{achievements.length} desbloqueadas
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {achievements.map((ach) => (
                <div
                  key={ach.id}
                  className={`rounded-2xl p-5 border transition-all duration-300 flex flex-col gap-3 ${
                    ach.unlocked
                      ? 'bg-white/[0.07] border-white/15 hover:bg-white/10'
                      : 'bg-white/[0.02] border-white/5 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-3xl ${!ach.unlocked ? 'grayscale opacity-40' : ''}`}>{ach.icon}</span>
                    {ach.unlocked ? (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">✓ Desbloqueada</span>
                    ) : (
                      <span className="text-[10px] font-bold text-white/30 bg-white/5 px-2 py-0.5 rounded-full">Bloqueada</span>
                    )}
                  </div>
                  <div>
                    <p className={`font-bold text-sm ${ach.unlocked ? 'text-white' : 'text-white/40'}`}>{ach.title}</p>
                    <p className="text-white/30 text-xs mt-0.5 leading-snug">{ach.description}</p>
                  </div>
                  {ach.unlocked ? (
                    <span className="text-xs font-bold" style={{ color: levelCfg.color }}>{ach.reward}</span>
                  ) : (
                    ach.progress !== undefined && ach.maxProgress !== undefined && (
                      <div>
                        <div className="flex justify-between text-[10px] text-white/30 mb-1">
                          <span>{ach.progress.toLocaleString('pt-BR')}</span>
                          <span>{ach.maxProgress.toLocaleString('pt-BR')}</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-white/30"
                            style={{ width: `${Math.min(100, (ach.progress / ach.maxProgress) * 100)}%` }}
                          />
                        </div>
                      </div>
                    )
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Benefícios por nível */}
          <div className="mb-10">
            <h2 className="text-white font-black text-xl mb-5">⚡ Benefícios por Nível</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {levels.map((lvl) => {
                const isCurrentLevel = lvl.id === user.level;
                return (
                  <div
                    key={lvl.id}
                    className={`rounded-2xl p-6 border transition-all duration-300 relative overflow-hidden ${
                      isCurrentLevel ? 'border-white/25' : 'border-white/8 opacity-75'
                    }`}
                    style={{ background: isCurrentLevel ? lvl.gradientCard : 'rgba(255,255,255,0.03)' }}
                  >
                    {isCurrentLevel && (
                      <div className="absolute top-3 right-3 text-[10px] font-black px-2.5 py-1 rounded-full text-white"
                        style={{ background: lvl.color + '50' }}>
                        Seu nível
                      </div>
                    )}

                    {/* Badge */}
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-lg"
                        style={{ background: lvl.gradient }}>
                        {lvl.emoji}
                      </div>
                      <div>
                        <p className="font-black text-base uppercase tracking-widest" style={{ color: lvl.color }}>{lvl.name}</p>
                        <p className="text-white/40 text-xs">
                          {lvl.maxPoints ? `${lvl.minPoints.toLocaleString('pt-BR')}–${lvl.maxPoints.toLocaleString('pt-BR')} pts` : `${lvl.minPoints.toLocaleString('pt-BR')}+ pts`}
                        </p>
                      </div>
                    </div>

                    {/* Cashback destaque */}
                    <div className="mb-5 py-3 px-4 rounded-xl bg-white/5 text-center">
                      <span className="text-3xl font-black" style={{ color: lvl.color }}>{lvl.cashbackPct}%</span>
                      <span className="text-white/50 text-sm ml-1">cashback</span>
                    </div>

                    {/* Benefícios */}
                    <ul className="flex flex-col gap-2.5">
                      {lvl.benefits.map((b) => (
                        <li key={b.text} className="flex items-start gap-2 text-xs">
                          <span className="text-base leading-none mt-0.5 flex-shrink-0">{b.icon}</span>
                          <span className={isCurrentLevel ? 'text-white/80' : 'text-white/40'}>{b.text}</span>
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
              className="rounded-2xl p-8 border border-white/10 text-center relative overflow-hidden"
              style={{ background: nextLevel.gradientCard }}
            >
              <div className="absolute inset-0 opacity-5"
                style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
              <div className="relative">
                <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-5xl mx-auto mb-5 shadow-2xl"
                  style={{ background: nextLevel.gradient }}>
                  {nextLevel.emoji}
                </div>
                <h3 className="text-2xl font-black text-white mb-2">
                  Faltam <span style={{ color: nextLevel.color }}>{pointsToNext.toLocaleString('pt-BR')} pontos</span> para o {nextLevel.name}
                </h3>
                <p className="text-white/60 mb-6 max-w-md mx-auto text-sm leading-relaxed">
                  Suba para o nível {nextLevel.name} e desbloqueie {nextLevel.cashbackPct}% cashback, além de benefícios exclusivos.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="/#produtos"
                    className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white text-sm transition-all duration-200 hover:scale-105 hover:shadow-2xl"
                    style={{ background: 'linear-gradient(135deg, #6b21a8, #7c3aed)' }}
                  >
                    Comprar agora e ganhar pontos
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
