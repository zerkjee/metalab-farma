'use client';

import { useState } from 'react';
import { adminBanners } from '@/data/admin';
import StatusBadge from '@/components/admin/StatusBadge';
import Modal from '@/components/admin/Modal';

export default function AdminBanners() {
  const [banners, setBanners] = useState(adminBanners);
  const [editItem, setEditItem] = useState<typeof adminBanners[0] | null>(null);

  const toggleActive = (id: number) => {
    setBanners((prev) => prev.map((b) => b.id === id ? { ...b, active: !b.active } : b));
  };

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    setBanners((prev) => {
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next.map((b, i) => ({ ...b, order: i + 1 }));
    });
  };

  const moveDown = (idx: number) => {
    if (idx === banners.length - 1) return;
    setBanners((prev) => {
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next.map((b, i) => ({ ...b, order: i + 1 }));
    });
  };

  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-white font-black text-lg">Banners</h2>
          <p className="text-slate-500 text-xs">{banners.filter(b => b.active).length} ativos de {banners.length}</p>
        </div>
        <div className="flex items-center gap-2">
          <a href="/" target="_blank"
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-300 bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-all">
            Pré-visualizar →
          </a>
        </div>
      </div>

      {/* Info bar */}
      <div className="rounded-2xl border border-purple-700/30 bg-purple-600/10 px-5 py-3 flex items-center gap-3">
        <svg className="w-4 h-4 text-purple-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-purple-300 text-xs">Use as setas para reordenar. Banners inativos não aparecem no carrossel público.</p>
      </div>

      {/* Banner list */}
      <div className="flex flex-col gap-3">
        {banners.map((banner, idx) => (
          <div key={banner.id}
            className={`rounded-2xl border p-5 flex items-center gap-4 transition-all ${
              banner.active ? 'border-slate-700/50' : 'border-slate-800/50 opacity-60'
            }`}
            style={{ background: '#1e293b' }}
          >
            {/* Preview swatch */}
            <div className="w-20 h-12 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-xs font-black"
              style={{ background: banner.bg }}>
              #{banner.order}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-white font-bold text-sm">{banner.title}</p>
                <StatusBadge
                  label={banner.active ? 'Ativo' : 'Inativo'}
                  color={banner.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-600/30 text-slate-500'}
                />
              </div>
              <p className="text-slate-500 text-xs">{banner.subtitle}</p>
            </div>

            {/* Order controls */}
            <div className="flex flex-col gap-1">
              <button onClick={() => moveUp(idx)}
                disabled={idx === 0}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <button onClick={() => moveDown(idx)}
                disabled={idx === banners.length - 1}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button onClick={() => setEditItem(banner)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-purple-400 hover:text-purple-300 hover:bg-purple-600/10 transition-all">
                Editar
              </button>
              <button onClick={() => toggleActive(banner.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  banner.active
                    ? 'text-red-400/70 hover:text-red-400 hover:bg-red-600/10'
                    : 'text-emerald-400/70 hover:text-emerald-400 hover:bg-emerald-600/10'
                }`}>
                {banner.active ? 'Desativar' : 'Ativar'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit modal */}
      <Modal open={!!editItem} onClose={() => setEditItem(null)} title={`Editar Banner — ${editItem?.title}`}>
        {editItem && (
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Título principal</label>
              <input defaultValue={editItem.title}
                className="w-full bg-slate-800 border border-slate-600 text-slate-200 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-purple-500" />
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Subtítulo / descrição</label>
              <input defaultValue={editItem.subtitle}
                className="w-full bg-slate-800 border border-slate-600 text-slate-200 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-purple-500" />
            </div>

            {/* Preview */}
            <div>
              <label className="text-slate-400 text-xs mb-2 block">Preview</label>
              <div className="w-full h-20 rounded-xl flex items-center justify-center text-white font-black text-sm"
                style={{ background: editItem.bg }}>
                {editItem.title}
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
