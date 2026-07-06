'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { CheckCircle2, UserPlus } from 'lucide-react';
import type { CheckoutForm } from '@/types/checkout';

type Status = 'idle' | 'done' | 'exists' | 'error';

// Bloco opcional pós-pedido: cria conta (senha) reaproveitando o cadastro.
// Como o pedido convidado é vinculado por e-mail, ao criar a conta com o mesmo
// e-mail o pedido passa a aparecer em "Meus pedidos" logado, em qualquer dispositivo.
export default function CriarContaPrompt({ customer }: { customer: CheckoutForm }) {
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [msg, setMsg] = useState('');

  async function handleCriar() {
    setMsg('');
    if (senha.length < 8) { setMsg('A senha precisa de ao menos 8 caracteres.'); return; }
    if (senha !== confirmar) { setMsg('As senhas não conferem.'); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: customer.fullName,
          email: customer.email,
          senha,
          confirmarSenha: confirmar,
          cpf: customer.cpf.replace(/\D/g, ''),
          telefone: customer.phone || undefined,
          endereco: {
            cep: customer.zipCode.replace(/\D/g, ''),
            logradouro: customer.address,
            numero: customer.number,
            complemento: customer.complement || undefined,
            bairro: customer.district,
            cidade: customer.city,
            estado: customer.state,
          },
        }),
      });

      if (res.status === 409) {
        setStatus('exists');
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setStatus('error');
        setMsg(data?.erro ?? 'Não foi possível criar a conta. Tente novamente.');
        return;
      }

      // Conta criada → faz login para vincular os pedidos à conta.
      await signIn('credentials', { email: customer.email, senha, redirect: false });
      setStatus('done');
    } catch {
      setStatus('error');
      setMsg('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  if (status === 'done') {
    return (
      <div className="mx-auto mt-6 flex max-w-3xl items-center gap-2 rounded-2xl border border-success/20 bg-success-subtle px-5 py-4 text-sm text-success">
        <CheckCircle2 className="h-4 w-4 shrink-0" strokeWidth={2} />
        <span>
          Conta criada! Seus pedidos agora ficam salvos na sua conta — acesse em{' '}
          <Link href="/pedidos" className="font-bold underline">Meus pedidos</Link>.
        </span>
      </div>
    );
  }

  if (status === 'exists') {
    return (
      <div className="mx-auto mt-6 max-w-3xl rounded-2xl border border-line bg-surface-sunken px-5 py-4 text-sm text-ink-secondary">
        Você já tem uma conta com este e-mail/CPF.{' '}
        <Link href="/login?callbackUrl=/pedidos" className="font-bold text-navy underline">Entrar</Link>{' '}para ver seus pedidos.
      </div>
    );
  }

  return (
    <div className="mx-auto mt-6 max-w-3xl rounded-2xl border border-line bg-surface-card p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <UserPlus className="h-4 w-4 text-navy" strokeWidth={1.8} />
        <p className="font-display text-sm font-semibold text-navy">Criar conta para acompanhar seus pedidos</p>
      </div>
      <p className="mt-1 text-xs text-ink-secondary">
        Opcional. Crie uma senha para ver seus pedidos de qualquer dispositivo. Seus dados já estão preenchidos.
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          placeholder="Crie uma senha"
          autoComplete="new-password"
          className="flex-1 rounded-xl border border-line-default bg-surface-sunken px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-brand focus:bg-surface-card"
        />
        <input
          type="password"
          value={confirmar}
          onChange={(e) => setConfirmar(e.target.value)}
          placeholder="Confirme a senha"
          autoComplete="new-password"
          className="flex-1 rounded-xl border border-line-default bg-surface-sunken px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-brand focus:bg-surface-card"
        />
        <button
          onClick={handleCriar}
          disabled={loading || !senha || !confirmar}
          className="rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-on-brand transition-all hover:bg-brand-hover disabled:opacity-50"
        >
          {loading ? 'Criando…' : 'Criar conta'}
        </button>
      </div>
      {msg && <p className="mt-2 text-xs text-danger">{msg}</p>}
    </div>
  );
}
