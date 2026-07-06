'use client';

import { CheckCircle2, PackageCheck } from 'lucide-react';
import Link from 'next/link';
import type { RealOrder } from '@/types/checkout';
import { fmtCurrency } from '@/utils/formatters';

// Este componente só deve ser exibido APÓS confirmação real de pagamento
// (webhook MP retornou approved, ou polling retornou pago: true).
// Para PIX pendente, use <PixPending /> em vez deste.
export default function CheckoutSuccess({ order }: { order: RealOrder }) {
  return (
    <div className="mx-auto max-w-3xl rounded-3xl border border-line bg-surface-card p-8 text-center shadow-sm">
      <div
        className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl text-on-brand"
        style={{ background: 'var(--success-500)', boxShadow: 'var(--shadow-md)' }}
      >
        <CheckCircle2 className="h-10 w-10" strokeWidth={1.8} />
      </div>

      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-success">
        Pagamento confirmado
      </p>
      <h1 className="mt-3 font-display text-3xl font-semibold text-navy">Compra finalizada!</h1>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-ink-secondary">
        Seu pagamento foi aprovado. Você receberá um e-mail de confirmação em breve.
        Acompanhe o envio na área do cliente.
      </p>

      <div className="mt-8 rounded-2xl border border-line bg-surface-sunken p-5 text-left">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-muted">
              Número do pedido
            </p>
            <p className="mt-1 font-display text-2xl font-semibold text-navy">{order.numero}</p>
          </div>
          <div className="rounded-2xl bg-surface-card px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-muted">Total</p>
            <p className="mt-1 font-display text-xl font-semibold text-success">{fmtCurrency(order.total)}</p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-surface-card p-4">
            <p className="text-xs text-ink-muted">Cliente</p>
            <p className="mt-1 text-sm font-semibold text-ink">{order.customer.fullName}</p>
          </div>
          <div className="rounded-xl bg-surface-card p-4">
            <p className="text-xs text-ink-muted">Entrega</p>
            <p className="mt-1 text-sm font-semibold text-ink">
              {order.shipping.label}
              {order.shipping.estimate ? ` — ${order.shipping.estimate}` : ''}
            </p>
          </div>
        </div>

        {order.coupons.length > 0 && (
          <div className="mt-3 rounded-2xl bg-surface-card p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-muted">
              Cupons aplicados
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {order.coupons.map((coupon) => (
                <span
                  key={coupon.code}
                  className="rounded-full bg-success-subtle px-3 py-1 text-xs font-bold text-success"
                >
                  {coupon.code}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
        <Link
          href="/pedidos"
          className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-on-brand transition-all hover:opacity-90"
          style={{ background: 'var(--success-500)' }}
        >
          <PackageCheck className="h-4 w-4" strokeWidth={1.8} />
          Acompanhar pedido
        </Link>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full border border-line-default px-5 py-3 text-sm font-semibold text-ink-secondary transition-all hover:border-navy/30 hover:bg-navy/5 hover:text-navy"
        >
          Continuar comprando
        </Link>
      </div>
    </div>
  );
}
