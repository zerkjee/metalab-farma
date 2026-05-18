'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import StatCard from '@/components/admin/StatCard';
import LineChart from '@/components/admin/LineChart';
import { fmtCurrency, fmtDate } from '@/data/admin';
import { statusMap, orderStatusMeta } from '@/utils/adminOrders';
import { ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';

interface AnalyticsData {
  receitaDiaria: { label: string; value: number }[];
  topProdutos: { nome: string; vendas: number; receita: number; pct: number; cor: string }[];
  porStatus: { label: string; value: number; cor: string }[];
}

interface ReembolsoOrder {
  id: string;
  numero: string;
  compradorNome: string;
  compradorEmail: string;
  total: number;
  status: string;
  metodoPagamento: string | null;
  criadoEm: string;
}

interface AdminStats {
  faturamentoMes: number;
  pctFaturamento: number;
  pedidosMes: number;
  pedidosMesPassado: number;
  clientesMes: number;
  clientesTotal: number;
  ticketMedio: number;
  produtosAtivos: number;
  produtosEstoqueBaixo: number;
  cuponsAtivos: number;
  sparklinesReceita: number[];
  reembolsosMes: number;
  reembolsosCount: number;
  pedidosReembolsados: ReembolsoOrder[];
  recentOrders: {
    id: string;
    numero: string;
    compradorNome: string;
    compradorEmail: string;
    total: number;
    status: string;
    criadoEm: string;
  }[];
}

const CIRC = 2 * Math.PI * 36;

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [showReembolsos, setShowReembolsos] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then((data) => { if (!cancelled && !data.erro) setStats(data); })
      .catch(() => {});

    fetch('/api/admin/analytics')
      .then((r) => r.json())
      .then((data) => { if (!cancelled && !data.erro) setAnalytics(data); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const faturamento = stats?.faturamentoMes ?? 0;
  const pct = stats?.pctFaturamento ?? 0;
  const pedidosMes = stats?.pedidosMes ?? 0;
  const clientesMes = stats?.clientesMes ?? 0;
  const ticketMedio = stats?.ticketMedio ?? 0;
  const cuponsAtivos = stats?.cuponsAtivos ?? 0;

  const pedidosChange = stats?.pedidosMesPassado
    ? Math.round(((pedidosMes - (stats.pedidosMesPassado)) / (stats.pedidosMesPassado)) * 100)
    : 0;

  const statCards = [
    {
      label: 'Faturamento (mês)',
      value: fmtCurrency(faturamento),
      change: Math.round(pct),
      icon: '💰',
      sparkline: stats?.sparklinesReceita,
    },
    {
      label: 'Pedidos (mês)',
      value: String(pedidosMes),
      change: pedidosChange,
      icon: '🛍️',
      sparkline: undefined,
    },
    {
      label: 'Clientes novos',
      value: String(clientesMes),
      change: 0,
      icon: '👥',
      sparkline: undefined,
    },
    {
      label: 'Ticket médio',
      value: fmtCurrency(ticketMedio),
      change: 0,
      icon: '🎯',
      sparkline: undefined,
    },
    {
      label: 'Cupons ativos',
      value: String(cuponsAtivos),
      change: 0,
      icon: '🎫',
      sparkline: undefined,
    },
    {
      label: 'Estoque baixo',
      value: String(stats?.produtosEstoqueBaixo ?? 0),
      change: 0,
      icon: '📦',
      sparkline: undefined,
    },
  ];

  // Donut chart com dados de status reais
  const statusChartData = analytics?.porStatus ?? [];
  const totalStatus = statusChartData.reduce((s, d) => s + d.value, 0) || 1;
  // Acumula offset via reduce em vez de let — React 19 strict mode não aceita reassign após render
  const segments = statusChartData.reduce<{ acc: number; out: Array<typeof statusChartData[number] & { color: string; dasharray: string; dashoffset: number }> }>(
    (state, d) => {
      const pct2 = d.value / totalStatus;
      state.out.push({ ...d, color: d.cor, dasharray: `${pct2 * CIRC} ${CIRC}`, dashoffset: -state.acc * CIRC });
      state.acc += pct2;
      return state;
    },
    { acc: 0, out: [] },
  ).out;

  const recentOrders = stats?.recentOrders?.slice(0, 5) ?? [];

  return (
    <div className="flex flex-col gap-6">

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* ── Painel de Reembolsos ── */}
      <div className="rounded-2xl border border-slate-700/50 overflow-hidden" style={{ background: '#1e293b' }}>
        <button
          onClick={() => setShowReembolsos((v) => !v)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-700/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-500/10">
              <RotateCcw className="h-4 w-4 text-red-400" strokeWidth={1.8} />
            </div>
            <div className="text-left">
              <p className="text-sm font-black text-white">Reembolsos e Cancelamentos</p>
              <p className="text-xs text-slate-500">
                {stats
                  ? `${stats.reembolsosCount} no total · ${fmtCurrency(stats.reembolsosMes)} reembolsado este mês`
                  : 'Carregando...'}
              </p>
            </div>
          </div>
          {showReembolsos
            ? <ChevronUp className="h-4 w-4 text-slate-400" strokeWidth={2} />
            : <ChevronDown className="h-4 w-4 text-slate-400" strokeWidth={2} />}
        </button>

        {showReembolsos && (
          <div className="border-t border-slate-700/50 px-5 pb-5">

            {/* resumo */}
            <div className="grid grid-cols-3 gap-3 py-4">
              {[
                { label: 'Total reembolsado (mês)', value: fmtCurrency(stats?.reembolsosMes ?? 0), color: 'text-red-400' },
                { label: 'Qtd. de pedidos', value: String(stats?.reembolsosCount ?? 0), color: 'text-slate-200' },
                {
                  label: 'Ticket médio cancelado',
                  value: stats?.reembolsosCount
                    ? fmtCurrency((stats.pedidosReembolsados ?? []).reduce((s, p) => s + p.total, 0) / stats.reembolsosCount)
                    : '—',
                  color: 'text-slate-200',
                },
              ].map((item) => (
                <div key={item.label} className="rounded-xl bg-slate-900 p-3 text-center">
                  <p className={`text-lg font-black ${item.color}`}>{item.value}</p>
                  <p className="mt-1 text-[10px] text-slate-500">{item.label}</p>
                </div>
              ))}
            </div>

            {/* tabela */}
            {!stats ? (
              <div className="flex flex-col gap-2">
                {[1, 2].map((i) => <div key={i} className="h-12 rounded-xl bg-slate-700/50 animate-pulse" />)}
              </div>
            ) : (stats.pedidosReembolsados ?? []).length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-500">Nenhum reembolso ou cancelamento registrado.</p>
            ) : (
              <div className="overflow-hidden rounded-xl border border-slate-700/50">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-700/50 bg-slate-900/50">
                      <th className="px-4 py-2.5 text-left font-semibold text-slate-500">Pedido</th>
                      <th className="px-4 py-2.5 text-left font-semibold text-slate-500">Cliente</th>
                      <th className="px-4 py-2.5 text-center font-semibold text-slate-500">Status</th>
                      <th className="px-4 py-2.5 text-center font-semibold text-slate-500">Pagamento</th>
                      <th className="px-4 py-2.5 text-right font-semibold text-slate-500">Valor</th>
                      <th className="px-4 py-2.5 text-right font-semibold text-slate-500">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(stats.pedidosReembolsados ?? []).map((o, i) => {
                      const isReembolsado = o.status === 'REEMBOLSADO';
                      return (
                        <tr
                          key={o.id}
                          className={`transition-colors hover:bg-slate-700/20 ${i < (stats.pedidosReembolsados.length - 1) ? 'border-b border-slate-700/30' : ''}`}
                        >
                          <td className="px-4 py-3">
                            <Link href={`/admin/pedidos/${o.id}`} className="font-black text-purple-400 hover:text-purple-300">
                              {o.numero}
                            </Link>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-semibold text-slate-200 truncate max-w-[160px]">{o.compradorNome}</p>
                            <p className="text-slate-500 truncate max-w-[160px]">{o.compradorEmail}</p>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`rounded-full px-2.5 py-0.5 font-bold ${isReembolsado ? 'bg-blue-500/15 text-blue-400' : 'bg-red-500/15 text-red-400'}`}>
                              {isReembolsado ? 'Reembolsado' : 'Cancelado'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center text-slate-400">
                            {o.metodoPagamento ?? '—'}
                          </td>
                          <td className="px-4 py-3 text-right font-black text-white">
                            {fmtCurrency(o.total)}
                          </td>
                          <td className="px-4 py-3 text-right text-slate-500">
                            {fmtDate(o.criadoEm)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">

        <div className="lg:col-span-2 rounded-2xl border border-slate-700/50 p-5"
          style={{ background: '#1e293b' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold text-sm">Faturamento (14 dias)</h2>
          </div>
          {analytics?.receitaDiaria?.length ? (
            <LineChart
              data={analytics.receitaDiaria}
              color="#7c3aed"
              formatValue={(v) => `R$${(v / 1000).toFixed(1)}k`}
            />
          ) : (
            <div className="h-32 flex items-center justify-center">
              <p className="text-slate-500 text-sm">Nenhum dado de receita ainda.</p>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-700/50 p-5 flex flex-col gap-4"
          style={{ background: '#1e293b' }}>
          <h2 className="text-white font-bold text-sm">Pedidos por status</h2>
          {segments.length > 0 ? (
            <>
              <div className="flex justify-center">
                <svg width="100" height="100" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="36" fill="none" stroke="#0f172a" strokeWidth="14" />
                  {segments.map((seg, i) => (
                    <circle
                      key={i}
                      cx="50" cy="50" r="36"
                      fill="none"
                      stroke={seg.color}
                      strokeWidth="14"
                      strokeDasharray={seg.dasharray}
                      strokeDashoffset={seg.dashoffset}
                      transform="rotate(-90 50 50)"
                    />
                  ))}
                  <text x="50" y="54" textAnchor="middle" fill="white" style={{ fontSize: '10px', fontWeight: 700 }}>
                    {totalStatus}
                  </text>
                </svg>
              </div>
              <div className="flex flex-col gap-2">
                {statusChartData.map((c) => (
                  <div key={c.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: c.cor }} />
                      <span className="text-slate-300 text-xs">{c.label}</span>
                    </div>
                    <span className="text-slate-400 text-xs font-bold">{c.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-slate-500 text-sm text-center py-4">Nenhum pedido ainda.</p>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">

        <div className="rounded-2xl border border-slate-700/50 p-5"
          style={{ background: '#1e293b' }}>
          <h2 className="text-white font-bold text-sm mb-4">Top Produtos</h2>
          {analytics?.topProdutos?.length ? (
            <div className="flex flex-col gap-3">
              {analytics.topProdutos.map((p, i) => (
                <div key={p.nome}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 text-xs font-bold w-4">#{i + 1}</span>
                      <span className="text-slate-200 text-xs font-semibold truncate max-w-[140px]">{p.nome}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-white text-xs font-bold">{fmtCurrency(p.receita)}</p>
                      <p className="text-slate-500 text-[10px]">{p.vendas} vendas</p>
                    </div>
                  </div>
                  <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${p.pct}%`, background: p.cor }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm text-center py-4">Nenhuma venda ainda.</p>
          )}
        </div>

        <div className="rounded-2xl border border-slate-700/50 p-5"
          style={{ background: '#1e293b' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold text-sm">Pedidos Recentes</h2>
            <Link href="/admin/pedidos" className="text-purple-400 text-xs hover:text-purple-300">Ver todos</Link>
          </div>
          {!stats ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 rounded-xl bg-slate-700/50 animate-pulse" />
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-4">Nenhum pedido ainda.</p>
          ) : (
            <div className="flex flex-col gap-0">
              {recentOrders.map((o, i) => {
                const mappedStatus = statusMap[o.status] ?? 'aguardando_pagamento';
                const statusStyle = orderStatusMeta[mappedStatus];
                return (
                  <div key={o.id} className={`flex items-center gap-3 py-3 ${i < recentOrders.length - 1 ? 'border-b border-slate-700/50' : ''}`}>
                    <div className="w-8 h-8 rounded-xl bg-slate-700 flex items-center justify-center text-white text-xs font-black flex-shrink-0">
                      {o.compradorNome.split(' ').map((w: string) => w[0]).slice(0, 2).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-200 text-xs font-semibold truncate">{o.compradorNome}</p>
                      <p className="text-slate-500 text-[10px]">{o.numero} · {fmtDate(o.criadoEm)}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-white text-xs font-bold">{fmtCurrency(o.total)}</p>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
                        {statusStyle.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
