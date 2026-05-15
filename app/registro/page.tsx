'use client';

import { Eye, EyeOff, ShieldCheck, Package, Tag } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState, useCallback } from 'react';
import { signIn, useSession } from 'next-auth/react';

// ── masks ────────────────────────────────────────────────────────────────────
function cpfMask(v: string) {
  return v.replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function phoneMask(v: string) {
  return v.replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
}

// ── CPF validator ─────────────────────────────────────────────────────────────
function validarCPF(cpf: string): boolean {
  const d = cpf.replace(/\D/g, '');
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  let s = 0;
  for (let i = 0; i < 9; i++) s += parseInt(d[i]) * (10 - i);
  let r = (s * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  if (r !== parseInt(d[9])) return false;
  s = 0;
  for (let i = 0; i < 10; i++) s += parseInt(d[i]) * (11 - i);
  r = (s * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  return r === parseInt(d[10]);
}

// ── password strength ─────────────────────────────────────────────────────────
type Strength = 'fraca' | 'média' | 'forte';

function calcStrength(pwd: string): { level: Strength; score: number } {
  if (pwd.length < 4) return { level: 'fraca', score: 0 };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 1) return { level: 'fraca', score: 1 };
  if (score <= 3) return { level: 'média', score: 2 };
  return { level: 'forte', score: 3 };
}

const strengthConfig = {
  fraca: { color: '#ef4444', label: 'Fraca', bars: 1 },
  média: { color: '#f59e0b', label: 'Média', bars: 2 },
  forte: { color: '#22c55e', label: 'Forte', bars: 3 },
};

// ── field input ───────────────────────────────────────────────────────────────
function Field({
  label, error, touched, children,
}: {
  label: string; error?: string; touched?: boolean; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="block text-xs font-semibold text-slate-400">{label}</label>
      {children}
      {touched && error && (
        <p className="flex items-center gap-1 text-xs text-red-400">
          <span className="inline-block w-1 h-1 rounded-full bg-red-400 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

const inputCls = (hasError: boolean) =>
  `w-full rounded-xl border bg-slate-800/60 px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none transition-all ${
    hasError
      ? 'border-red-500/60 focus:border-red-400 focus:ring-1 focus:ring-red-400/30'
      : 'border-slate-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/40'
  }`;

// ── main page ─────────────────────────────────────────────────────────────────
type FormKey = 'nome' | 'email' | 'cpf' | 'telefone' | 'senha' | 'confirmarSenha';

const initial = { nome: '', email: '', cpf: '', telefone: '', senha: '', confirmarSenha: '' };

export default function RegistroPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();

  if (sessionStatus === 'authenticated' && session) {
    router.replace('/');
    return null;
  }

  const [form, setForm] = useState(initial);
  const [touched, setTouched] = useState<Partial<Record<FormKey, boolean>>>({});
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [serverError, setServerError] = useState('');

  const set = useCallback((field: FormKey, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
  }, []);

  const touch = useCallback((field: FormKey) => {
    setTouched((p) => ({ ...p, [field]: true }));
  }, []);

  // ── inline validation ──
  const errors: Partial<Record<FormKey, string>> = {};
  if (!form.nome.trim() || form.nome.trim().length < 2) errors.nome = 'Nome deve ter ao menos 2 caracteres.';
  if (!form.email) errors.email = 'Email é obrigatório.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Email inválido.';
  const cpfRaw = form.cpf.replace(/\D/g, '');
  if (!cpfRaw) errors.cpf = 'CPF é obrigatório.';
  else if (cpfRaw.length !== 11) errors.cpf = 'CPF incompleto.';
  else if (!validarCPF(cpfRaw)) errors.cpf = 'CPF inválido.';
  if (!form.senha) errors.senha = 'Senha é obrigatória.';
  else if (form.senha.length < 8) errors.senha = 'Mínimo 8 caracteres.';
  if (!form.confirmarSenha) errors.confirmarSenha = 'Confirme a senha.';
  else if (form.senha !== form.confirmarSenha) errors.confirmarSenha = 'As senhas não conferem.';

  const strength = form.senha ? calcStrength(form.senha) : null;
  const strCfg = strength ? strengthConfig[strength.level] : null;
  const isValid = Object.keys(errors).length === 0;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setTouched({ nome: true, email: true, cpf: true, senha: true, confirmarSenha: true });
    if (!isValid) return;

    setSubmitStatus('loading');
    setServerError('');

    try {
      const res = await fetch('/api/auth/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: form.nome.trim(),
          email: form.email,
          cpf: cpfRaw,
          telefone: form.telefone ? form.telefone.replace(/\D/g, '') : undefined,
          senha: form.senha,
          confirmarSenha: form.confirmarSenha,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setSubmitStatus('error');
        setServerError(data.erro ?? 'Erro ao criar conta. Tente novamente.');
        return;
      }

      const result = await signIn('credentials', {
        email: form.email,
        senha: form.senha,
        redirect: false,
      });

      if (result?.error) { router.replace('/login'); return; }
      router.replace('/');
      router.refresh();
    } catch {
      setSubmitStatus('error');
      setServerError('Erro de conexão. Tente novamente.');
    }
  }

  const loading = submitStatus === 'loading';

  return (
    <main
      className="min-h-screen overflow-hidden px-5 py-8 text-white"
      style={{ background: 'radial-gradient(circle at 18% 10%, #312e81 0%, #111827 34%, #020617 78%)' }}
    >
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl items-center justify-center py-12">
        <section className="grid w-full overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/70 shadow-2xl shadow-black/40 backdrop-blur lg:grid-cols-[1fr_460px]">

          {/* ── left panel ── */}
          <div className="hidden min-h-[680px] flex-col justify-between border-r border-white/10 p-10 lg:flex">
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
                <p className="mt-4 text-sm leading-7 text-slate-400">
                  Cadastro rápido e seguro. Acompanhe pedidos, acumule pontos no programa VIP e acesse promoções exclusivas.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: <ShieldCheck size={16} strokeWidth={1.8} />, label: 'Dados protegidos' },
                { icon: <Package size={16} strokeWidth={1.8} />, label: 'Rastreio de pedidos' },
                { icon: <Tag size={16} strokeWidth={1.8} />, label: 'Ofertas exclusivas' },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <span className="mb-3 block text-purple-300">{item.icon}</span>
                  <p className="text-xs font-semibold text-slate-300">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── right panel — form ── */}
          <div className="flex min-h-[680px] items-center justify-center p-6 sm:p-10">
            <div className="w-full max-w-sm">

              {/* Mobile logo */}
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
                <h2 className="text-lg font-black text-white mb-0.5">Criar conta</h2>
                <p className="text-xs text-slate-500 mb-5">Preencha os dados abaixo para se cadastrar</p>

                {serverError && (
                  <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-400">
                    {serverError}
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3.5">

                  <Field label="Nome completo" error={errors.nome} touched={touched.nome}>
                    <input
                      type="text"
                      value={form.nome}
                      onChange={(e) => set('nome', e.target.value)}
                      onBlur={() => touch('nome')}
                      autoFocus
                      placeholder="Seu nome completo"
                      className={inputCls(!!(touched.nome && errors.nome))}
                    />
                  </Field>

                  <Field label="Email" error={errors.email} touched={touched.email}>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => set('email', e.target.value)}
                      onBlur={() => touch('email')}
                      placeholder="seu@email.com"
                      className={inputCls(!!(touched.email && errors.email))}
                    />
                  </Field>

                  <div className="grid grid-cols-2 gap-3">
                    <Field label="CPF" error={errors.cpf} touched={touched.cpf}>
                      <input
                        type="text"
                        value={form.cpf}
                        onChange={(e) => set('cpf', cpfMask(e.target.value))}
                        onBlur={() => touch('cpf')}
                        placeholder="000.000.000-00"
                        inputMode="numeric"
                        className={inputCls(!!(touched.cpf && errors.cpf))}
                      />
                    </Field>
                    <Field label="Telefone (opcional)">
                      <input
                        type="text"
                        value={form.telefone}
                        onChange={(e) => set('telefone', phoneMask(e.target.value))}
                        placeholder="(11) 99999-0000"
                        inputMode="numeric"
                        className={inputCls(false)}
                      />
                    </Field>
                  </div>

                  <Field label="Senha" error={errors.senha} touched={touched.senha}>
                    <div className="relative">
                      <input
                        type={showSenha ? 'text' : 'password'}
                        value={form.senha}
                        onChange={(e) => set('senha', e.target.value)}
                        onBlur={() => touch('senha')}
                        placeholder="Mínimo 8 caracteres"
                        className={`${inputCls(!!(touched.senha && errors.senha))} pr-11`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowSenha((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                        tabIndex={-1}
                      >
                        {showSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {/* Strength bar */}
                    {form.senha.length > 0 && strCfg && (
                      <div className="mt-1.5">
                        <div className="flex gap-1 mb-1">
                          {[1, 2, 3].map((i) => (
                            <div
                              key={i}
                              className="h-1 flex-1 rounded-full transition-all duration-300"
                              style={{
                                background: i <= (strength?.score ?? 0) ? strCfg.color : 'rgb(51 65 85)',
                              }}
                            />
                          ))}
                        </div>
                        <p className="text-[11px] font-semibold" style={{ color: strCfg.color }}>
                          Senha {strCfg.label}
                          {strength?.level === 'fraca' && ' — adicione números e símbolos'}
                          {strength?.level === 'média' && ' — adicione um símbolo para fortalecer'}
                        </p>
                      </div>
                    )}
                  </Field>

                  <Field label="Confirmar senha" error={errors.confirmarSenha} touched={touched.confirmarSenha}>
                    <div className="relative">
                      <input
                        type={showConfirmar ? 'text' : 'password'}
                        value={form.confirmarSenha}
                        onChange={(e) => set('confirmarSenha', e.target.value)}
                        onBlur={() => touch('confirmarSenha')}
                        placeholder="Repita a senha"
                        className={`${inputCls(!!(touched.confirmarSenha && errors.confirmarSenha))} pr-11`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmar((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                        tabIndex={-1}
                      >
                        {showConfirmar ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {/* Match indicator */}
                    {form.confirmarSenha.length > 0 && !errors.confirmarSenha && (
                      <p className="text-[11px] font-semibold text-emerald-400 mt-0.5">✓ Senhas coincidem</p>
                    )}
                  </Field>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl py-3 text-sm font-bold text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-1 flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg, #6b21a8, #7c3aed)' }}
                  >
                    {loading ? (
                      <>
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Criando conta...
                      </>
                    ) : 'Criar conta'}
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
