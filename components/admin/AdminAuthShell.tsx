'use client';

import { ShieldCheck } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminTopbar from '@/components/admin/AdminTopbar';

export default function AdminAuthShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isLogin = pathname === '/admin/login';

  // Fecha o menu ao navegar — padrão correto para reset de estado em navegação
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Bloqueia scroll do body enquanto drawer estiver aberto
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  // Fallback client-side guard (middleware handles server-side redirect)
  useEffect(() => {
    if (isLogin || status === 'loading') return;
    if (status === 'unauthenticated') {
      router.replace('/admin/login');
      return;
    }
    const role = session?.user?.role;
    if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
      router.replace('/');
    }
  }, [isLogin, router, session, status]);

  if (isLogin) {
    return <>{children}</>;
  }

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-surface-page">
        <div className="w-full max-w-md rounded-3xl border border-line bg-surface-card p-8 text-center shadow-md">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-navy text-on-navy shadow-sm">
            <ShieldCheck className="h-7 w-7" strokeWidth={1.8} />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-600">Acesso protegido</p>
          <h1 className="mt-3 text-2xl font-display text-navy">Verificando sessão administrativa</h1>
          <p className="mt-3 text-sm leading-6 text-ink-muted">
            Autenticando sua sessão no painel Metalab.
          </p>
          <div className="mt-7 h-1.5 overflow-hidden rounded-full bg-surface-sunken">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-brand" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-surface-page" style={{ minHeight: '100vh' }}>
      <AdminSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex flex-col flex-1 min-w-0">
        <AdminTopbar onMenuToggle={() => setMobileOpen((v) => !v)} />
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
