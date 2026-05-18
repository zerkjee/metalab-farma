'use client';

import { LockKeyhole, ShoppingBag } from 'lucide-react';
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
}: OrderSummaryProps) {
  const freteCalculado = freteStatus === 'done';
  return (
    <aside className="sticky top-24 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6b21a8]">Resumo</p>
        <h2 className="mt-1 text-xl font-black text-gray-950">Seu pedido</h2>
      </div>

      <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
        {items.map((item) => (
          <div key={item.productId} className="flex gap-3 rounded-2xl bg-gray-50 p-3">
            <Link
              href={`/produtos/${item.slug || item.productId}`}
              className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-white"
            >
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name} className="h-full w-full object-contain p-2" />
              ) : (
                <ShoppingBag className="h-6 w-6 text-gray-300" strokeWidth={1.6} />
              )}
            </Link>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-black leading-snug text-gray-950">{item.name}</p>
              <p className="mt-1 text-xs text-gray-500">{item.quantity} x {fmtCurrency(item.unitPrice)}</p>
            </div>
            <p className="text-sm font-black text-gray-950">{fmtCurrency(item.unitPrice * item.quantity)}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 space-y-3 border-t border-gray-100 pt-5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Subtotal</span>
          <span className="font-bold text-gray-950">{fmtCurrency(subtotal)}</span>
        </div>
        {discountTotal > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-emerald-600">Desconto {coupons.discount ? `(${coupons.discount.code})` : ''}</span>
            <span className="font-bold text-emerald-600">- {fmtCurrency(discountTotal)}</span>
          </div>
        )}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Frete</span>
          {freteCalculado
            ? <span className="font-bold text-gray-950">{fmtCurrency(shippingTotal)}</span>
            : <span className="text-xs font-semibold text-gray-400 italic">Informe o CEP</span>
          }
        </div>
        {freteCalculado && shippingDiscountTotal > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-emerald-600">Cupom {coupons.freeShipping?.code}</span>
            <span className="font-bold text-emerald-600">- {fmtCurrency(shippingDiscountTotal)}</span>
          </div>
        )}
        {freteCalculado && shippingDiscountTotal > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Frete a pagar</span>
            <span className="font-bold text-gray-950">{fmtCurrency(payableShippingTotal)}</span>
          </div>
        )}
        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
          <span className="text-base font-black text-gray-950">Total</span>
          {freteCalculado
            ? <span className="text-2xl font-black text-[#6b21a8]">{fmtCurrency(total)}</span>
            : <span className="text-sm font-semibold text-gray-400 italic">+ frete</span>
          }
        </div>
      </div>

      <button
        type="submit"
        form={formId}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-black text-white transition-all hover:opacity-90 active:scale-[0.99]"
        style={{ background: 'linear-gradient(135deg, #6b21a8, #7c3aed)' }}
      >
        <LockKeyhole className="h-4 w-4" strokeWidth={1.8} />
        Finalizar pedido
      </button>

      <p className="mt-3 text-center text-[11px] leading-5 text-gray-400">
        Pagamento processado com segurança via Mercado Pago.
      </p>
    </aside>
  );
}
