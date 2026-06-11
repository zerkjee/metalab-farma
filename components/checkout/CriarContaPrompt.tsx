'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { UserPlus } from 'lucide-react';
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
      <div className="mx-auto mt-6 max-w-3xl rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
        ✓ Conta criada! Seus pedidos agora ficam salvos na sua conta — acesse em{' '}
        <Link href="/pedidos" className="font-bold underline">Meus pedidos</Link>.
      </div>
    );
  }

  if (status === 'exists') {
    return (
      <div className="mx-auto mt-6 max-w-3xl rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 text-sm text-gray-600">
        Você já tem uma conta com este e-mail/CPF.{' '}
        <Link href="/login?callbackUrl=/pedidos" className="font-bold text-[#0f2756] underline">Entrar</Link>{' '}para ver seus pedidos.
      </div>
    );
  }

  return (
    <div className="mx-auto mt-6 max-w-3xl rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <UserPlus className="h-4 w-4 text-[#0f2756]" strokeWidth={1.8} />
        <p className="text-sm font-black text-gray-900">Criar conta para acompanhar seus pedidos</p>
      </div>
      <p className="mt-1 text-xs text-gray-500">
        Opcional. Crie uma senha para ver seus pedidos de qualquer dispositivo. Seus dados já estão preenchidos.
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          placeholder="Crie uma senha"
          autoComplete="new-password"
          className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#0f2756]"
        />
        <input
          type="password"
          value={confirmar}
          onChange={(e) => setConfirmar(e.target.value)}
          placeholder="Confirme a senha"
          autoComplete="new-password"
          className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#0f2756]"
        />
        <button
          onClick={handleCriar}
          disabled={loading || !senha || !confirmar}
          className="rounded-xl px-5 py-2.5 text-sm font-black text-white transition-all hover:opacity-90 disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #0f2756, #1e50a8)' }}
        >
          {loading ? 'Criando…' : 'Criar conta'}
        </button>
      </div>
      {msg && <p className="mt-2 text-xs text-red-600">{msg}</p>}
    </div>
  );
}
