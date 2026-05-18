'use client';

import { useEffect, useState } from 'react';
import { fmtCurrency, fmtDate } from '@/data/admin';
import StatusBadge from '@/components/admin/StatusBadge';
import Modal from '@/components/admin/Modal';

interface ApiCliente {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  cpf: string | null;
  ativo: boolean;
  criadoEm: string;
  _count: { pedidos: number };
}

interface ApiResponse {
  clientes: ApiCliente[];
  total: number;
  pagina: number;
  totalPaginas: number;
}

export default function AdminClientes() {
  const [clientes, setClientes] = useState<ApiCliente[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [pagina, setPagina] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ApiCliente | null>(null);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams({ pagina: String(pagina), por_pagina: '20' });
    if (search) params.set('busca', search);
    fetch(`/api/admin/clientes?${params}`)
      .then((r) => r.json())
      .then((data: ApiResponse) => {
        if (cancelled || !data.clientes) return;
        setClientes(data.clientes);
        setTotal(data.total ?? 0);
        setTotalPaginas(data.totalPaginas ?? 1);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [pagina, search]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPagina(1);
    setSearch(searchInput);
  }

  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-white font-black text-lg">Clientes</h2>
          <p className="text-slate-500 text-xs">{total} clientes cadastrados</p>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 flex-1 min-w-48">
          <svg className="w-4 h-4 text-slate-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar por nome ou email..."
            className="bg-transparent text-sm text-slate-300 placeholder-slate-600 outline-none w-full"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition-colors"
        >
          Buscar
        </button>
        {search && (
          <button
            type="button"
            onClick={() => { setSearchInput(''); setSearch(''); setPagina(1); }}
            className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-semibold transition-colors"
          >
            Limpar
          </button>
        )}
      </form>

      {/* Table */}
      <div className="rounded-2xl border border-slate-700/50 overflow-hidden" style={{ background: '#1e293b' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3">Cliente</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3">Telefone</th>
                <th className="text-center text-xs font-semibold text-slate-500 px-5 py-3">Status</th>
                <th className="text-right text-xs font-semibold text-slate-500 px-5 py-3">Pedidos</th>
                <th className="text-right text-xs font-semibold text-slate-500 px-5 py-3">Cliente desde</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-5 py-3">
                      <div className="h-8 rounded-lg bg-slate-700/40 animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : clientes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-500 text-sm">
                    {search ? 'Nenhum cliente encontrado para esta busca.' : 'Nenhum cliente cadastrado ainda.'}
                  </td>
                </tr>
              ) : (
                clientes.map((c, i) => (
                  <tr
                    key={c.id}
                    className={`transition-colors hover:bg-slate-700/30 ${i < clientes.length - 1 ? 'border-b border-slate-700/30' : ''}`}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-purple-600/20 flex items-center justify-center text-purple-300 text-xs font-black flex-shrink-0">
                          {c.nome.split(' ').map((w: string) => w[0]).slice(0, 2).join('')}
                        </div>
                        <div>
                          <p className="text-slate-200 text-sm font-semibold">{c.nome}</p>
                          <p className="text-slate-500 text-[10px]">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-400 text-xs">{c.telefone ?? '—'}</td>
                    <td className="px-5 py-3 text-center">
                      <StatusBadge
                        label={c.ativo ? 'Ativo' : 'Inativo'}
                        color={c.ativo ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}
                      />
                    </td>
                    <td className="px-5 py-3 text-right text-slate-300 text-sm">{c._count.pedidos}</td>
                    <td className="px-5 py-3 text-right text-slate-400 text-xs">{fmtDate(c.criadoEm)}</td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => setSelected(c)}
                        className="text-xs text-purple-400 hover:text-purple-300 font-medium"
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPagina((p) => Math.max(1, p - 1))}
            disabled={pagina === 1}
            className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 text-xs font-semibold disabled:opacity-40 hover:text-slate-200 transition-colors"
          >
            Anterior
          </button>
          <span className="text-slate-500 text-xs">{pagina} / {totalPaginas}</span>
          <button
            onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
            disabled={pagina === totalPaginas}
            className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 text-xs font-semibold disabled:opacity-40 hover:text-slate-200 transition-colors"
          >
            Próxima
          </button>
        </div>
      )}

      {/* Customer detail modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.nome ?? ''}>
        {selected && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-600/20 flex items-center justify-center text-purple-300 text-lg font-black">
                {selected.nome.split(' ').map((w: string) => w[0]).slice(0, 2).join('')}
              </div>
              <div>
                <StatusBadge
                  label={selected.ativo ? 'Ativo' : 'Inativo'}
                  color={selected.ativo ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}
                />
                <p className="text-slate-400 text-xs mt-1">{selected.email}</p>
                {selected.telefone && <p className="text-slate-500 text-xs">{selected.telefone}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Pedidos',       value: String(selected._count.pedidos) },
                { label: 'CPF',           value: selected.cpf ?? '—' },
                { label: 'Status',        value: selected.ativo ? 'Ativo' : 'Inativo' },
                { label: 'Cliente desde', value: fmtDate(selected.criadoEm) },
              ].map((info) => (
                <div key={info.label} className="rounded-xl bg-slate-800 p-3">
                  <p className="text-white text-sm font-bold">{info.value}</p>
                  <p className="text-slate-500 text-[10px] mt-0.5">{info.label}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelected(null)}
                className="px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-all"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
