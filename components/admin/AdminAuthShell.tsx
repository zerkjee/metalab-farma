'use client';

import { ShieldCheck } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminTopbar from '@/components/admin/AdminTopbar';
import { hasMockAdminSession } from '@/utils/adminAuth';

export default function AdminAuthShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [checking, setChecking] = useState(true);
  const isLogin = pathname === '/admin/login';

  useEffect(() => {
    let redirect: number | undefined;

    const verify = window.setTimeout(() => {
      if (isLogin) {
        setAllowed(true);
        setChecking(false);
        return;
      }

      if (hasMockAdminSession()) {
        setAllowed(true);
        setChecking(false);
        return;
      }

      setAllowed(false);
      setChecking(false);
      redirect = window.setTimeout(() => {
        router.replace('/admin/login');
      }, 900);
    }, 0);

    return () => {
      window.clearTimeout(verify);
      if (redirect) {
        window.clearTimeout(redirect);
      }
    };
  }, [isLogin, router]);

  if (isLogin) {
    return <>{children}</>;
  }

  if (checking || !allowed) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-6"
        style={{ background: 'radial-gradient(circle at top, #1e1b4b 0%, #020617 42%, #020617 100%)' }}
      >
        <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-950/80 p-8 text-center shadow-2xl backdrop-blur">
          <div
            className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg shadow-purple-950/40"
            style={{ background: 'linear-gradient(135deg, #6b21a8, #7c3aed)' }}
          >
            <ShieldCheck className="h-7 w-7" strokeWidth={1.8} />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-purple-300">Acesso protegido</p>
          <h1 className="mt-3 text-2xl font-black text-white">Verificando sessão administrativa</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Redirecionando para a entrada segura do painel Metalab.
          </p>
          <div className="mt-7 h-1.5 overflow-hidden rounded-full bg-slate-800">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-purple-500" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex" style={{ background: '#020617', minHeight: '100vh' }}>
      <AdminSidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <AdminTopbar />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
