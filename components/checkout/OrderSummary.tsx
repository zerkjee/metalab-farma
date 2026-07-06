'use client';

import { LockKeyhole, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { CartItem } from '@/types/cart';
import type { CouponState } from '@/types/coupon';
import type { FreteStatus } from '@/types/checkout';
import { fmtCurrency } from '@/utils/formatters';

interface OrderSummaryProps {
  formId: string;
  items: CartItem[];
  subtotal: number;
  shippingTotal: number;
  discountTotal: number;
  shippingDiscountTotal: number;
  payableShippingTotal: number;
  total: number;
  coupons: CouponState;
  freteStatus: FreteStatus;
  submitting?: boolean;
}

export default function OrderSummary({
  formId,
  items,
  subtotal,
  shippingTotal,
  discountTotal,
  shippingDiscountTotal,
  payableShippingTotal,
  total,
  coupons,
  freteStatus,
  submitting = false,
}: OrderSummaryProps) {
  const freteCalculado = freteStatus === 'done';
  return (
    <aside className="sticky top-24 rounded-2xl border border-line bg-surface-card p-5 shadow-sm">
      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-navy">Resumo</p>
        <h2 className="mt-1 font-display text-xl font-semibold text-navy">Seu pedido</h2>
      </div>

      <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
        {items.map((item) => (
          <div key={item.productId} className="flex gap-3 rounded-2xl bg-surface-sunken p-3">
            <Link
              href={`/produtos/${item.slug || item.productId}`}
              className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-surface-card"
            >
              {item.imageUrl ? (
                <Image src={item.imageUrl} alt={item.name} width={64} height={64} sizes="64px" className="h-full w-full object-contain p-2" />
              ) : (
                <ShoppingBag className="h-6 w-6 text-neutral-300" strokeWidth={1.6} />
              )}
            </Link>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 font-display text-sm font-semibold leading-snug text-navy">{item.name}</p>
              <p className="mt-1 text-xs text-ink-secondary">{item.quantity} x {fmtCurrency(item.unitPrice)}</p>
            </div>
            <p className="text-sm font-semibold text-ink">{fmtCurrency(item.unitPrice * item.quantity)}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 space-y-3 border-t border-line pt-5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-ink-secondary">Subtotal</span>
          <span className="font-semibold text-ink">{fmtCurrency(subtotal)}</span>
        </div>
        {discountTotal > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-success">Desconto {coupons.discount ? `(${coupons.discount.code})` : ''}</span>
            <span className="font-semibold text-success">- {fmtCurrency(discountTotal)}</span>
          </div>
        )}
        <div className="flex items-center justify-between text-sm">
          <span className="text-ink-secondary">Frete</span>
          {freteCalculado
            ? <span className="font-semibold text-ink">{fmtCurrency(shippingTotal)}</span>
            : <span className="text-xs font-semibold italic text-ink-muted">Informe o CEP</span>
          }
        </div>
        {freteCalculado && shippingDiscountTotal > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-success">Cupom {coupons.freeShipping?.code}</span>
            <span className="font-semibold text-success">- {fmtCurrency(shippingDiscountTotal)}</span>
          </div>
        )}
        {freteCalculado && shippingDiscountTotal > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-ink-secondary">Frete a pagar</span>
            <span className="font-semibold text-ink">{fmtCurrency(payableShippingTotal)}</span>
          </div>
        )}
        <div className="flex items-center justify-between border-t border-line pt-3">
          <span className="font-display text-base font-semibold text-navy">Total</span>
          {freteCalculado
            ? <span className="font-display text-2xl font-semibold text-navy">{fmtCurrency(total)}</span>
            : <span className="text-sm italic text-ink-muted">+ frete</span>
          }
        </div>
      </div>

      <button
        type="submit"
        form={formId}
        disabled={submitting}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-bold text-on-brand transition-all hover:bg-brand-hover active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <LockKeyhole className="h-4 w-4" strokeWidth={1.8} />
        {submitting ? 'Processando...' : 'Finalizar pedido'}
      </button>

      <p className="mt-3 text-center text-[11px] leading-5 text-ink-muted">
        Pagamento processado com segurança via Mercado Pago.
      </p>
    </aside>
  );
}
