'use client';

import { useState } from 'react';
import LineChart from '@/components/admin/LineChart';
import { revenueChart, visitorsChart, topProducts, categoryChart, orders, fmtCurrency } from '@/data/admin';

const conversionChart = visitorsChart.map((d, i) => ({
  label: d.label,
  value: parseFloat(((revenueChart[i].value / d.value / 10) * 0.8 + 2).toFixed(1)),
}));

const ordersByStatus = [
  { label: 'Entregues',    value: orders.filter(o => o.status === 'entregue').length,    color: '#10b981' },
  { label: 'Enviados',     value: orders.filter(o => o.status === 'enviado').length,      color: '#0ea5e9' },
  { label: 'Processando',  value: orders.filter(o => o.status === 'processando').length,  color: '#7c3aed' },
  { label: 'Pendentes',    value: orders.filter(o => o.status === 'pendente').length,     color: '#f59e0b' },
  { label: 'Cancelados',   value: orders.filter(o => o.status === 'cancelado').length,    color: '#f87171' },
];

const weekdaySales = [
  { label: 'Dom', value: 42 },
  { label: 'Seg', value: 78 },
  { label: 'Ter', value: 65 },
  { label: 'Qua', value: 91 },
  { label: 'Qui', value: 83 },
  { label: 'Sex', value: 97 },
  { label: 'Sáb', value: 55 },
];
const maxWeekday = Math.max(...weekdaySales.map(d => d.value));

const paymentMethods = [
  { label: 'Pix',            pct: 52, color: '#10b981' },
  { label: 'Cartão crédito', pct: 31, color: '#7c3aed' },
  { label: 'Boleto',         pct: 17, color: '#f59e0b' },
];

export default function AdminAnalytics() {
  const [tab, setTab] = useState<'revenue' | 'visitors' | 'conversion'>('revenue');

  const chartData = tab === 'revenue' ? revenueChart : tab === 'visitors' ? visitorsChart : conversionChart;
  const chartColor = tab === 'revenue' ? '#7c3aed' : tab === 'visitors' ? '#0ea5e9' : '#10b981';
  const fmtFn = tab === 'revenue'
    ? (v: number) => `R$${(v / 1000).toFixed(1)}k`
    : tab === 'conversion'
    ? (v: number) => `${v}%`
    : undefined;

  const totalRevenue = revenueChart.reduce((s, d) => s + d.value, 0);
  const totalVisitors = visitorsChart.reduce((s, d) => s + d.value, 0);

  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <div>
        <h2 className="text-white font-black text-lg">Analytics</h2>
        <p className="text-slate-500 text-xs">Últimos 14 dias</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Faturamento 14d',  value: fmtCurrency(totalRevenue),         icon: '💰', sub: '+12.3% vs anterior' },
          { label: 'Visitantes 14d',   value: totalVisitors.toLocaleString('pt-BR'), icon: '👁️', sub: '+18.5% vs anterior' },
          { label: 'Taxa conversão',   value: '3.2%',                             icon: '🎯', sub: 'Meta: 4%' },
          { label: 'Ticket médio',     value: fmtCurrency(153.30),                icon: '🧾', sub: '+3.1% vs anterior' },
        ].map((k) => (
          <div key={k.label} className="rounded-2xl border border-slate-700/50 p-5" style={{ background: '#1e293b' }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{k.icon}</span>
              <p className="text-slate-400 text-xs">{k.label}</p>
            </div>
            <p className="text-2xl font-black text-white">{k.value}</p>
            <p className="text-slate-500 text-[10px] mt-1">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Main chart */}
      <div className="rounded-2xl border border-slate-700/50 p-5" style={{ background: '#1e293b' }}>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h3 className="text-white font-bold text-sm">Evolução Diária</h3>
          <div className="flex gap-1">
            {([
              { key: 'revenue',    label: 'Faturamento' },
              { key: 'visitors',   label: 'Visitantes' },
              { key: 'conversion', label: 'Conversão' },
            ] as const).map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  tab === t.key ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                }`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <LineChart data={chartData} color={chartColor} height={180} formatValue={fmtFn} />
      </div>

      {/* Three-column section */}
      <div className="grid lg:grid-cols-3 gap-4">

        {/* Top products */}
        <div className="rounded-2xl border border-slate-700/50 p-5" style={{ background: '#1e293b' }}>
          <h3 className="text-white font-bold text-sm mb-4">Produtos mais vendidos</h3>
          <div className="flex flex-col gap-3">
            {topProducts.map((p, i) => (
              <div key={p.name}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600 text-xs font-black w-4">#{i + 1}</span>
                    <span className="text-slate-200 text-xs">{p.name}</span>
                  </div>
                  <span className="text-slate-400 text-xs font-semibold">{p.sold} un.</span>
                </div>
                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${p.pct}%`, background: p.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category donut */}
        <div className="rounded-2xl border border-slate-700/50 p-5" style={{ background: '#1e293b' }}>
          <h3 className="text-white font-bold text-sm mb-4">Por categoria</h3>
          <div className="flex flex-col gap-2">
            {categoryChart.map((c) => (
              <div key={c.label} className="flex items-center gap-3">
                <div className="w-20 flex-shrink-0">
                  <div className="flex justify-between mb-0.5">
                    <span className="text-slate-400 text-[10px]">{c.label}</span>
                    <span className="text-slate-400 text-[10px] font-bold">{c.value}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden w-full">
                    <div className="h-full rounded-full" style={{ width: `${c.value}%`, background: c.color }} />
                  </div>
                </div>
                <div className="flex-1 h-5 rounded bg-slate-800 overflow-hidden">
                  <div className="h-full rounded transition-all" style={{ width: `${c.value}%`, background: c.color + '60' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment methods */}
        <div className="rounded-2xl border border-slate-700/50 p-5" style={{ background: '#1e293b' }}>
          <h3 className="text-white font-bold text-sm mb-4">Forma de pagamento</h3>
          <div className="flex flex-col gap-3">
            {paymentMethods.map((pm) => (
              <div key={pm.label}>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-300 text-xs">{pm.label}</span>
                  <span className="text-slate-400 text-xs font-bold">{pm.pct}%</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pm.pct}%`, background: pm.color }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-700/50">
            <h4 className="text-slate-400 text-xs font-semibold mb-3">Pedidos por status</h4>
            <div className="flex flex-col gap-2">
              {ordersByStatus.map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
                    <span className="text-slate-400 text-xs">{s.label}</span>
                  </div>
                  <span className="text-slate-300 text-xs font-bold">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Weekday bar chart */}
      <div className="rounded-2xl border border-slate-700/50 p-5" style={{ background: '#1e293b' }}>
        <h3 className="text-white font-bold text-sm mb-4">Vendas por dia da semana</h3>
        <div className="flex items-end gap-3 h-32">
          {weekdaySales.map((d) => (
            <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-slate-500 text-[10px]">{d.value}</span>
              <div className="w-full rounded-t-lg transition-all"
                style={{
                  height: `${(d.value / maxWeekday) * 100}%`,
                  background: d.value === maxWeekday ? 'linear-gradient(to top, #6b21a8, #7c3aed)' : '#334155',
                  minHeight: '4px',
                }} />
              <span className="text-slate-500 text-[10px]">{d.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
