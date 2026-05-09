'use client';

import { useState } from 'react';
import { adminCoupons, fmtDate, fmtCurrency, type AdminCoupon } from '@/data/admin';
import StatusBadge from '@/components/admin/StatusBadge';
import Modal from '@/components/admin/Modal';

function CouponTypeLabel({ type, value }: { type: AdminCoupon['type']; value: number }) {
  if (type === 'percent') return <>{value}% OFF</>;
  if (type === 'fixed') return <>R$ {value} OFF</>;
  return <>Frete Grátis</>;
}

export default function AdminCupons() {
  const [filter, setFilter] = useState<'todos' | 'active' | 'inactive'>('todos');
  const [newOpen, setNewOpen] = useState(false);
  const [editItem, setEditItem] = useState<typeof adminCoupons[0] | null>(null);

  const filtered = adminCoupons.filter((c) => {
    if (filter === 'active') return c.active;
    if (filter === 'inactive') return !c.active;
    return true;
  });

  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-white font-black text-lg">Cupons</h2>
          <p className="text-slate-500 text-xs">{adminCoupons.length} cupons cadastrados</p>
        </div>
        <button onClick={() => setNewOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #6b21a8, #7c3aed)' }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Novo Cupom
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(['todos', 'active', 'inactive'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              filter === f ? 'bg-purple-600 text-white' : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200'
            }`}>
            {f === 'todos' ? 'Todos' : f === 'active' ? 'Ativos' : 'Inativos'}
          </button>
        ))}
      </div>

      {/* Coupon cards */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((c) => (
          <div key={c.id} className={`rounded-2xl border p-5 flex flex-col gap-3 transition-all ${
            c.active ? 'border-slate-700/50' : 'border-slate-800/50 opacity-60'
          }`} style={{ background: '#1e293b' }}>

            {/* Top row */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-black text-lg text-white tracking-wider">{c.code}</span>
                  <StatusBadge
                    label={c.active ? 'Ativo' : 'Inativo'}
                    color={c.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-600/30 text-slate-500'}
                  />
                </div>
                <p className="text-slate-400 text-xs">{c.title}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-2xl font-black text-purple-400">
                  <CouponTypeLabel type={c.type} value={c.value} />
                </p>
              </div>
            </div>

            {/* Usage bar */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-500 text-[10px]">Usos</span>
                <span className="text-slate-400 text-[10px] font-semibold">{c.used}/{c.limit}</span>
              </div>
              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-purple-600"
                  style={{ width: `${Math.min((c.used / c.limit) * 100, 100)}%` }} />
              </div>
            </div>

            {/* Meta */}
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <span className="text-slate-500 text-[10px]">
                Público: <span className="text-slate-300 font-semibold capitalize">{c.audience}</span>
              </span>
              {c.minOrder > 0 && (
                <span className="text-slate-500 text-[10px]">
                  Mín: <span className="text-slate-300 font-semibold">{fmtCurrency(c.minOrder)}</span>
                </span>
              )}
              <span className="text-slate-500 text-[10px]">
                Válido até: <span className="text-slate-300 font-semibold">{fmtDate(c.validUntil)}</span>
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-700/40">
              <button onClick={() => setEditItem(c)}
                className="text-xs text-purple-400 hover:text-purple-300 font-medium px-2 py-1 rounded-lg hover:bg-purple-600/10 transition-all">
                Editar
              </button>
              <button className="text-xs text-red-400/70 hover:text-red-400 font-medium px-2 py-1 rounded-lg hover:bg-red-600/10 transition-all">
                {c.active ? 'Desativar' : 'Ativar'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* New coupon modal */}
      <Modal open={newOpen} onClose={() => setNewOpen(false)} title="Novo Cupom">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-slate-400 text-xs mb-1 block">Código</label>
              <input placeholder="Ex: PROMO20" className="w-full bg-slate-800 border border-slate-600 text-slate-200 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-purple-500 uppercase" />
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Tipo</label>
              <select className="w-full bg-slate-800 border border-slate-600 text-slate-200 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-purple-500">
                <option value="percent">Porcentagem</option>
                <option value="fixed">Valor fixo</option>
                <option value="shipping">Frete grátis</option>
              </select>
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Valor</label>
              <input type="number" placeholder="10" className="w-full bg-slate-800 border border-slate-600 text-slate-200 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-purple-500" />
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Limite de usos</label>
              <input type="number" placeholder="100" className="w-full bg-slate-800 border border-slate-600 text-slate-200 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-purple-500" />
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Validade</label>
              <input type="date" className="w-full bg-slate-800 border border-slate-600 text-slate-200 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-purple-500" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setNewOpen(false)}
              className="px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-all">
              Cancelar
            </button>
            <button onClick={() => setNewOpen(false)}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #6b21a8, #7c3aed)' }}>
              Criar Cupom
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit modal */}
      <Modal open={!!editItem} onClose={() => setEditItem(null)} title={`Editar — ${editItem?.code}`}>
        {editItem && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Código</label>
                <input defaultValue={editItem.code}
                  className="w-full bg-slate-800 border border-slate-600 text-slate-200 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-purple-500" />
              </div>
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Valor</label>
                <input defaultValue={editItem.value} type="number"
                  className="w-full bg-slate-800 border border-slate-600 text-slate-200 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-purple-500" />
              </div>
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Limite</label>
                <input defaultValue={editItem.limit} type="number"
                  className="w-full bg-slate-800 border border-slate-600 text-slate-200 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-purple-500" />
              </div>
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Validade</label>
                <input defaultValue={editItem.validUntil} type="date"
                  className="w-full bg-slate-800 border border-slate-600 text-slate-200 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-purple-500" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setEditItem(null)}
                className="px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-all">
                Cancelar
              </button>
              <button onClick={() => setEditItem(null)}
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
