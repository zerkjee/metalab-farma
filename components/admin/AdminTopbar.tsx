'use client';

import { usePathname } from 'next/navigation';
import { useState } from 'react';

const titles: Record<string, string> = {
  '/admin':            'Dashboard',
  '/admin/produtos':   'Gestão de Produtos',
  '/admin/pedidos':    'Gestão de Pedidos',
  '/admin/clientes':   'Gestão de Clientes',
  '/admin/cupons':     'Gestão de Cupons',
  '/admin/banners':    'Gestão de Banners',
  '/admin/analytics':  'Analytics',
};

export default function AdminTopbar() {
  const pathname = usePathname();
  const [notifOpen, setNotifOpen] = useState(false);
  const title = titles[pathname] ?? 'Admin';

  return (
    <header className="h-16 border-b border-slate-800 flex items-center px-6 gap-4 flex-shrink-0"
      style={{ background: '#0f172a' }}>

      {/* Title */}
      <h1 className="text-white font-bold text-lg flex-1">{title}</h1>

      {/* Search */}
      <div className="hidden sm:flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 w-56">
        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          placeholder="Buscar..."
          className="bg-transparent text-sm text-slate-300 placeholder-slate-600 outline-none w-full"
        />
      </div>

      {/* Notificações */}
      <div className="relative">
        <button
          onClick={() => setNotifOpen(v => !v)}
          className="relative w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-purple-500 rounded-full" />
        </button>

        {notifOpen && (
          <div className="absolute right-0 top-12 w-72 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-800">
              <p className="text-white font-bold text-sm">Notificações</p>
            </div>
            {[
              { icon: '🛍️', text: 'Novo pedido #1092 — Larissa Teixeira', time: '5 min' },
              { icon: '📦', text: 'Estoque baixo — Biotina (8 un.)',       time: '1h' },
              { icon: '👥', text: 'Novo cliente cadastrado',               time: '2h' },
            ].map((n, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-800 transition-colors border-b border-slate-800/50">
                <span className="text-base mt-0.5">{n.icon}</span>
                <div className="flex-1">
                  <p className="text-slate-200 text-xs leading-snug">{n.text}</p>
                  <p className="text-slate-500 text-[10px] mt-0.5">há {n.time}</p>
                </div>
              </div>
            ))}
            <div className="px-4 py-3 text-center">
              <button className="text-purple-400 text-xs font-medium hover:text-purple-300">Ver todas</button>
            </div>
          </div>
        )}
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold"
          style={{ background: 'linear-gradient(135deg, #6b21a8, #7c3aed)' }}>
          A
        </div>
        <div className="hidden sm:block">
          <p className="text-white text-xs font-bold leading-none">Admin</p>
          <p className="text-slate-500 text-[10px]">Metalab Store</p>
        </div>
      </div>
    </header>
  );
}
