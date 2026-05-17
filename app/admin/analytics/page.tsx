'use client';

import { useEffect, useState } from 'react';
import LineChart from '@/components/admin/LineChart';

interface AnalyticsData {
  receitaDiaria: { label: string; value: number }[];
  topProdutos: { nome: string; vendas: number; receita: number; pct: number; cor: string }[];
  porStatus: { label: string; value: number; cor: string }[];
  metodosPagamento: { label: string; pct: number; cor: string }[];
  ltvMedio: number;
  taxaRecompra: number;
  ticketMedio: number;
  pedidosHoje: number;
  totalPedidos: number;
  totalPago: number;
  conversaoFunil: number;
}

function fmtCurrency(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then((r) => r.json())
      .then((d) => { if (!d.erro) setData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalReceita = data?.receitaDiaria.reduce((s, d) => s + d.value, 0) ?? 0;
  const totalVendas = data?.topProdutos.reduce((s, p) => s + p.vendas, 0) ?? 0;

  return (
    <div className="flex flex-col gap-5">

      <div>
        <h2 className="text-white font-black text-lg">Analytics</h2>
        <p className="text-slate-500 text-xs">Dados reais — últimos 14 dias + métricas acumuladas</p>
      </div>

      {/* KPI row — receita e volume */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Faturamento 14d',   value: loading ? '—' : fmtCurrency(totalReceita), sub: 'pedidos pagos' },
          { label: 'Ticket médio',       value: loading ? '—' : fmtCurrency(data?.ticketMedio ?? 0), sub: 'por pedido' },
          { label: 'Unidades vendidas',  value: loading ? '—' : String(totalVendas), sub: '14 dias' },
          { label: 'Pedidos hoje',       value: loading ? '—' : String(data?.pedidosHoje ?? 0), sub: 'criados hoje' },
        ].map((k) => (
          <div key={k.label} className="rounded-2xl border border-slate-700/50 p-5" style={{ background: '#1e293b' }}>
            <p className="text-slate-400 text-xs mb-2">{k.label}</p>
            <p className="text-2xl font-black text-white">{k.value}</p>
            <p className="text-slate-600 text-xs mt-1">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* KPI row — retenção */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-700/50 p-5" style={{ background: '#1e293b' }}>
          <p className="text-slate-400 text-xs mb-1">LTV médio por cliente</p>
          <p className="text-2xl font-black text-emerald-400">{loading ? '—' : fmtCurrency(data?.ltvMedio ?? 0)}</p>
          <p className="text-slate-600 text-xs mt-1">receita total ÷ clientes únicos</p>
        </div>
        <div className="rounded-2xl border border-slate-700/50 p-5" style={{ background: '#1e293b' }}>
          <p className="text-slate-400 text-xs mb-1">Taxa de recompra</p>
          <p className="text-2xl font-black text-sky-400">{loading ? '—' : `${data?.taxaRecompra ?? 0}%`}</p>
          <p className="text-slate-600 text-xs mt-1">clientes com 2+ pedidos</p>
        </div>
        <div className="rounded-2xl border border-slate-700/50 p-5" style={{ background: '#1e293b' }}>
          <div className="flex justify-between mb-2">
            <p className="text-slate-400 text-xs">Funil de conversão</p>
            <p className="text-violet-400 font-black text-sm">{loading ? '—' : `${data?.conversaoFunil ?? 0}%`}</p>
          </div>
          <div className="flex flex-col gap-1.5 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>Pedidos criados</span>
              <span className="font-bold text-slate-300">{loading ? '—' : data?.totalPedidos ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Pagos/aprovados</span>
              <span className="font-bold text-emerald-400">{loading ? '—' : data?.totalPago ?? 0}</span>
            </div>
          </div>
          {!loading && (
            <div className="mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-violet-500 rounded-full" style={{ width: `${data?.conversaoFunil ?? 0}%` }} />
            </div>
          )}
        </div>
      </div>

      {/* Gráfico de receita diária */}
      <div className="rounded-2xl border border-slate-700/50 p-5" style={{ background: '#1e293b' }}>
        <h3 className="text-white font-bold text-sm mb-4">Receita Diária (últimos 14 dias)</h3>
        {loading ? (
          <div className="h-44 rounded-xl bg-slate-700/50 animate-pulse" />
        ) : data && data.receitaDiaria.length > 0 ? (
          <LineChart
            data={data.receitaDiaria}
            color="#7c3aed"
            height={180}
            formatValue={(v) => `R$${(v / 1000).toFixed(1)}k`}
          />
        ) : (
          <p className="text-slate-500 text-sm text-center py-10">Nenhum pedido pago nos últimos 14 dias.</p>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">

        {/* Top produtos */}
        <div className="rounded-2xl border border-slate-700/50 p-5" style={{ background: '#1e293b' }}>
          <h3 className="text-white font-bold text-sm mb-4">Produtos mais vendidos</h3>
          {loading ? (
            <div className="flex flex-col gap-3">{[1,2,3].map(i => <div key={i} className="h-8 rounded bg-slate-700/50 animate-pulse" />)}</div>
          ) : data?.topProdutos.length ? (
            <div className="flex flex-col gap-3">
              {data.topProdutos.map((p, i) => (
                <div key={p.nome}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600 text-xs font-black w-4">#{i + 1}</span>
                      <span className="text-slate-200 text-xs truncate max-w-[120px]">{p.nome}</span>
                    </div>
                    <span className="text-slate-400 text-xs font-semibold">{p.vendas} un.</span>
                  </div>
                  <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${p.pct}%`, background: p.cor }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-xs text-center py-4">Nenhuma venda ainda.</p>
          )}
        </div>

        {/* Pedidos por status */}
        <div className="rounded-2xl border border-slate-700/50 p-5" style={{ background: '#1e293b' }}>
          <h3 className="text-white font-bold text-sm mb-4">Pedidos por status</h3>
          {loading ? (
            <div className="flex flex-col gap-2">{[1,2,3,4].map(i => <div key={i} className="h-6 rounded bg-slate-700/50 animate-pulse" />)}</div>
          ) : data?.porStatus.length ? (
            <div className="flex flex-col gap-2">
              {data.porStatus.map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.cor }} />
                    <span className="text-slate-400 text-xs">{s.label}</span>
                  </div>
                  <span className="text-slate-300 text-xs font-bold">{s.value}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-xs text-center py-4">Nenhum pedido ainda.</p>
          )}
        </div>

        {/* Métodos de pagamento */}
        <div className="rounded-2xl border border-slate-700/50 p-5" style={{ background: '#1e293b' }}>
          <h3 className="text-white font-bold text-sm mb-4">Forma de pagamento</h3>
          {loading ? (
            <div className="flex flex-col gap-3">{[1,2,3].map(i => <div key={i} className="h-8 rounded bg-slate-700/50 animate-pulse" />)}</div>
          ) : data?.metodosPagamento.length ? (
            <div className="flex flex-col gap-3">
              {data.metodosPagamento.map((pm) => (
                <div key={pm.label}>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-300 text-xs">{pm.label}</span>
                    <span className="text-slate-400 text-xs font-bold">{pm.pct}%</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pm.pct}%`, background: pm.cor }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-xs text-center py-4">Nenhum pagamento registrado.</p>
          )}
        </div>
      </div>

      {/* Aviso visitantes */}
      <div className="rounded-2xl border border-slate-700/30 p-5 flex items-center gap-4" style={{ background: '#1e293b' }}>
        <span className="text-2xl">📊</span>
        <div>
          <p className="text-slate-300 text-sm font-semibold">Tráfego e conversão por sessão</p>
          <p className="text-slate-500 text-xs">Disponível após configurar <code className="text-violet-400">NEXT_PUBLIC_GA4_ID</code> na Vercel — os eventos add_to_cart, begin_checkout e purchase já estão sendo rastreados.</p>
        </div>
      </div>

    </div>
  );
}
