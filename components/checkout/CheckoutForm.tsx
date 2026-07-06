'use client';

import { useCallback } from 'react';
import { fmtCurrency } from '@/utils/formatters';
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

// Estilo visual equivalente ao componente <Input /> do design system, mas em
// <input> nativo — necessário para preservar required/inputMode/maxLength que
// o componente da lib ainda não repassa via props.
const inputCls = 'w-full rounded-xl border border-line-default bg-surface-sunken px-3 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-muted focus:border-brand focus:bg-surface-card focus:ring-2 focus:ring-brand-100';

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
      <section className="rounded-2xl border border-line bg-surface-card p-5 shadow-sm">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-navy">Dados do cliente</p>
          <h2 className="mt-1 font-display text-xl font-semibold text-navy">Identificação</h2>
        </div>

        {logado ? (
          /* Logado: exibe dados do perfil somente-leitura */
          <div className="grid gap-3 md:grid-cols-2">
            <div className="md:col-span-2 rounded-xl bg-surface-sunken px-4 py-3">
              <p className="text-xs font-semibold text-ink-muted">Nome completo</p>
              <p className="mt-0.5 text-sm font-semibold text-ink">{values.fullName}</p>
            </div>
            <div className="rounded-xl bg-surface-sunken px-4 py-3">
              <p className="text-xs font-semibold text-ink-muted">E-mail</p>
              <p className="mt-0.5 text-sm font-semibold text-ink">{values.email}</p>
            </div>
            <div className="rounded-xl bg-surface-sunken px-4 py-3">
              <p className="text-xs font-semibold text-ink-muted">CPF</p>
              <p className="mt-0.5 text-sm font-semibold text-ink">{values.cpf}</p>
            </div>
            <div className="rounded-xl bg-surface-sunken px-4 py-3">
              <p className="text-xs font-semibold text-ink-muted">Telefone</p>
              <p className="mt-0.5 text-sm font-semibold text-ink">{values.phone || '—'}</p>
            </div>
          </div>
        ) : (
          /* Não logado: formulário completo */
          <div className="grid gap-4 md:grid-cols-2">
            <label className="md:col-span-2">
              <span className="mb-1 block text-xs font-semibold text-ink-secondary">Nome completo</span>
              <input value={values.fullName} onChange={(e) => onChange('fullName', e.target.value)} placeholder="Maria Silva" required className={inputCls} />
            </label>
            <label>
              <span className="mb-1 block text-xs font-semibold text-ink-secondary">E-mail</span>
              <input type="email" value={values.email} onChange={(e) => onChange('email', e.target.value)} placeholder="maria@email.com" required className={inputCls} />
            </label>
            <label>
              <span className="mb-1 block text-xs font-semibold text-ink-secondary">Telefone</span>
              <input type="tel" value={values.phone} onChange={(e) => onChange('phone', phoneMask(e.target.value))} placeholder="(11) 99999-9999" inputMode="numeric" required className={inputCls} />
            </label>
            <label>
              <span className="mb-1 block text-xs font-semibold text-ink-secondary">CPF</span>
              <input value={values.cpf} onChange={(e) => onChange('cpf', cpfMask(e.target.value))} placeholder="000.000.000-00" inputMode="numeric" required className={inputCls} />
            </label>
          </div>
        )}
      </section>

      {/* ── Endereço de entrega ── */}
      <section className="rounded-2xl border border-line bg-surface-card p-5 shadow-sm">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-navy">Entrega</p>
          <h2 className="mt-1 font-display text-xl font-semibold text-navy">Endereço de entrega</h2>
        </div>

        {temEnderecoSalvo && (
          <div className="mb-5 flex gap-2">
            {(['salvo', 'novo'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => onEnderecoModeChange(mode)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                  enderecoMode === mode
                    ? 'bg-brand text-on-brand'
                    : 'bg-neutral-100 text-ink-secondary hover:bg-neutral-200'
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
            <div className="md:col-span-2 rounded-xl bg-surface-sunken px-4 py-3">
              <p className="text-xs font-semibold text-ink-muted">Logradouro</p>
              <p className="mt-0.5 text-sm font-semibold text-ink">{values.address}, {values.number}{values.complement ? ` — ${values.complement}` : ''}</p>
            </div>
            <div className="rounded-xl bg-surface-sunken px-4 py-3">
              <p className="text-xs font-semibold text-ink-muted">Bairro / Cidade</p>
              <p className="mt-0.5 text-sm font-semibold text-ink">{values.district}, {values.city} — {values.state}</p>
            </div>
            <div className="rounded-xl bg-surface-sunken px-4 py-3">
              <p className="text-xs font-semibold text-ink-muted">CEP</p>
              <p className="mt-0.5 text-sm font-semibold text-ink">{values.zipCode}</p>
            </div>
          </div>
        ) : (
          /* Formulário de endereço */
          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <span className="mb-1 block text-xs font-semibold text-ink-secondary">CEP</span>
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
              <span className="mb-1 block text-xs font-semibold text-ink-secondary">Endereço</span>
              <input value={values.address} onChange={(e) => onChange('address', e.target.value)} placeholder="Rua das Fórmulas" required className={inputCls} />
            </label>
            <label>
              <span className="mb-1 block text-xs font-semibold text-ink-secondary">Número</span>
              <input value={values.number} onChange={(e) => onChange('number', e.target.value)} placeholder="120" required className={inputCls} />
            </label>
            <label>
              <span className="mb-1 block text-xs font-semibold text-ink-secondary">Complemento</span>
              <input value={values.complement} onChange={(e) => onChange('complement', e.target.value)} placeholder="Apto 402" className={inputCls} />
            </label>
            <label>
              <span className="mb-1 block text-xs font-semibold text-ink-secondary">Bairro</span>
              <input value={values.district} onChange={(e) => onChange('district', e.target.value)} placeholder="Centro" required className={inputCls} />
            </label>
            <label>
              <span className="mb-1 block text-xs font-semibold text-ink-secondary">Cidade</span>
              <input value={values.city} onChange={(e) => onChange('city', e.target.value)} placeholder="São Paulo" required className={inputCls} />
            </label>
            <label>
              <span className="mb-1 block text-xs font-semibold text-ink-secondary">Estado</span>
              <input value={values.state} onChange={(e) => onChange('state', e.target.value.toUpperCase().slice(0, 2))} placeholder="SP" maxLength={2} required className={inputCls} />
            </label>
          </div>
        )}
      </section>

      {/* ── Entrega ── */}
      <section className="rounded-2xl border border-line bg-surface-card p-5 shadow-sm">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-navy">Entrega</p>
          <h2 className="mt-1 font-display text-xl font-semibold text-navy">Escolha a forma de entrega</h2>
        </div>

        {freteStatus === 'idle' && (
          <p className="rounded-xl border border-line bg-surface-sunken px-4 py-4 text-sm text-ink-muted">
            Informe o CEP acima para calcular o frete.
          </p>
        )}

        {freteStatus === 'loading' && (
          <div className="flex items-center gap-3 rounded-xl border border-line bg-surface-sunken px-4 py-4">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-navy border-t-transparent" />
            <p className="text-sm text-ink-secondary">Calculando frete...</p>
          </div>
        )}

        {freteStatus === 'error' && (
          <p className="rounded-xl border border-danger/20 bg-danger-subtle px-4 py-4 text-sm text-danger">
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
                      ? 'border-brand bg-brand-subtle shadow-sm'
                      : 'border-line-default bg-surface-sunken hover:border-brand/40 hover:bg-surface-card'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ink">{method.label}</p>
                      <p className="mt-1 text-sm leading-5 text-ink-secondary">{method.description}</p>
                      <p className="mt-2 text-xs font-semibold text-ink-muted">{method.estimate}</p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-navy">{fmtCurrency(method.price)}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Pagamento ── */}
      <section className="rounded-2xl border border-line bg-surface-card p-5 shadow-sm">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-navy">Pagamento</p>
          <h2 className="mt-1 font-display text-xl font-semibold text-navy">Como você quer pagar?</h2>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {paymentMethods.map((method) => {
            const active = method.id === selectedPaymentId;
            const disabled = method.disabled ?? false;
            return (
              <button
                key={method.id}
                type="button"
                disabled={disabled}
                onClick={() => !disabled && onPaymentChange(method.id)}
                className={`rounded-2xl border p-4 text-left transition-all ${
                  disabled
                    ? 'cursor-not-allowed border-line bg-surface-sunken opacity-50'
                    : active
                    ? 'border-brand bg-brand-subtle shadow-sm'
                    : 'border-line-default bg-surface-sunken hover:border-brand/40 hover:bg-surface-card'
                }`}
              >
                <div className="flex items-start justify-between gap-1">
                  <p className="font-semibold text-ink">{method.label}</p>
                  {disabled && (
                    <span className="shrink-0 rounded-full bg-neutral-200 px-2 py-0.5 text-[10px] font-bold text-ink-secondary">
                      Em breve
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm leading-5 text-ink-secondary">{method.description}</p>
              </button>
            );
          })}
        </div>
      </section>
    </form>
  );
}
