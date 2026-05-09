'use client';

import { useState } from 'react';
import { orders, statusColors, fmtCurrency, fmtDate, type OrderStatus } from '@/data/admin';
import StatusBadge from '@/components/admin/StatusBadge';
import Modal from '@/components/admin/Modal';

export default function AdminPedidos() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'todos'>('todos');
  const [selected, setSelected] = useState<typeof orders[0] | null>(null);

  const filtered = orders.filter((o) => {
    const matchSearch =
      o.customer.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'todos' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-white font-black text-lg">Pedidos</h2>
          <p className="text-slate-500 text-xs">{orders.length} pedidos no período</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-all text-slate-300">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Exportar
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 flex-1 min-w-48">
          <svg className="w-4 h-4 text-slate-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por cliente ou pedido..."
            className="bg-transparent text-sm text-slate-300 placeholder-slate-600 outline-none w-full"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {(['todos', 'pendente', 'confirmado', 'processando', 'enviado', 'entregue', 'cancelado'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                statusFilter === s ? 'bg-purple-600 text-white' : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              {s === 'todos' ? 'Todos' : statusColors[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-700/50 overflow-hidden" style={{ background: '#1e293b' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3">Pedido</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3">Cliente</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3">Cidade</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3">Data</th>
                <th className="text-center text-xs font-semibold text-slate-500 px-5 py-3">Pagamento</th>
                <th className="text-right text-xs font-semibold text-slate-500 px-5 py-3">Total</th>
                <th className="text-center text-xs font-semibold text-slate-500 px-5 py-3">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((o, i) => {
                const s = statusColors[o.status];
                return (
                  <tr key={o.id}
                    className={`transition-colors hover:bg-slate-700/30 ${i < filtered.length - 1 ? 'border-b border-slate-700/30' : ''}`}
                  >
                    <td className="px-5 py-3">
                      <span className="text-purple-400 text-sm font-bold">{o.id}</span>
                    </td>
                    <td className="px-5 py-3">
                      <div>
                        <p className="text-slate-200 text-sm font-medium">{o.customer}</p>
                        <p className="text-slate-500 text-[10px]">{o.email}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-400 text-xs">{o.city}, {o.state}</td>
                    <td className="px-5 py-3 text-slate-400 text-xs">{fmtDate(o.date)}</td>
                    <td className="px-5 py-3 text-center text-slate-400 text-xs">{o.payment}</td>
                    <td className="px-5 py-3 text-right text-white text-sm font-bold">{fmtCurrency(o.total)}</td>
                    <td className="px-5 py-3 text-center">
                      <StatusBadge label={s.label} color={`${s.bg} ${s.text}`} />
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => setSelected(o)}
                        className="text-xs text-purple-400 hover:text-purple-300 font-medium">
                        Detalhes
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-slate-500 text-sm">
                    Nenhum pedido encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={`Pedido ${selected?.id}`} maxWidth="max-w-md">
        {selected && (
          <div className="flex flex-col gap-5">
            {/* Customer info */}
            <div className="rounded-xl bg-slate-800 p-4">
              <p className="text-white font-bold text-sm">{selected.customer}</p>
              <p className="text-slate-400 text-xs mt-0.5">{selected.email}</p>
              <p className="text-slate-500 text-xs">{selected.city}, {selected.state}</p>
            </div>

            {/* Order info */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Total', value: fmtCurrency(selected.total) },
                { label: 'Itens', value: String(selected.items) },
                { label: 'Pagamento', value: selected.payment },
              ].map((info) => (
                <div key={info.label} className="rounded-xl bg-slate-800 p-3 text-center">
                  <p className="text-white text-sm font-bold">{info.value}</p>
                  <p className="text-slate-500 text-[10px] mt-0.5">{info.label}</p>
                </div>
              ))}
            </div>

            {/* Timeline */}
            <div>
              <p className="text-slate-400 text-xs font-semibold mb-3 uppercase tracking-wider">Linha do Tempo</p>
              <div className="flex flex-col gap-0">
                {selected.timeline.map((step, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        step.done ? 'bg-purple-600 border-purple-600' : 'bg-transparent border-slate-600'
                      }`}>
                        {step.done && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      {i < selected.timeline.length - 1 && (
                        <div className={`w-0.5 flex-1 my-0.5 min-h-4 ${step.done ? 'bg-purple-600/40' : 'bg-slate-700'}`} />
                      )}
                    </div>
                    <div className="pb-3">
                      <p className={`text-xs font-medium ${step.done ? 'text-slate-200' : 'text-slate-600'}`}>
                        {step.label}
                      </p>
                      <p className="text-slate-600 text-[10px]">{step.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status select */}
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Alterar status</label>
              <select defaultValue={selected.status}
                className="w-full bg-slate-800 border border-slate-600 text-slate-200 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-purple-500">
                {Object.entries(statusColors).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => setSelected(null)}
                className="px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-all">
                Fechar
              </button>
              <button onClick={() => setSelected(null)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #6b21a8, #7c3aed)' }}>
                Salvar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
