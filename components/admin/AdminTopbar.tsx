'use client';

import { LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { signOut, useSession } from 'next-auth/react';

const titles: Record<string, string> = {
  '/admin':              'Dashboard',
  '/admin/produtos':     'Gestão de Produtos',
  '/admin/pedidos':      'Gestão de Pedidos',
  '/admin/clientes':     'Gestão de Clientes',
  '/admin/cupons':       'Gestão de Cupons',
  '/admin/banners':      'Gestão de Banners',
  '/admin/analytics':    'Analytics',
  '/admin/audit':        'Auditoria',
  '/admin/criar-admin':  'Admins',
};

const tipoIcon: Record<string, string> = {
  pedido:    '🛍️',
  pagamento: '✅',
  estoque:   '📦',
};

interface Notif {
  id: string;
  tipo: string;
  texto: string;
  link: string;
  criadoEm: string;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'agora';
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export default function AdminTopbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notif[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const title = Object.entries(titles).find(([k]) => pathname.startsWith(k) && (k === '/admin' ? pathname === '/admin' : true))?.[1] ?? 'Admin';

  const userName = session?.user?.name ?? 'Admin';
  const userInitial = userName.charAt(0).toUpperCase();

  function handleLogout() {
    signOut({ callbackUrl: '/admin/login' });
  }

  function fetchNotifications() {
    fetch('/api/admin/notifications')
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d?.notifications) setNotifications(d.notifications); })
      .catch(() => {});
  }

  useEffect(() => {
    fetchNotifications();
    intervalRef.current = setInterval(fetchNotifications, 30_000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  return (
    <header className="h-16 border-b border-slate-800 flex items-center px-6 gap-4 flex-shrink-0"
      style={{ background: '#0f172a' }}>

      <h1 className="text-white font-bold text-lg flex-1">{title}</h1>

      <div className="hidden sm:flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 w-56">
        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          placeholder="Buscar..."
          className="bg-transparent text-sm text-slate-300 placeholder-slate-600 outline-none w-full"
        />
      </div>

      <div className="relative">
        <button
          onClick={() => setNotifOpen(v => !v)}
          className="relative w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {notifications.length > 0 && (
            <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-purple-500 rounded-full text-[9px] text-white font-black flex items-center justify-center px-0.5">
              {notifications.length > 9 ? '9+' : notifications.length}
            </span>
          )}
        </button>

        {notifOpen && (
          <div className="absolute right-0 top-12 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <p className="text-white font-bold text-sm">Notificações</p>
              <span className="text-slate-500 text-xs">{notifications.length} recentes</span>
            </div>
            <div className="max-h-72 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-slate-500 text-xs text-center py-8">Nenhuma notificação recente</p>
              ) : (
                notifications.slice(0, 10).map((n) => (
                  <Link
                    key={n.id}
                    href={n.link}
                    onClick={() => setNotifOpen(false)}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-slate-800 transition-colors border-b border-slate-800/50 block"
                  >
                    <span className="text-base mt-0.5 flex-shrink-0">{tipoIcon[n.tipo] ?? '📋'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-200 text-xs leading-snug">{n.texto}</p>
                      <p className="text-slate-500 text-[10px] mt-0.5">há {timeAgo(n.criadoEm)}</p>
                    </div>
                  </Link>
                ))
              )}
            </div>
            <div className="px-4 py-2.5 border-t border-slate-800">
              <button
                onClick={fetchNotifications}
                className="text-purple-400 text-xs font-medium hover:text-purple-300 w-full text-center"
              >
                Atualizar
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold"
          style={{ background: 'linear-gradient(135deg, #6b21a8, #7c3aed)' }}>
          {userInitial}
        </div>
        <div className="hidden sm:block">
          <p className="text-white text-xs font-bold leading-none">{userName}</p>
          <p className="text-slate-500 text-[10px]">Metalab Store</p>
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="hidden sm:flex h-9 items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3 text-xs font-semibold text-slate-400 transition-all hover:border-purple-500/40 hover:bg-slate-700 hover:text-slate-100 active:scale-95"
        title="Sair do painel"
      >
        <LogOut className="h-3.5 w-3.5" strokeWidth={1.9} />
        Sair
      </button>

      <button
        onClick={handleLogout}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-slate-400 transition-all hover:border-purple-500/40 hover:bg-slate-700 hover:text-slate-100 active:scale-95 sm:hidden"
        title="Sair do painel"
        aria-label="Sair do painel"
      >
        <LogOut className="h-4 w-4" strokeWidth={1.9} />
      </button>
    </header>
  );
}
