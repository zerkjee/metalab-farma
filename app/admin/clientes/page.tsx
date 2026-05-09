'use client';

import { useState } from 'react';
import { adminCustomers, fmtCurrency, fmtDate, type CustomerLevel } from '@/data/admin';
import StatusBadge from '@/components/admin/StatusBadge';
import Modal from '@/components/admin/Modal';

const levelColors: Record<CustomerLevel, string> = {
  silver: 'bg-slate-500/20 text-slate-300',
  gold:   'bg-yellow-500/20 text-yellow-400',
  black:  'bg-purple-500/20 text-purple-300',
};
const levelEmoji: Record<CustomerLevel, string> = { silver: '🥈', gold: '🥇', black: '⚫' };

export default function AdminClientes() {
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState<CustomerLevel | 'todos'>('todos');
  const [selected, setSelected] = useState<typeof adminCustomers[0] | null>(null);

  const filtered = adminCustomers.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase());
    const matchLevel = level === 'todos' || c.level === level;
    return matchSearch && matchLevel;
  });

  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-white font-black text-lg">Clientes</h2>
          <p className="text-slate-500 text-xs">{adminCustomers.length} clientes cadastrados</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {(['silver', 'gold', 'black'] as CustomerLevel[]).map((lvl) => {
          const count = adminCustomers.filter((c) => c.level === lvl).length;
          const revenue = adminCustomers.filter((c) => c.level === lvl).reduce((s, c) => s + c.totalSpent, 0);
          return (
            <div key={lvl} className="rounded-2xl border border-slate-700/50 p-4" style={{ background: '#1e293b' }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{levelEmoji[lvl]}</span>
                <p className="text-slate-400 text-xs font-semibold capitalize">{lvl}</p>
              </div>
              <p className="text-white text-xl font-black">{count}</p>
              <p className="text-slate-500 text-xs">{fmtCurrency(revenue)} total</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 flex-1 min-w-48">
          <svg className="w-4 h-4 text-slate-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar cliente..."
            className="bg-transparent text-sm text-slate-300 placeholder-slate-600 outline-none w-full" />
        </div>
        <div className="flex gap-2">
          {(['todos', 'silver', 'gold', 'black'] as const).map((l) => (
            <button key={l} onClick={() => setLevel(l)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                level === l ? 'bg-purple-600 text-white' : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200'
              }`}>
              {l === 'todos' ? 'Todos' : `${levelEmoji[l]} ${l}`}
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
                <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3">Cliente</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3">Cidade</th>
                <th className="text-center text-xs font-semibold text-slate-500 px-5 py-3">Nível</th>
                <th className="text-right text-xs font-semibold text-slate-500 px-5 py-3">Pedidos</th>
                <th className="text-right text-xs font-semibold text-slate-500 px-5 py-3">Total gasto</th>
                <th className="text-right text-xs font-semibold text-slate-500 px-5 py-3">Cashback</th>
                <th className="text-right text-xs font-semibold text-slate-500 px-5 py-3">Último pedido</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr key={c.id}
                  className={`transition-colors hover:bg-slate-700/30 ${i < filtered.length - 1 ? 'border-b border-slate-700/30' : ''}`}
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-purple-600/20 flex items-center justify-center text-purple-300 text-xs font-black flex-shrink-0">
                        {c.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                      </div>
                      <div>
                        <p className="text-slate-200 text-sm font-semibold">{c.name}</p>
                        <p className="text-slate-500 text-[10px]">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-400 text-xs">{c.city}, {c.state}</td>
                  <td className="px-5 py-3 text-center">
                    <StatusBadge label={`${levelEmoji[c.level]} ${c.level}`} color={levelColors[c.level]} />
                  </td>
                  <td className="px-5 py-3 text-right text-slate-300 text-sm">{c.orders}</td>
                  <td className="px-5 py-3 text-right text-white text-sm font-bold">{fmtCurrency(c.totalSpent)}</td>
                  <td className="px-5 py-3 text-right text-emerald-400 text-sm font-semibold">{fmtCurrency(c.cashback)}</td>
                  <td className="px-5 py-3 text-right text-slate-400 text-xs">{fmtDate(c.lastOrder)}</td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => setSelected(c)}
                      className="text-xs text-purple-400 hover:text-purple-300 font-medium">
                      Ver
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-slate-500 text-sm">
                    Nenhum cliente encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer detail modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.name ?? ''}>
        {selected && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-600/20 flex items-center justify-center text-purple-300 text-lg font-black">
                {selected.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
              </div>
              <div>
                <StatusBadge label={`${levelEmoji[selected.level]} ${selected.level}`} color={levelColors[selected.level]} />
                <p className="text-slate-400 text-xs mt-1">{selected.email}</p>
                <p className="text-slate-500 text-xs">{selected.city}, {selected.state}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Pedidos',      value: String(selected.orders) },
                { label: 'Total gasto',  value: fmtCurrency(selected.totalSpent) },
                { label: 'Cashback',     value: fmtCurrency(selected.cashback) },
                { label: 'Cliente desde', value: fmtDate(selected.joined) },
              ].map((info) => (
                <div key={info.label} className="rounded-xl bg-slate-800 p-3">
                  <p className="text-white text-sm font-bold">{info.value}</p>
                  <p className="text-slate-500 text-[10px] mt-0.5">{info.label}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button onClick={() => setSelected(null)}
                className="px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-all">
                Fechar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
