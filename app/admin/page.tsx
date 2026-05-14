'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import StatCard from '@/components/admin/StatCard';
import LineChart from '@/components/admin/LineChart';
import {
  revenueChart, visitorsChart,
  topProducts, categoryChart, fmtCurrency, fmtDate,
  statusColors,
} from '@/data/admin';

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
  const [chartTab, setChartTab] = useState<'revenue' | 'visitors'>('revenue');
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then((data) => {
        if (!data.erro) setStats(data);
      })
      .catch(() => {});
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

  // Donut chart
  const total = categoryChart.reduce((s, d) => s + d.value, 0);
  let offset = 0;
  const segments = categoryChart.map((d) => {
    const pct2 = d.value / total;
    const seg = { ...d, dasharray: `${pct2 * CIRC} ${CIRC}`, dashoffset: -offset * CIRC };
    offset += pct2;
    return seg;
  });

  const recentOrders = stats?.recentOrders?.slice(0, 5) ?? [];

  return (
    <div className="flex flex-col gap-6">

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">

        <div className="lg:col-span-2 rounded-2xl border border-slate-700/50 p-5"
          style={{ background: '#1e293b' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold text-sm">Desempenho</h2>
            <div className="flex gap-1">
              {(['revenue', 'visitors'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setChartTab(t)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    chartTab === t
                      ? 'bg-purple-600 text-white'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  {t === 'revenue' ? 'Faturamento' : 'Visitantes'}
                </button>
              ))}
            </div>
          </div>
          <LineChart
            data={chartTab === 'revenue' ? revenueChart : visitorsChart}
            color={chartTab === 'revenue' ? '#7c3aed' : '#0ea5e9'}
            formatValue={chartTab === 'revenue' ? (v) => `R$${(v / 1000).toFixed(1)}k` : undefined}
          />
        </div>

        <div className="rounded-2xl border border-slate-700/50 p-5 flex flex-col gap-4"
          style={{ background: '#1e293b' }}>
          <h2 className="text-white font-bold text-sm">Categorias</h2>
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
                {total}%
              </text>
            </svg>
          </div>
          <div className="flex flex-col gap-2">
            {categoryChart.map((c) => (
              <div key={c.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: c.color }} />
                  <span className="text-slate-300 text-xs">{c.label}</span>
                </div>
                <span className="text-slate-400 text-xs font-bold">{c.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">

        <div className="rounded-2xl border border-slate-700/50 p-5"
          style={{ background: '#1e293b' }}>
          <h2 className="text-white font-bold text-sm mb-4">Top Produtos</h2>
          <div className="flex flex-col gap-3">
            {topProducts.map((p, i) => (
              <div key={p.name}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-xs font-bold w-4">#{i + 1}</span>
                    <span className="text-slate-200 text-xs font-semibold">{p.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-white text-xs font-bold">{fmtCurrency(p.revenue)}</p>
                    <p className="text-slate-500 text-[10px]">{p.sold} vendas</p>
                  </div>
                </div>
                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${p.pct}%`, background: p.color }} />
                </div>
              </div>
            ))}
          </div>
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
                const statusKey = o.status as keyof typeof statusColors;
                const statusStyle = statusColors[statusKey] ?? { bg: 'bg-slate-700', text: 'text-slate-300' };
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
                        {statusKey}
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
