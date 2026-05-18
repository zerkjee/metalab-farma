'use client';

import { Eye, EyeOff, ShieldCheck, Zap } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, Suspense, useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawCallback = searchParams.get('callbackUrl') ?? '/'
  // Bloqueia open redirect: só aceita paths relativos que começam com /
  const callbackUrl = rawCallback.startsWith('/') && !rawCallback.startsWith('//') ? rawCallback : '/';
  const { data: session, status: sessionStatus } = useSession();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (sessionStatus === 'authenticated' && session) {
      router.replace(callbackUrl);
    }
  }, [sessionStatus, session, router, callbackUrl]);

  if (sessionStatus === 'authenticated') return null;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    const result = await signIn('credentials', {
      email,
      senha: password,
      redirect: false,
    });

    if (result?.error) {
      setStatus('error');
      setErrorMsg('Email ou senha inválidos. Verifique e tente novamente.');
      return;
    }

    setStatus('success');
    router.replace(callbackUrl);
    router.refresh();
  }

  const loading = status === 'loading';

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-xs font-semibold text-slate-400 mb-1.5">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
          placeholder="seu@email.com"
          className="w-full rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-3 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/40 transition-all"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-400 mb-1.5">Senha</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Mínimo 6 caracteres"
            className="w-full rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-3 pr-11 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/40 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {status === 'error' && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-400">
          {errorMsg}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl py-3 text-sm font-bold text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ background: 'linear-gradient(135deg, #6b21a8, #7c3aed)' }}
      >
        {loading ? 'Entrando...' : 'Entrar'}
      </button>

      <p className="text-center text-xs text-slate-500">
        Não tem conta?{' '}
        <Link href="/registro" className="text-purple-400 hover:text-purple-300 font-semibold">
          Criar conta grátis
        </Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main
      className="min-h-screen overflow-hidden px-5 py-8 text-white"
      style={{ background: 'radial-gradient(circle at 18% 10%, #312e81 0%, #111827 34%, #020617 78%)' }}
    >
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl items-center justify-center">
        <section className="grid w-full overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/70 shadow-2xl shadow-black/40 backdrop-blur lg:grid-cols-[1fr_420px]">

          {/* Left panel */}
          <div className="hidden min-h-[580px] flex-col justify-between border-r border-white/10 p-10 lg:flex">
            <div>
              <Link href="/" className="flex items-center gap-3">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-2xl text-lg font-black shadow-lg shadow-purple-950/40"
                  style={{ background: 'linear-gradient(135deg, #6b21a8, #7c3aed)' }}
                >
                  M
                </div>
                <div>
                  <p className="text-lg font-black tracking-tight">METALAB</p>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-purple-300">Suplementos</p>
                </div>
              </Link>

              <div className="mt-20 max-w-xl">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-purple-300">Sua conta</p>
                <h1 className="mt-4 text-4xl font-black leading-tight tracking-tight">
                  Acesse e aproveite benefícios exclusivos.
                </h1>
                <p className="mt-4 text-sm leading-7 text-slate-300">
                  Acompanhe seus pedidos, gerencie endereços e acesse ofertas especiais para clientes Metalab.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: <ShieldCheck size={16} strokeWidth={1.8} />, label: 'Compra segura' },
                { icon: <Zap size={16} strokeWidth={1.8} />, label: 'Entrega rápida' },
                { icon: <ShieldCheck size={16} strokeWidth={1.8} />, label: 'PIX com desconto' },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <span className="mb-3 block text-purple-300">{item.icon}</span>
                  <p className="text-xs font-semibold text-slate-300">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right panel — form */}
          <div className="flex min-h-[580px] items-center justify-center p-6 sm:p-10">
            <div className="w-full max-w-sm">
              <div className="mb-7 lg:hidden text-center">
                <Link href="/">
                  <div
                    className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-black shadow-lg shadow-purple-950/40"
                    style={{ background: 'linear-gradient(135deg, #6b21a8, #7c3aed)' }}
                  >
                    M
                  </div>
                </Link>
                <p className="text-xl font-black tracking-tight">METALAB</p>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-purple-300">Suplementos</p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl">
                <h2 className="text-lg font-black text-white mb-1">Entrar na conta</h2>
                <p className="text-xs text-slate-500 mb-6">Use seu email e senha cadastrados</p>

                <Suspense fallback={null}>
                  <LoginForm />
                </Suspense>
              </div>
            </div>
          </div>

        </section>
      </div>
    </main>
  );
}
