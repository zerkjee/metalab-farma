'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface HealthData {
  db: { ok: boolean; latencyMs: number; counts: Record<string, number> };
  env: Record<string, 'ok' | 'missing'>;
  build: { nodeVersion: string; nextVersion: string; env: string };
  routes: { path: string; ok: boolean; latencyMs: number }[];
}

function Badge({ ok }: { ok: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
        ok ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${ok ? 'bg-emerald-400' : 'bg-red-400'}`} />
      {ok ? 'OK' : 'FALHA'}
    </span>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
      <div className="border-b border-slate-800 px-5 py-3.5">
        <h2 className="text-sm font-black text-white uppercase tracking-wider">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export default function DevPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const isSuperAdmin = session?.user?.role === 'SUPER_ADMIN';
  const isDev = process.env.NODE_ENV === 'development';
  const allowed = isSuperAdmin || isDev;

  async function loadHealth() {
    setLoading(true);
    const res = await fetch('/api/dev/health');
    if (res.ok) {
      setHealth(await res.json());
      setLastRefresh(new Date());
    }
    setLoading(false);
  }

  useEffect(() => {
    if (status === 'loading') return;
    if (!allowed) { router.replace('/admin'); return; }
    loadHealth();
  }, [status, allowed, router]);

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white/40 text-sm">Verificando acesso...</div>;
  }

  if (!allowed) return null;

  return (
    <div
      className="min-h-screen text-white px-6 py-8"
      style={{ background: 'linear-gradient(135deg, #020617, #0f172a)' }}
    >
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-widest text-purple-400">Sistema</span>
              {isDev && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 uppercase tracking-wide">
                  Development
                </span>
              )}
            </div>
            <h1 className="text-2xl font-black text-white">Painel do Dev</h1>
            {lastRefresh && (
              <p className="text-slate-500 text-xs mt-1">
                Atualizado às {lastRefresh.toLocaleTimeString('pt-BR')}
              </p>
            )}
          </div>
          <button
            onClick={loadHealth}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-bold text-slate-200 hover:bg-slate-700 transition-all disabled:opacity-50"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Atualizar
          </button>
        </div>

        {loading && !health ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 rounded-2xl bg-slate-800/50 animate-pulse" />
            ))}
          </div>
        ) : health ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* DB */}
            <Section title="Banco de Dados">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Badge ok={health.db.ok} />
                  <span className="text-slate-400 text-sm">{health.db.latencyMs}ms</span>
                </div>
                <span className="text-xs text-slate-500 font-mono">Supabase / PostgreSQL</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(health.db.counts).map(([table, count]) => (
                  <div key={table} className="flex items-center justify-between rounded-lg bg-slate-800/60 px-3 py-2">
                    <span className="text-slate-400 text-xs font-mono">{table}</span>
                    <span className="text-white text-sm font-black">{count}</span>
                  </div>
                ))}
              </div>
            </Section>

            {/* Env vars */}
            <Section title="Variáveis de Ambiente">
              <div className="flex flex-col gap-2">
                {Object.entries(health.env).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-slate-400 text-xs font-mono truncate">{key}</span>
                    <Badge ok={val === 'ok'} />
                  </div>
                ))}
              </div>
            </Section>

            {/* Build info */}
            <Section title="Build">
              <div className="flex flex-col gap-3">
                {[
                  { label: 'Node.js', value: health.build.nodeVersion },
                  { label: 'Next.js', value: health.build.nextVersion },
                  { label: 'Ambiente', value: health.build.env },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">{label}</span>
                    <span className="text-white text-sm font-mono font-bold">{value}</span>
                  </div>
                ))}
              </div>
            </Section>

            {/* API routes */}
            <Section title="Rotas de API">
              <div className="flex flex-col gap-2">
                {health.routes.map((route) => (
                  <div key={route.path} className="flex items-center justify-between">
                    <span className="text-slate-400 text-xs font-mono truncate">{route.path}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 text-xs">{route.latencyMs}ms</span>
                      <Badge ok={route.ok} />
                    </div>
                  </div>
                ))}
              </div>
            </Section>

          </div>
        ) : (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center">
            <p className="text-red-400 font-bold">Falha ao carregar dados de saúde.</p>
            <button onClick={loadHealth} className="mt-3 text-sm text-slate-400 hover:text-white transition-colors">
              Tentar novamente
            </button>
          </div>
        )}

        {/* Session info */}
        <div className="mt-5">
          <Section title="Sessão Atual">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { label: 'ID', value: session?.user?.id ?? '—' },
                { label: 'Email', value: session?.user?.email ?? '—' },
                { label: 'Papel', value: session?.user?.role ?? '—' },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-lg bg-slate-800/60 px-3 py-2">
                  <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-0.5">{label}</p>
                  <p className="text-white text-xs font-mono truncate">{value}</p>
                </div>
              ))}
            </div>
          </Section>
        </div>

      </div>
    </div>
  );
}
