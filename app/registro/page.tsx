'use client';

import { Eye, EyeOff, ShieldCheck, Zap } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';

function cpfMask(value: string) {
  return value.replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function phoneMask(value: string) {
  return value.replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
}

export default function RegistroPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();

  if (sessionStatus === 'authenticated' && session) {
    router.replace('/');
    return null;
  }

  const [form, setForm] = useState({
    nome: '',
    email: '',
    cpf: '',
    telefone: '',
    senha: '',
    confirmarSenha: '',
  });
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  function set(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    if (form.senha !== form.confirmarSenha) {
      setStatus('error');
      setErrorMsg('As senhas não conferem.');
      return;
    }

    const payload = {
      nome: form.nome,
      email: form.email,
      cpf: form.cpf.replace(/\D/g, ''),
      telefone: form.telefone ? form.telefone.replace(/\D/g, '') : undefined,
      senha: form.senha,
      confirmarSenha: form.confirmarSenha,
    };

    try {
      const res = await fetch('/api/auth/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus('error');
        setErrorMsg(data.erro ?? 'Erro ao criar conta. Tente novamente.');
        return;
      }

      // Auto-login after registration
      const result = await signIn('credentials', {
        email: form.email,
        senha: form.senha,
        redirect: false,
      });

      if (result?.error) {
        // Registration succeeded but login failed — redirect to login
        router.replace('/login');
        return;
      }

      setStatus('success');
      router.replace('/');
      router.refresh();
    } catch {
      setStatus('error');
      setErrorMsg('Erro de conexão. Tente novamente.');
    }
  }

  const loading = status === 'loading';

  return (
    <main
      className="min-h-screen overflow-hidden px-5 py-8 text-white"
      style={{ background: 'radial-gradient(circle at 18% 10%, #312e81 0%, #111827 34%, #020617 78%)' }}
    >
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl items-center justify-center py-12">
        <section className="grid w-full overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/70 shadow-2xl shadow-black/40 backdrop-blur lg:grid-cols-[1fr_440px]">

          {/* Left panel */}
          <div className="hidden min-h-[640px] flex-col justify-between border-r border-white/10 p-10 lg:flex">
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
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-purple-300">Novo cliente</p>
                <h1 className="mt-4 text-4xl font-black leading-tight tracking-tight">
                  Crie sua conta e comece a transformar seu desempenho.
                </h1>
                <p className="mt-4 text-sm leading-7 text-slate-300">
                  Cadastro rápido e seguro. Acompanhe pedidos, salve endereços e acesse promoções exclusivas.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: <ShieldCheck size={16} strokeWidth={1.8} />, label: 'Dados protegidos' },
                { icon: <Zap size={16} strokeWidth={1.8} />, label: 'Rastreio de pedidos' },
                { icon: <ShieldCheck size={16} strokeWidth={1.8} />, label: 'Ofertas exclusivas' },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <span className="mb-3 block text-purple-300">{item.icon}</span>
                  <p className="text-xs font-semibold text-slate-300">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right panel — form */}
          <div className="flex min-h-[640px] items-center justify-center p-6 sm:p-10">
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
                <h2 className="text-lg font-black text-white mb-1">Criar conta</h2>
                <p className="text-xs text-slate-500 mb-5">Preencha os dados abaixo</p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Nome completo</label>
                    <input
                      type="text"
                      value={form.nome}
                      onChange={(e) => set('nome', e.target.value)}
                      required
                      autoFocus
                      placeholder="Seu nome"
                      className="w-full rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/40 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => set('email', e.target.value)}
                      required
                      placeholder="seu@email.com"
                      className="w-full rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/40 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">CPF</label>
                      <input
                        type="text"
                        value={form.cpf}
                        onChange={(e) => set('cpf', cpfMask(e.target.value))}
                        required
                        placeholder="000.000.000-00"
                        inputMode="numeric"
                        className="w-full rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/40 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">Telefone</label>
                      <input
                        type="text"
                        value={form.telefone}
                        onChange={(e) => set('telefone', phoneMask(e.target.value))}
                        placeholder="(11) 99999-0000"
                        inputMode="numeric"
                        className="w-full rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/40 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Senha</label>
                    <div className="relative">
                      <input
                        type={showSenha ? 'text' : 'password'}
                        value={form.senha}
                        onChange={(e) => set('senha', e.target.value)}
                        required
                        placeholder="Mínimo 6 caracteres"
                        className="w-full rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2.5 pr-11 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/40 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSenha(!showSenha)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {showSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Confirmar senha</label>
                    <div className="relative">
                      <input
                        type={showConfirmar ? 'text' : 'password'}
                        value={form.confirmarSenha}
                        onChange={(e) => set('confirmarSenha', e.target.value)}
                        required
                        placeholder="Repita a senha"
                        className="w-full rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2.5 pr-11 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/40 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmar(!showConfirmar)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {showConfirmar ? <EyeOff size={16} /> : <Eye size={16} />}
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
                    className="w-full rounded-xl py-3 text-sm font-bold text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-1"
                    style={{ background: 'linear-gradient(135deg, #6b21a8, #7c3aed)' }}
                  >
                    {loading ? 'Criando conta...' : 'Criar conta'}
                  </button>

                  <p className="text-center text-xs text-slate-500">
                    Já tem conta?{' '}
                    <Link href="/login" className="text-purple-400 hover:text-purple-300 font-semibold">
                      Entrar
                    </Link>
                  </p>
                </form>
              </div>
            </div>
          </div>

        </section>
      </div>
    </main>
  );
}
