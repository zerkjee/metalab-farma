'use client';

import { Eye, EyeOff, LockKeyhole, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { setMockAdminSession } from '@/utils/adminAuth';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@metalab.com.br');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('loading');

    window.setTimeout(() => {
      setMockAdminSession();
      setStatus('success');

      window.setTimeout(() => {
        router.replace('/admin');
      }, 550);
    }, 850);
  }

  const loading = status === 'loading';
  const success = status === 'success';

  return (
    <main
      className="min-h-screen overflow-hidden px-5 py-8 text-white"
      style={{ background: 'radial-gradient(circle at 18% 10%, #312e81 0%, #111827 34%, #020617 78%)' }}
    >
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center">
        <section className="grid w-full overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/70 shadow-2xl shadow-black/40 backdrop-blur lg:grid-cols-[1fr_440px]">
          <div className="hidden min-h-[620px] flex-col justify-between border-r border-white/10 p-10 lg:flex">
            <div>
              <div className="flex items-center gap-3">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-2xl text-lg font-black shadow-lg shadow-purple-950/40"
                  style={{ background: 'linear-gradient(135deg, #6b21a8, #7c3aed)' }}
                >
                  M
                </div>
                <div>
                  <p className="text-lg font-black tracking-tight">METALAB</p>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-purple-300">Admin</p>
                </div>
              </div>

              <div className="mt-24 max-w-xl">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-purple-300">Painel seguro</p>
                <h1 className="mt-5 text-5xl font-black leading-tight tracking-tight">
                  Gestão premium da loja Metalab.
                </h1>
                <p className="mt-5 max-w-lg text-base leading-7 text-slate-300">
                  Acesso reservado para administração de produtos, pedidos, clientes, campanhas e indicadores.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {['Sessão visual', 'Permissões futuras', 'Middleware pronto'].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <ShieldCheck className="mb-3 h-5 w-5 text-purple-300" strokeWidth={1.8} />
                  <p className="text-xs font-semibold text-slate-300">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex min-h-[620px] items-center justify-center p-6 sm:p-10">
            <div className="w-full max-w-sm">
              <div className="mb-8 text-center lg:hidden">
                <div
                  className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-black shadow-lg shadow-purple-950/40"
                  style={{ background: 'linear-gradient(135deg, #6b21a8, #7c3aed)' }}
                >
                  M
                </div>
                <p className="text-xl font-black tracking-tight">METALAB</p>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-purple-300">Admin</p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl">
                <div className="mb-6 flex items-start gap-3 rounded-2xl border border-purple-400/20 bg-purple-500/10 p-4">
                  <LockKeyhole className="mt-0.5 h-5 w-5 flex-shrink-0 text-purple-300" strokeWidth={1.8} />
                  <div>
                    <p className="text-sm font-bold text-white">Entrada administrativa</p>
                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      Ambiente mockado. A autenticação real será conectada ao backend posteriormente.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="admin-email" className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      E-mail
                    </label>
                    <input
                      id="admin-email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="h-12 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-purple-400 focus:ring-4 focus:ring-purple-500/10"
                      placeholder="admin@metalab.com.br"
                      autoComplete="email"
                    />
                  </div>

                  <div>
                    <label htmlFor="admin-password" className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Senha
                    </label>
                    <div className="relative">
                      <input
                        id="admin-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        className="h-12 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 pr-12 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-purple-400 focus:ring-4 focus:ring-purple-500/10"
                        placeholder="Digite sua senha"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl text-slate-500 transition-all hover:bg-slate-800 hover:text-slate-200 active:scale-95"
                        aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || success}
                    className="flex h-12 w-full items-center justify-center rounded-2xl px-4 text-sm font-bold text-white shadow-lg shadow-purple-950/30 transition-all duration-300 hover:brightness-110 active:scale-[0.99] disabled:cursor-wait disabled:opacity-80"
                    style={{ background: 'linear-gradient(135deg, #6b21a8, #7c3aed)' }}
                  >
                    {loading ? 'Verificando acesso...' : success ? 'Acesso liberado' : 'Entrar no painel'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
