'use client';

import { useCallback } from 'react';
import type {
  CheckoutForm as CheckoutFormValues,
  FreteStatus,
  PaymentMethod,
  PaymentMethodId,
  ShippingMethod,
  ShippingMethodId,
} from '@/types/checkout';

interface CheckoutFormProps {
  formId: string;
  values: CheckoutFormValues;
  shippingMethods: ShippingMethod[];
  paymentMethods: PaymentMethod[];
  selectedShippingId: ShippingMethodId;
  selectedPaymentId: PaymentMethodId;
  freteStatus: FreteStatus;
  logado: boolean;
  temEnderecoSalvo: boolean;
  enderecoMode: 'salvo' | 'novo';
  onEnderecoModeChange: (mode: 'salvo' | 'novo') => void;
  submitting?: boolean;
  onChange: <K extends keyof CheckoutFormValues>(key: K, value: CheckoutFormValues[K]) => void;
  onShippingChange: (id: ShippingMethodId) => void;
  onPaymentChange: (id: PaymentMethodId) => void;
  onSubmit: () => void;
}

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

function cepMask(v: string) {
  return v.replace(/\D/g, '').slice(0, 8)
    .replace(/(\d{5})(\d{1,3})$/, '$1-$2');
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

const inputCls = 'w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm text-gray-950 outline-none transition-colors placeholder:text-gray-400 focus:border-[#6b21a8] focus:bg-white';

export default function CheckoutForm({
  formId,
  values,
  shippingMethods,
  paymentMethods,
  selectedShippingId,
  selectedPaymentId,
  freteStatus,
  logado,
  temEnderecoSalvo,
  enderecoMode,
  onEnderecoModeChange,
  submitting = false,
  onChange,
  onShippingChange,
  onPaymentChange,
  onSubmit,
}: CheckoutFormProps) {
  const mostrarFormEndereco = !temEnderecoSalvo || enderecoMode === 'novo';

  const lookupCep = useCallback(async (rawCep: string) => {
    const digits = rawCep.replace(/\D/g, '');
    if (digits.length !== 8) return;
    try {
      const res = await fetch(`/api/cep?cep=${digits}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.logradouro) onChange('address', data.logradouro);
      if (data.bairro)     onChange('district', data.bairro);
      if (data.cidade)     onChange('city', data.cidade);
      if (data.estado)     onChange('state', data.estado);
    } catch { /* silently ignore */ }
  }, [onChange]);

  return (
    <form
      id={formId}
      className="flex flex-col gap-6"
      onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
    >
      {/* ── Dados do cliente ── */}
      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6b21a8]">Dados do cliente</p>
          <h2 className="mt-1 text-xl font-black text-gray-950">Identificação</h2>
        </div>

        {logado ? (
          /* Logado: exibe dados do perfil somente-leitura */
          <div className="grid gap-3 md:grid-cols-2">
            <div className="md:col-span-2 rounded-xl bg-gray-50 px-4 py-3">
              <p className="text-xs font-semibold text-gray-400">Nome completo</p>
              <p className="mt-0.5 text-sm font-bold text-gray-900">{values.fullName}</p>
            </div>
            <div className="rounded-xl bg-gray-50 px-4 py-3">
              <p className="text-xs font-semibold text-gray-400">E-mail</p>
              <p className="mt-0.5 text-sm font-bold text-gray-900">{values.email}</p>
            </div>
            <div className="rounded-xl bg-gray-50 px-4 py-3">
              <p className="text-xs font-semibold text-gray-400">CPF</p>
              <p className="mt-0.5 text-sm font-bold text-gray-900">{values.cpf}</p>
            </div>
            <div className="rounded-xl bg-gray-50 px-4 py-3">
              <p className="text-xs font-semibold text-gray-400">Telefone</p>
              <p className="mt-0.5 text-sm font-bold text-gray-900">{values.phone || '—'}</p>
            </div>
          </div>
        ) : (
          /* Não logado: formulário completo */
          <div className="grid gap-4 md:grid-cols-2">
            <label className="md:col-span-2">
              <span className="mb-1 block text-xs font-semibold text-gray-500">Nome completo</span>
              <input value={values.fullName} onChange={(e) => onChange('fullName', e.target.value)} placeholder="Maria Silva" required className={inputCls} />
            </label>
            <label>
              <span className="mb-1 block text-xs font-semibold text-gray-500">E-mail</span>
              <input type="email" value={values.email} onChange={(e) => onChange('email', e.target.value)} placeholder="maria@email.com" required className={inputCls} />
            </label>
            <label>
              <span className="mb-1 block text-xs font-semibold text-gray-500">Telefone</span>
              <input type="tel" value={values.phone} onChange={(e) => onChange('phone', phoneMask(e.target.value))} placeholder="(11) 99999-9999" inputMode="numeric" required className={inputCls} />
            </label>
            <label>
              <span className="mb-1 block text-xs font-semibold text-gray-500">CPF</span>
              <input value={values.cpf} onChange={(e) => onChange('cpf', cpfMask(e.target.value))} placeholder="000.000.000-00" inputMode="numeric" required className={inputCls} />
            </label>
          </div>
        )}
      </section>

      {/* ── Endereço de entrega ── */}
      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6b21a8]">Entrega</p>
          <h2 className="mt-1 text-xl font-black text-gray-950">Endereço de entrega</h2>
        </div>

        {temEnderecoSalvo && (
          <div className="mb-5 flex gap-2">
            {(['salvo', 'novo'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => onEnderecoModeChange(mode)}
                className={`rounded-xl border px-4 py-2.5 text-sm font-bold transition-all ${
                  enderecoMode === mode
                    ? 'border-[#6b21a8] bg-[#6b21a8]/5 text-[#6b21a8]'
                    : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-[#6b21a8]/30'
                }`}
              >
                {mode === 'salvo' ? 'Meu endereço' : 'Outro endereço'}
              </button>
            ))}
          </div>
        )}

        {!mostrarFormEndereco ? (
          /* Endereço salvo: exibe resumo */
          <div className="grid gap-3 md:grid-cols-2">
            <div className="md:col-span-2 rounded-xl bg-gray-50 px-4 py-3">
              <p className="text-xs font-semibold text-gray-400">Logradouro</p>
              <p className="mt-0.5 text-sm font-bold text-gray-900">{values.address}, {values.number}{values.complement ? ` — ${values.complement}` : ''}</p>
            </div>
            <div className="rounded-xl bg-gray-50 px-4 py-3">
              <p className="text-xs font-semibold text-gray-400">Bairro / Cidade</p>
              <p className="mt-0.5 text-sm font-bold text-gray-900">{values.district}, {values.city} — {values.state}</p>
            </div>
            <div className="rounded-xl bg-gray-50 px-4 py-3">
              <p className="text-xs font-semibold text-gray-400">CEP</p>
              <p className="mt-0.5 text-sm font-bold text-gray-900">{values.zipCode}</p>
            </div>
          </div>
        ) : (
          /* Formulário de endereço */
          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <span className="mb-1 block text-xs font-semibold text-gray-500">CEP</span>
              <input
                value={values.zipCode}
                onChange={(e) => {
                  const masked = cepMask(e.target.value);
                  onChange('zipCode', masked);
                  if (masked.replace(/\D/g, '').length === 8) lookupCep(masked);
                }}
                placeholder="00000-000"
                inputMode="numeric"
                required
                className={inputCls}
              />
            </label>
            <label className="md:col-span-2">
              <span className="mb-1 block text-xs font-semibold text-gray-500">Endereço</span>
              <input value={values.address} onChange={(e) => onChange('address', e.target.value)} placeholder="Rua das Fórmulas" required className={inputCls} />
            </label>
            <label>
              <span className="mb-1 block text-xs font-semibold text-gray-500">Número</span>
              <input value={values.number} onChange={(e) => onChange('number', e.target.value)} placeholder="120" required className={inputCls} />
            </label>
            <label>
              <span className="mb-1 block text-xs font-semibold text-gray-500">Complemento</span>
              <input value={values.complement} onChange={(e) => onChange('complement', e.target.value)} placeholder="Apto 402" className={inputCls} />
            </label>
            <label>
              <span className="mb-1 block text-xs font-semibold text-gray-500">Bairro</span>
              <input value={values.district} onChange={(e) => onChange('district', e.target.value)} placeholder="Centro" required className={inputCls} />
            </label>
            <label>
              <span className="mb-1 block text-xs font-semibold text-gray-500">Cidade</span>
              <input value={values.city} onChange={(e) => onChange('city', e.target.value)} placeholder="São Paulo" required className={inputCls} />
            </label>
            <label>
              <span className="mb-1 block text-xs font-semibold text-gray-500">Estado</span>
              <input value={values.state} onChange={(e) => onChange('state', e.target.value.toUpperCase().slice(0, 2))} placeholder="SP" maxLength={2} required className={inputCls} />
            </label>
          </div>
        )}
      </section>

      {/* ── Entrega ── */}
      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6b21a8]">Entrega</p>
          <h2 className="mt-1 text-xl font-black text-gray-950">Escolha a forma de entrega</h2>
        </div>

        {freteStatus === 'idle' && (
          <p className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-4 text-sm text-gray-400">
            Informe o CEP acima para calcular o frete.
          </p>
        )}

        {freteStatus === 'loading' && (
          <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-4">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#6b21a8] border-t-transparent" />
            <p className="text-sm text-gray-500">Calculando frete...</p>
          </div>
        )}

        {freteStatus === 'error' && (
          <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-4 text-sm text-red-600">
            Não foi possível calcular o frete para este CEP. Verifique o CEP e tente novamente.
          </p>
        )}

        {freteStatus === 'done' && (
          <div className="grid gap-3 md:grid-cols-2">
            {shippingMethods.map((method) => {
              const active = method.id === selectedShippingId;
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => onShippingChange(method.id)}
                  className={`rounded-2xl border p-4 text-left transition-all ${
                    active
                      ? 'border-[#6b21a8] bg-[#6b21a8]/5 shadow-sm'
                      : 'border-gray-200 bg-gray-50 hover:border-[#6b21a8]/40 hover:bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black text-gray-950">{method.label}</p>
                      <p className="mt-1 text-sm leading-5 text-gray-500">{method.description}</p>
                      <p className="mt-2 text-xs font-semibold text-gray-400">{method.estimate}</p>
                    </div>
                    <span className="shrink-0 text-sm font-black text-[#6b21a8]">{formatCurrency(method.price)}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Pagamento ── */}
      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6b21a8]">Pagamento</p>
          <h2 className="mt-1 text-xl font-black text-gray-950">Como você quer pagar?</h2>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {paymentMethods.map((method) => {
            const active = method.id === selectedPaymentId;
            return (
              <button
                key={method.id}
                type="button"
                onClick={() => onPaymentChange(method.id)}
                className={`rounded-2xl border p-4 text-left transition-all ${
                  active
                    ? 'border-[#6b21a8] bg-[#6b21a8]/5 shadow-sm'
                    : 'border-gray-200 bg-gray-50 hover:border-[#6b21a8]/40 hover:bg-white'
                }`}
              >
                <p className="font-black text-gray-950">{method.label}</p>
                <p className="mt-1 text-sm leading-5 text-gray-500">{method.description}</p>
              </button>
            );
          })}
        </div>
      </section>
    </form>
  );
}
