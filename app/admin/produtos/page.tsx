'use client';

import { useState } from 'react';
import { adminProducts, productStatusColors, fmtCurrency, type ProductStatus } from '@/data/admin';
import StatusBadge from '@/components/admin/StatusBadge';
import Modal from '@/components/admin/Modal';

const categories = ['Todos', ...Array.from(new Set(adminProducts.map((p) => p.category)))];

export default function AdminProdutos() {
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('Todos');
  const [status, setStatus] = useState<ProductStatus | 'todos'>('todos');
  const [selected, setSelected] = useState<typeof adminProducts[0] | null>(null);

  const filtered = adminProducts.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = cat === 'Todos' || p.category === cat;
    const matchStatus = status === 'todos' || p.status === status;
    return matchSearch && matchCat && matchStatus;
  });

  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-white font-black text-lg">Produtos</h2>
          <p className="text-slate-500 text-xs">{adminProducts.length} produtos cadastrados</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #6b21a8, #7c3aed)' }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Novo Produto
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
            placeholder="Buscar produto..."
            className="bg-transparent text-sm text-slate-300 placeholder-slate-600 outline-none w-full"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                cat === c ? 'bg-purple-600 text-white' : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as ProductStatus | 'todos')}
          className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-xl px-3 py-2 outline-none"
        >
          <option value="todos">Todos status</option>
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
          <option value="sem_estoque">Sem estoque</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-700/50 overflow-hidden" style={{ background: '#1e293b' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3">Produto</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3">Categoria</th>
                <th className="text-right text-xs font-semibold text-slate-500 px-5 py-3">Preço</th>
                <th className="text-right text-xs font-semibold text-slate-500 px-5 py-3">Estoque</th>
                <th className="text-right text-xs font-semibold text-slate-500 px-5 py-3">Vendas</th>
                <th className="text-center text-xs font-semibold text-slate-500 px-5 py-3">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => {
                const s = productStatusColors[p.status];
                return (
                  <tr
                    key={p.id}
                    className={`transition-colors hover:bg-slate-700/30 ${i < filtered.length - 1 ? 'border-b border-slate-700/30' : ''}`}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: p.color + '33' }}>
                          <div className="w-4 h-4 rounded-sm" style={{ background: p.color }} />
                        </div>
                        <span className="text-slate-200 text-sm font-medium">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-400 text-xs">{p.category}</td>
                    <td className="px-5 py-3 text-right text-white text-sm font-bold">{fmtCurrency(p.price)}</td>
                    <td className="px-5 py-3 text-right">
                      <span className={`text-sm font-bold ${p.stock === 0 ? 'text-red-400' : p.stock <= 8 ? 'text-yellow-400' : 'text-slate-300'}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right text-slate-400 text-sm">{p.sold}</td>
                    <td className="px-5 py-3 text-center">
                      <StatusBadge label={s.label} color={`${s.bg} ${s.text}`} />
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => setSelected(p)}
                        className="text-xs text-purple-400 hover:text-purple-300 font-medium"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-500 text-sm">
                    Nenhum produto encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={`Editar — ${selected?.name}`}>
        {selected && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Nome</label>
                <input defaultValue={selected.name}
                  className="w-full bg-slate-800 border border-slate-600 text-slate-200 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-purple-500" />
              </div>
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Categoria</label>
                <input defaultValue={selected.category}
                  className="w-full bg-slate-800 border border-slate-600 text-slate-200 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-purple-500" />
              </div>
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Preço (R$)</label>
                <input defaultValue={selected.price}
                  className="w-full bg-slate-800 border border-slate-600 text-slate-200 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-purple-500" />
              </div>
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Estoque</label>
                <input defaultValue={selected.stock} type="number"
                  className="w-full bg-slate-800 border border-slate-600 text-slate-200 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-purple-500" />
              </div>
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Status</label>
              <select defaultValue={selected.status}
                className="w-full bg-slate-800 border border-slate-600 text-slate-200 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-purple-500">
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
                <option value="sem_estoque">Sem estoque</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setSelected(null)}
                className="px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-all">
                Cancelar
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
