'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { LogOut, X, ChevronLeft, ChevronRight, Store, Wrench } from 'lucide-react';

type NavItem = { label: string; href: string; icon: string; superAdminOnly?: boolean };

const nav: NavItem[] = [
  { label: 'Dashboard',   href: '/admin',             icon: '📊' },
  { label: 'Produtos',    href: '/admin/produtos',     icon: '📦' },
  { label: 'Pedidos',     href: '/admin/pedidos',      icon: '🛍️' },
  { label: 'Clientes',    href: '/admin/clientes',     icon: '👥' },
  { label: 'Cupons',      href: '/admin/cupons',       icon: '🎫' },
  { label: 'Avaliações',  href: '/admin/avaliacoes',   icon: '⭐' },
  { label: 'Banners',     href: '/admin/banners',      icon: '🖼️' },
  { label: 'Analytics',   href: '/admin/analytics',    icon: '📈' },
  { label: 'Admins',      href: '/admin/criar-admin',  icon: '🔑', superAdminOnly: true },
  { label: 'Auditoria',   href: '/admin/audit',        icon: '🔒', superAdminOnly: true },
];

interface Props {
  mobileOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ mobileOpen, onClose }: Props) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { data: session } = useSession();
  const isSuperAdmin = session?.user?.role === 'SUPER_ADMIN';
  const userName = session?.user?.name ?? 'Admin';
  const userEmail = session?.user?.email ?? '';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <>
      {/* Backdrop — mobile only */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-800 flex-shrink-0
          transition-transform duration-300 ease-in-out
          md:static md:translate-x-0 md:z-auto
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{
          width: collapsed ? '64px' : '220px',
          background: '#0f172a',
          minHeight: '100vh',
        }}
      >
        {/* Logo + fechar */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-slate-800 flex-shrink-0 overflow-hidden">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #6b21a8, #7c3aed)' }}
          >
            <span className="text-white text-sm font-black">M</span>
          </div>
          {!collapsed && (
            <>
              <div className="overflow-hidden flex-1">
                <p className="text-white font-black text-sm leading-none">METALAB</p>
                <p className="text-purple-400 text-[10px] font-semibold uppercase tracking-widest">Admin</p>
              </div>
              <button
                onClick={onClose}
                className="md:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all flex-shrink-0"
                aria-label="Fechar menu"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Perfil — mobile only */}
        {!collapsed && (
          <div className="md:hidden px-4 py-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #6b21a8, #7c3aed)' }}
              >
                {userInitial}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white text-sm font-bold leading-none truncate">{userName}</p>
                <p className="text-slate-500 text-[11px] mt-0.5 truncate">{userEmail}</p>
                <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-600/20 text-purple-300">
                  {isSuperAdmin ? 'Super Admin' : 'Admin'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden">
          {nav.filter((item) => !item.superAdminOnly || isSuperAdmin).map((item) => {
            const active =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-xl transition-all duration-200 mb-0.5 group relative ${
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
        <div className="border-t border-slate-800 p-3 space-y-1">
          {!collapsed && (
            <>
              <Link
                href="/"
                onClick={onClose}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all text-xs"
              >
                <Store className="w-3.5 h-3.5" />
                <span>Ver loja pública</span>
              </Link>
              {isSuperAdmin && (
                <Link
                  href="/dev"
                  onClick={onClose}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-slate-600 hover:text-slate-300 hover:bg-slate-800 transition-all text-xs"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Painel Dev</span>
                </Link>
              )}
              {/* Sair — mobile only */}
              <button
                onClick={() => { onClose(); void signOut({ callbackUrl: '/admin/login' }); }}
                className="md:hidden w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all text-xs"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sair do painel</span>
              </button>
            </>
          )}

          {/* Collapse — desktop only */}
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="hidden md:flex w-full items-center justify-center p-2 rounded-xl text-slate-600 hover:text-slate-300 hover:bg-slate-800 transition-all"
            title={collapsed ? 'Expandir' : 'Recolher'}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
