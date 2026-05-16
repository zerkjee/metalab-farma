'use client';

import { Eye, EyeOff, ShieldCheck, Package, Tag } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState, useCallback, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';

// ── formatters ───────────────────────────────────────────────────────────────
function toTitleCase(s: string) {
  return s.toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase());
}

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

// ── password requirements ─────────────────────────────────────────────────────
const senhaReqs = [
  { key: 'len',     label: 'Mínimo 8 caracteres',          test: (p: string) => p.length >= 8 },
  { key: 'upper',   label: '1 letra maiúscula (A–Z)',       test: (p: string) => /[A-Z]/.test(p) },
  { key: 'lower',   label: '1 letra minúscula (a–z)',       test: (p: string) => /[a-z]/.test(p) },
  { key: 'num',     label: '1 número (0–9)',                test: (p: string) => /[0-9]/.test(p) },
  { key: 'special', label: '1 caractere especial (!@#...)', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

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
function cepMask(v: string) {
  return v.replace(/\D/g, '').slice(0, 8).replace(/(\d{5})(\d{1,3})$/, '$1-$2');
}

type FormKey = 'nome' | 'email' | 'cpf' | 'telefone' | 'senha' | 'confirmarSenha'
  | 'cep' | 'logradouro' | 'numero' | 'complemento' | 'bairro' | 'cidade' | 'estado';

const initial = {
  nome: '', email: '', cpf: '', telefone: '', senha: '', confirmarSenha: '',
  cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '',
};

export default function RegistroPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();

  const [form, setForm] = useState(initial);
  const [touched, setTouched] = useState<Partial<Record<FormKey, boolean>>>({});
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (sessionStatus === 'authenticated' && session) {
      router.replace('/');
    }
  }, [sessionStatus, session, router]);

  const set = useCallback((field: FormKey, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
  }, []);

  const lookupCep = useCallback(async (raw: string) => {
    const digits = raw.replace(/\D/g, '');
    if (digits.length !== 8) return;
    try {
      const res = await fetch(`/api/cep?cep=${digits}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.logradouro) setForm((p) => ({ ...p, logradouro: data.logradouro }));
      if (data.bairro)     setForm((p) => ({ ...p, bairro: data.bairro }));
      if (data.cidade)     setForm((p) => ({ ...p, cidade: data.cidade }));
      if (data.estado)     setForm((p) => ({ ...p, estado: data.estado }));
    } catch { /* ignore */ }
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
  else if (senhaReqs.some((r) => !r.test(form.senha))) errors.senha = 'A senha não atende todos os requisitos.';
  if (!form.confirmarSenha) errors.confirmarSenha = 'Confirme a senha.';
  else if (form.senha !== form.confirmarSenha) errors.confirmarSenha = 'As senhas não conferem.';
  const cepRaw = form.cep.replace(/\D/g, '');
  if (!cepRaw || cepRaw.length !== 8) errors.cep = 'CEP inválido.';
  if (!form.logradouro.trim()) errors.logradouro = 'Endereço é obrigatório.';
  if (!form.numero.trim()) errors.numero = 'Número é obrigatório.';
  if (!form.bairro.trim()) errors.bairro = 'Bairro é obrigatório.';
  if (!form.cidade.trim()) errors.cidade = 'Cidade é obrigatória.';
  if (!form.estado.trim() || form.estado.length !== 2) errors.estado = 'UF inválida.';

  const isValid = Object.keys(errors).length === 0;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setTouched({
      nome: true, email: true, cpf: true, senha: true, confirmarSenha: true,
      cep: true, logradouro: true, numero: true, bairro: true, cidade: true, estado: true,
    });
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
          endereco: {
            cep: cepRaw,
            logradouro: form.logradouro.trim(),
            numero: form.numero.trim(),
            complemento: form.complemento.trim() || undefined,
            bairro: form.bairro.trim(),
            cidade: form.cidade.trim(),
            estado: form.estado.toUpperCase(),
          },
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

  if (sessionStatus === 'authenticated') return null;

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
                      onChange={(e) => set('nome', toTitleCase(e.target.value))}
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
                        type="tel"
                        value={form.telefone}
                        onChange={(e) => set('telefone', phoneMask(e.target.value))}
                        placeholder="(11) 99999-0000"
                        inputMode="numeric"
                        className={inputCls(false)}
                      />
                    </Field>
                  </div>

                  {/* ── Endereço ── */}
                  <div className="border-t border-white/10 pt-3.5 mt-0.5">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-300 mb-3">Endereço</p>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="CEP" error={errors.cep} touched={touched.cep}>
                        <input
                          type="text"
                          value={form.cep}
                          onChange={(e) => {
                            const masked = cepMask(e.target.value);
                            set('cep', masked);
                            if (masked.replace(/\D/g, '').length === 8) lookupCep(masked);
                          }}
                          onBlur={() => touch('cep')}
                          placeholder="00000-000"
                          inputMode="numeric"
                          className={inputCls(!!(touched.cep && errors.cep))}
                        />
                      </Field>
                      <Field label="Número" error={errors.numero} touched={touched.numero}>
                        <input
                          type="text"
                          value={form.numero}
                          onChange={(e) => set('numero', e.target.value)}
                          onBlur={() => touch('numero')}
                          placeholder="120"
                          className={inputCls(!!(touched.numero && errors.numero))}
                        />
                      </Field>
                    </div>
                    <div className="mt-3">
                      <Field label="Endereço" error={errors.logradouro} touched={touched.logradouro}>
                        <input
                          type="text"
                          value={form.logradouro}
                          onChange={(e) => set('logradouro', e.target.value)}
                          onBlur={() => touch('logradouro')}
                          placeholder="Rua das Flores"
                          className={inputCls(!!(touched.logradouro && errors.logradouro))}
                        />
                      </Field>
                    </div>
                    <div className="mt-3">
                      <Field label="Complemento (opcional)">
                        <input
                          type="text"
                          value={form.complemento}
                          onChange={(e) => set('complemento', e.target.value)}
                          placeholder="Apto 402"
                          className={inputCls(false)}
                        />
                      </Field>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <Field label="Bairro" error={errors.bairro} touched={touched.bairro}>
                        <input
                          type="text"
                          value={form.bairro}
                          onChange={(e) => set('bairro', e.target.value)}
                          onBlur={() => touch('bairro')}
                          placeholder="Centro"
                          className={inputCls(!!(touched.bairro && errors.bairro))}
                        />
                      </Field>
                      <Field label="Estado" error={errors.estado} touched={touched.estado}>
                        <input
                          type="text"
                          value={form.estado}
                          onChange={(e) => set('estado', e.target.value.toUpperCase().slice(0, 2))}
                          onBlur={() => touch('estado')}
                          placeholder="MG"
                          maxLength={2}
                          className={inputCls(!!(touched.estado && errors.estado))}
                        />
                      </Field>
                    </div>
                    <div className="mt-3">
                      <Field label="Cidade" error={errors.cidade} touched={touched.cidade}>
                        <input
                          type="text"
                          value={form.cidade}
                          onChange={(e) => set('cidade', e.target.value)}
                          onBlur={() => touch('cidade')}
                          placeholder="Belo Horizonte"
                          className={inputCls(!!(touched.cidade && errors.cidade))}
                        />
                      </Field>
                    </div>
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
                    {/* Requisitos de senha */}
                    {form.senha.length > 0 && (
                      <ul className="mt-2 flex flex-col gap-1">
                        {senhaReqs.map((r) => {
                          const ok = r.test(form.senha);
                          return (
                            <li key={r.key} className={`flex items-center gap-1.5 text-[11px] font-medium transition-colors ${ok ? 'text-emerald-400' : 'text-slate-500'}`}>
                              <span className={`flex-shrink-0 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-black ${ok ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-600'}`}>
                                {ok ? '✓' : '×'}
                              </span>
                              {r.label}
                            </li>
                          );
                        })}
                      </ul>
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
