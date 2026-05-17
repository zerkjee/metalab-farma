'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { useSession } from 'next-auth/react';

type NavItem = { label: string; href: string; icon: string; superAdminOnly?: boolean };

const nav: NavItem[] = [
  { label: 'Dashboard',    href: '/admin',               icon: '📊' },
  { label: 'Produtos',     href: '/admin/produtos',       icon: '📦' },
  { label: 'Pedidos',      href: '/admin/pedidos',        icon: '🛍️' },
  { label: 'Clientes',     href: '/admin/clientes',       icon: '👥' },
  { label: 'Cupons',       href: '/admin/cupons',         icon: '🎫' },
  { label: 'Avaliações',  href: '/admin/avaliacoes',     icon: '⭐' },
  { label: 'Banners',      href: '/admin/banners',        icon: '🖼️' },
  { label: 'Analytics',    href: '/admin/analytics',      icon: '📈' },
  { label: 'Admins',       href: '/admin/criar-admin',    icon: '🔑', superAdminOnly: true },
  { label: 'Auditoria',   href: '/admin/audit',          icon: '🔒', superAdminOnly: true },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { data: session } = useSession();
  const isSuperAdmin = session?.user?.role === 'SUPER_ADMIN';

  return (
    <aside
      className="flex flex-col border-r border-slate-800 flex-shrink-0 transition-all duration-300 relative"
      style={{
        width: collapsed ? '64px' : '220px',
        background: '#0f172a',
        minHeight: '100vh',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-slate-800 flex-shrink-0 overflow-hidden">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #6b21a8, #7c3aed)' }}>
          <span className="text-white text-sm font-black">M</span>
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-white font-black text-sm leading-none">METALAB</p>
            <p className="text-purple-400 text-[10px] font-semibold uppercase tracking-widest">Admin</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-hidden">
        {nav.filter((item) => !item.superAdminOnly || isSuperAdmin).map((item) => {
          const active = item.href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-xl transition-all duration-200 mb-0.5 group relative ${
                active
                  ? 'bg-purple-600/20 text-purple-300'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-purple-500 rounded-r-full" />
              )}
              <span className="text-base flex-shrink-0">{item.icon}</span>
              {!collapsed && (
                <span className="text-sm font-medium whitespace-nowrap overflow-hidden">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-800 p-3">
        {!collapsed && (
          <>
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all text-xs mb-1"
            >
              <span>🏪</span>
              <span>Ver loja pública</span>
            </Link>
            {isSuperAdmin && (
              <Link
                href="/dev"
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-600 hover:text-slate-300 hover:bg-slate-800 transition-all text-xs mb-2"
              >
                <span>🔧</span>
                <span>Painel Dev</span>
              </Link>
            )}
          </>
        )}
        <button
          onClick={() => setCollapsed(v => !v)}
          className="w-full flex items-center justify-center p-2 rounded-xl text-slate-600 hover:text-slate-300 hover:bg-slate-800 transition-all"
          title={collapsed ? 'Expandir' : 'Recolher'}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d={collapsed ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'} />
          </svg>
        </button>
      </div>
    </aside>
  );
}
