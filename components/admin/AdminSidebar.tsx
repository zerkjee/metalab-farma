'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import {
  LogOut,
  X,
  ChevronLeft,
  ChevronRight,
  Store,
  Wrench,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Ticket,
  Star,
  Image as ImageIcon,
  BarChart3,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';

type NavItem = { label: string; href: string; icon: React.ComponentType<{ className?: string }>; superAdminOnly?: boolean };

type NavSection = { section: string; items: NavItem[] };

const navSections: NavSection[] = [
  {
    section: 'Visão geral',
    items: [
      { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
      { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    ],
  },
  {
    section: 'Vendas',
    items: [
      { label: 'Pedidos', href: '/admin/pedidos', icon: ShoppingBag },
      { label: 'Cupons', href: '/admin/cupons', icon: Ticket },
      { label: 'Clientes', href: '/admin/clientes', icon: Users },
    ],
  },
  {
    section: 'Catálogo',
    items: [
      { label: 'Produtos', href: '/admin/produtos', icon: Package },
      { label: 'Banners', href: '/admin/banners', icon: ImageIcon },
      { label: 'Avaliações', href: '/admin/avaliacoes', icon: Star },
    ],
  },
  {
    section: 'Sistema',
    items: [
      { label: 'Admins', href: '/admin/criar-admin', icon: KeyRound, superAdminOnly: true },
      { label: 'Auditoria', href: '/admin/audit', icon: ShieldCheck, superAdminOnly: true },
    ],
  },
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
          className="fixed inset-0 bg-navy-900/60 z-40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col bg-navy-900 flex-shrink-0
          transition-transform duration-300 ease-in-out
          md:static md:translate-x-0 md:z-auto
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ width: collapsed ? '64px' : '232px', minHeight: '100vh' }}
      >
        {/* Logo + fechar */}
        <div className="flex items-center gap-2.5 px-4 h-16 border-b border-white/10 flex-shrink-0 overflow-hidden">
          <Image
            src="/brand/metalab-mark.png"
            alt="Metalab"
            width={28}
            height={28}
            className="flex-shrink-0 rounded-lg"
          />
          {!collapsed && (
            <>
              <div className="overflow-hidden flex-1">
                <p className="text-white font-display text-sm leading-none">Metalab</p>
                <p className="text-navy-300 text-[10px] font-semibold uppercase tracking-widest mt-0.5">Admin</p>
              </div>
              <button
                onClick={onClose}
                className="md:hidden p-1.5 rounded-lg text-navy-300 hover:text-white hover:bg-white/10 transition-all flex-shrink-0"
                aria-label="Fechar menu"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Perfil — mobile only */}
        {!collapsed && (
          <div className="md:hidden px-4 py-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center text-on-brand text-sm font-display flex-shrink-0">
                {userInitial}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white text-sm font-semibold leading-none truncate">{userName}</p>
                <p className="text-navy-300 text-[11px] mt-0.5 truncate">{userEmail}</p>
                <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-gold-500/20 text-gold-300">
                  {isSuperAdmin ? 'Super Admin' : 'Admin'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden">
          {navSections.map((sec) => {
            const items = sec.items.filter((item) => !item.superAdminOnly || isSuperAdmin);
            if (items.length === 0) return null;
            return (
              <div key={sec.section} className="mb-3">
                {!collapsed && (
                  <div className="px-4 mb-1 text-[10px] font-semibold uppercase tracking-widest text-navy-400">
                    {sec.section}
                  </div>
                )}
                {items.map((item) => {
                  const active =
                    item.href === '/admin'
                      ? pathname === '/admin'
                      : pathname.startsWith(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      title={collapsed ? item.label : undefined}
                      className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-xl transition-all duration-200 mb-0.5 ${
                        active
                          ? 'bg-white/10 text-white'
                          : 'text-navy-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      {!collapsed && (
                        <span className="text-sm font-medium whitespace-nowrap overflow-hidden">{item.label}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-white/10 p-3 space-y-1">
          {!collapsed && (
            <>
              <Link
                href="/"
                onClick={onClose}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-navy-300 hover:text-white hover:bg-white/5 transition-all text-xs"
              >
                <Store className="w-3.5 h-3.5" />
                <span>Ver loja pública</span>
              </Link>
              {isSuperAdmin && (
                <Link
                  href="/dev"
                  onClick={onClose}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-navy-400 hover:text-white hover:bg-white/5 transition-all text-xs"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Painel Dev</span>
                </Link>
              )}
              {/* Sair — mobile only */}
              <button
                onClick={() => { onClose(); void signOut({ callbackUrl: '/admin/login' }); }}
                className="md:hidden w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-danger hover:bg-danger-subtle transition-all text-xs"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sair do painel</span>
              </button>
            </>
          )}

          {/* Collapse — desktop only */}
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="hidden md:flex w-full items-center justify-center p-2 rounded-xl text-navy-400 hover:text-white hover:bg-white/5 transition-all"
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
