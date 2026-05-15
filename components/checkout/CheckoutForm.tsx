'use client';

import { useCallback } from 'react';
import type {
  CheckoutForm as CheckoutFormValues,
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
  submitting = false,
  onChange,
  onShippingChange,
  onPaymentChange,
  onSubmit,
}: CheckoutFormProps) {

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
          <h2 className="mt-1 text-xl font-black text-gray-950">Identificação e entrega</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Nome — span 2 */}
          <label className="md:col-span-2">
            <span className="mb-1 block text-xs font-semibold text-gray-500">Nome completo</span>
            <input
              value={values.fullName}
              onChange={(e) => onChange('fullName', e.target.value)}
              placeholder="Maria Silva"
              required
              className={inputCls}
            />
          </label>

          {/* Email */}
          <label>
            <span className="mb-1 block text-xs font-semibold text-gray-500">E-mail</span>
            <input
              type="email"
              value={values.email}
              onChange={(e) => onChange('email', e.target.value)}
              placeholder="maria@email.com"
              required
              className={inputCls}
            />
          </label>

          {/* Telefone */}
          <label>
            <span className="mb-1 block text-xs font-semibold text-gray-500">Telefone</span>
            <input
              type="tel"
              value={values.phone}
              onChange={(e) => onChange('phone', phoneMask(e.target.value))}
              placeholder="(11) 99999-9999"
              inputMode="numeric"
              required
              className={inputCls}
            />
          </label>

          {/* CPF */}
          <label>
            <span className="mb-1 block text-xs font-semibold text-gray-500">CPF</span>
            <input
              value={values.cpf}
              onChange={(e) => onChange('cpf', cpfMask(e.target.value))}
              placeholder="000.000.000-00"
              inputMode="numeric"
              required
              className={inputCls}
            />
          </label>

          {/* CEP com auto-fill */}
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

          {/* Endereço — span 2 */}
          <label className="md:col-span-2">
            <span className="mb-1 block text-xs font-semibold text-gray-500">Endereço</span>
            <input
              value={values.address}
              onChange={(e) => onChange('address', e.target.value)}
              placeholder="Rua das Fórmulas"
              required
              className={inputCls}
            />
          </label>

          {/* Número */}
          <label>
            <span className="mb-1 block text-xs font-semibold text-gray-500">Número</span>
            <input
              value={values.number}
              onChange={(e) => onChange('number', e.target.value)}
              placeholder="120"
              required
              className={inputCls}
            />
          </label>

          {/* Complemento */}
          <label>
            <span className="mb-1 block text-xs font-semibold text-gray-500">Complemento</span>
            <input
              value={values.complement}
              onChange={(e) => onChange('complement', e.target.value)}
              placeholder="Apto 402"
              className={inputCls}
            />
          </label>

          {/* Bairro */}
          <label>
            <span className="mb-1 block text-xs font-semibold text-gray-500">Bairro</span>
            <input
              value={values.district}
              onChange={(e) => onChange('district', e.target.value)}
              placeholder="Centro"
              required
              className={inputCls}
            />
          </label>

          {/* Cidade */}
          <label>
            <span className="mb-1 block text-xs font-semibold text-gray-500">Cidade</span>
            <input
              value={values.city}
              onChange={(e) => onChange('city', e.target.value)}
              placeholder="São Paulo"
              required
              className={inputCls}
            />
          </label>

          {/* Estado */}
          <label>
            <span className="mb-1 block text-xs font-semibold text-gray-500">Estado</span>
            <input
              value={values.state}
              onChange={(e) => onChange('state', e.target.value.toUpperCase().slice(0, 2))}
              placeholder="SP"
              maxLength={2}
              required
              className={inputCls}
            />
          </label>
        </div>
      </section>

      {/* ── Entrega ── */}
      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6b21a8]">Entrega</p>
          <h2 className="mt-1 text-xl font-black text-gray-950">Escolha a forma de entrega</h2>
        </div>

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
