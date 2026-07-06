'use client';

import { LogOut, Menu, Search, Bell } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { signOut, useSession } from 'next-auth/react';

const titles: Record<string, string> = {
  '/admin':             'Dashboard',
  '/admin/produtos':    'Produtos',
  '/admin/pedidos':     'Pedidos',
  '/admin/clientes':    'Clientes',
  '/admin/cupons':      'Cupons',
  '/admin/avaliacoes':  'Avaliações',
  '/admin/banners':     'Banners',
  '/admin/analytics':   'Analytics',
  '/admin/audit':       'Auditoria',
  '/admin/criar-admin': 'Admins',
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

interface Props {
  onMenuToggle: () => void;
}

export default function AdminTopbar({ onMenuToggle }: Props) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notif[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const title =
    Object.entries(titles).find(
      ([k]) => pathname.startsWith(k) && (k === '/admin' ? pathname === '/admin' : true)
    )?.[1] ?? 'Admin';

  const userName = session?.user?.name ?? 'Admin';
  const userInitial = userName.charAt(0).toUpperCase();

  function handleLogout() {
    signOut({ callbackUrl: '/admin/login' });
  }

  function fetchNotifications() {
    fetch('/api/admin/notifications')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d?.notifications) setNotifications(d.notifications); })
      .catch(() => {});
  }

  useEffect(() => {
    fetchNotifications();
    intervalRef.current = setInterval(fetchNotifications, 30_000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  // Fechar notificações ao clicar fora
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    if (notifOpen) document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [notifOpen]);

  return (
    <header className="h-16 bg-surface-card border-b border-line flex items-center px-4 gap-3 flex-shrink-0">
      {/* Hambúrguer — mobile */}
      <button
        onClick={onMenuToggle}
        className="md:hidden flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full bg-surface-sunken border border-line text-ink-muted hover:text-navy hover:bg-brand-50 transition-all active:scale-95"
        aria-label="Abrir menu"
      >
        <Menu className="w-4 h-4" />
      </button>

      {/* Título da página */}
      <h1 className="text-navy font-display text-base flex-1 truncate">{title}</h1>

      {/* Busca — desktop */}
      <div className="hidden md:flex items-center gap-2 bg-surface-sunken border border-line rounded-full px-3 py-2 w-52">
        <Search className="w-4 h-4 text-ink-muted flex-shrink-0" strokeWidth={2} />
        <input
          placeholder="Buscar..."
          className="bg-transparent text-sm text-ink placeholder-ink-muted outline-none w-full font-sans"
        />
      </div>

      {/* Notificações */}
      <div className="relative flex-shrink-0" ref={notifRef}>
        <button
          onClick={() => setNotifOpen((v) => !v)}
          className="relative w-9 h-9 rounded-full bg-surface-sunken border border-line flex items-center justify-center text-ink-muted hover:text-navy hover:bg-brand-50 transition-all active:scale-95"
          aria-label="Notificações"
        >
          <Bell className="w-4 h-4" strokeWidth={2} />
          {notifications.length > 0 && (
            <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-brand rounded-full text-[9px] text-on-brand font-bold flex items-center justify-center px-0.5">
              {notifications.length > 9 ? '9+' : notifications.length}
            </span>
          )}
        </button>

        {notifOpen && (
          <div className="absolute right-0 top-12 w-80 max-w-[calc(100vw-2rem)] bg-surface-card border border-line rounded-2xl shadow-md z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-line flex items-center justify-between">
              <p className="text-navy font-display text-sm">Notificações</p>
              <span className="text-ink-muted text-xs">{notifications.length} recentes</span>
            </div>
            <div className="max-h-72 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-ink-muted text-xs text-center py-8">Nenhuma notificação recente</p>
              ) : (
                notifications.slice(0, 10).map((n) => (
                  <Link
                    key={n.id}
                    href={n.link}
                    onClick={() => setNotifOpen(false)}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-surface-sunken transition-colors border-b border-line block"
                  >
                    <span className="text-base mt-0.5 flex-shrink-0">{tipoIcon[n.tipo] ?? '📋'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-ink text-xs leading-snug">{n.texto}</p>
                      <p className="text-ink-muted text-[10px] mt-0.5">há {timeAgo(n.criadoEm)}</p>
                    </div>
                  </Link>
                ))
              )}
            </div>
            <div className="px-4 py-2.5 border-t border-line">
              <button
                onClick={fetchNotifications}
                className="text-link text-xs font-medium hover:underline w-full text-center"
              >
                Atualizar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Perfil — desktop */}
      <div className="hidden md:flex items-center gap-2.5 flex-shrink-0">
        <div className="w-9 h-9 rounded-full bg-brand flex items-center justify-center text-on-brand text-sm font-display">
          {userInitial}
        </div>
        <div>
          <p className="text-navy text-xs font-semibold leading-none">{userName}</p>
          <p className="text-ink-muted text-[10px]">Metalab Store</p>
        </div>
      </div>

      {/* Sair — desktop */}
      <button
        onClick={handleLogout}
        className="hidden md:flex h-9 items-center gap-2 rounded-full border border-line bg-surface-sunken px-3 text-xs font-semibold text-ink-muted transition-all hover:border-brand hover:bg-brand-50 hover:text-navy active:scale-95 flex-shrink-0"
        title="Sair do painel"
      >
        <LogOut className="h-3.5 w-3.5" strokeWidth={1.9} />
        Sair
      </button>
    </header>
  );
}
