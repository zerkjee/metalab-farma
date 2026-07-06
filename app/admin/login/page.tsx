'use client';

import { Eye, EyeOff, LockKeyhole, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { signIn } from 'next-auth/react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
    router.replace('/admin');
    router.refresh();
  }

  const loading = status === 'loading';
  const success = status === 'success';

  return (
    <main className="min-h-screen overflow-hidden bg-surface-page px-5 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center">
        <section className="grid w-full overflow-hidden rounded-[2rem] border border-line bg-surface-card shadow-md lg:grid-cols-[1fr_440px]">
          {/* Painel showcase — navy (o único bloco escuro forte) */}
          <div className="hidden min-h-[620px] flex-col justify-between bg-navy p-10 text-on-navy lg:flex">
            <div>
              <div className="flex items-center gap-3">
                <Image
                  src="/brand/metalab-mark.png"
                  alt="Metalab"
                  width={44}
                  height={44}
                  className="rounded-2xl"
                />
                <div>
                  <p className="text-lg font-display tracking-tight text-white">Metalab</p>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-300">Admin</p>
                </div>
              </div>

              <div className="mt-24 max-w-xl">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-300">Painel seguro</p>
                <h1 className="mt-5 font-display text-5xl leading-tight tracking-tight text-white">
                  Gestão premium da loja Metalab.
                </h1>
                <p className="mt-5 max-w-lg text-base leading-7 text-navy-100">
                  Acesso reservado para administração de produtos, pedidos, clientes, campanhas e indicadores.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {['Autenticação real', 'Sessão segura JWT', 'Acesso por papel'].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                  <ShieldCheck className="mb-3 h-5 w-5 text-brand-300" strokeWidth={1.8} />
                  <p className="text-xs font-semibold text-navy-100">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Painel do formulário — superfície clara */}
          <div className="flex min-h-[620px] items-center justify-center p-6 sm:p-10">
            <div className="w-full max-w-sm">
              <div className="mb-8 text-center lg:hidden">
                <Image
                  src="/brand/metalab-mark.png"
                  alt="Metalab"
                  width={48}
                  height={48}
                  className="mx-auto mb-3 rounded-2xl"
                />
                <p className="text-xl font-display tracking-tight text-navy">Metalab</p>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-700">Admin</p>
              </div>

              <div className="rounded-3xl border border-line bg-surface-card p-6 shadow-sm">
                <div className="mb-6 flex items-start gap-3 rounded-2xl border border-line bg-brand-50 p-4">
                  <LockKeyhole className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-700" strokeWidth={1.8} />
                  <div>
                    <p className="text-sm font-bold text-navy">Entrada administrativa</p>
                    <p className="mt-1 text-xs leading-5 text-ink-secondary">
                      Autenticação real com NextAuth. Apenas administradores têm acesso.
                    </p>
                  </div>
                </div>

                {status === 'error' && (
                  <div className="mb-4 rounded-xl border border-danger/30 bg-danger-subtle px-4 py-3 text-sm text-danger">
                    {errorMsg}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="admin-email" className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-ink-secondary">
                      E-mail
                    </label>
                    <input
                      id="admin-email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="h-12 w-full rounded-2xl border border-line-default bg-surface-card px-4 text-sm text-ink outline-none transition-all placeholder:text-ink-muted focus:border-brand focus:ring-4 focus:ring-brand/10"
                      placeholder="admin@metalab.com.br"
                      autoComplete="email"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="admin-password" className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-ink-secondary">
                      Senha
                    </label>
                    <div className="relative">
                      <input
                        id="admin-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        className="h-12 w-full rounded-2xl border border-line-default bg-surface-card px-4 pr-12 text-sm text-ink outline-none transition-all placeholder:text-ink-muted focus:border-brand focus:ring-4 focus:ring-brand/10"
                        placeholder="Digite sua senha"
                        autoComplete="current-password"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl text-ink-muted transition-all hover:bg-surface-sunken hover:text-navy active:scale-95"
                        aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || success}
                    className="flex h-12 w-full items-center justify-center rounded-full bg-brand px-4 text-sm font-bold text-on-brand shadow-sm transition-all duration-300 hover:bg-brand-hover active:scale-[0.99] disabled:cursor-wait disabled:opacity-80"
                  >
                    {loading ? 'Verificando acesso...' : success ? 'Acesso liberado ✓' : 'Entrar no painel'}
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
