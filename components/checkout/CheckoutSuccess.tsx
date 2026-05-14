'use client';

import { CheckCircle2, PackageCheck } from 'lucide-react';
import Link from 'next/link';
import type { MockOrder } from '@/types/checkout';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export default function CheckoutSuccess({ order }: { order: MockOrder }) {
  return (
    <div className="mx-auto max-w-3xl rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm">
      <div
        className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl text-white shadow-xl shadow-purple-200"
        style={{ background: 'linear-gradient(135deg, #6b21a8, #7c3aed)' }}
      >
        <CheckCircle2 className="h-10 w-10" strokeWidth={1.8} />
      </div>

      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6b21a8]">Pedido mockado criado</p>
      <h1 className="mt-3 text-3xl font-black text-gray-950">Compra finalizada com sucesso</h1>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-500">
        Este e um pedido de demonstracao. Na etapa de backend, esse mesmo payload pode virar um pedido real no banco.
      </p>

      <div className="mt-8 rounded-2xl border border-gray-100 bg-gray-50 p-5 text-left">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Numero do pedido</p>
            <p className="mt-1 text-2xl font-black text-gray-950">{order.id}</p>
          </div>
          <div className="rounded-2xl bg-white px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Total</p>
            <p className="mt-1 text-xl font-black text-[#6b21a8]">{formatCurrency(order.total)}</p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-white p-4">
            <p className="text-xs text-gray-400">Cliente</p>
            <p className="mt-1 text-sm font-bold text-gray-950">{order.customer.fullName}</p>
          </div>
          <div className="rounded-xl bg-white p-4">
            <p className="text-xs text-gray-400">Entrega</p>
            <p className="mt-1 text-sm font-bold text-gray-950">{order.shipping.label}</p>
          </div>
          <div className="rounded-xl bg-white p-4">
            <p className="text-xs text-gray-400">Pagamento</p>
            <p className="mt-1 text-sm font-bold text-gray-950">{order.payment.label}</p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Resumo financeiro</p>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-bold text-gray-950">{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Desconto</span>
              <span className="font-bold text-emerald-600">- {formatCurrency(order.discountTotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Frete</span>
              <span className="font-bold text-gray-950">{formatCurrency(order.shippingTotal)}</span>
            </div>
            {order.shippingDiscountTotal > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Desconto no frete</span>
                <span className="font-bold text-emerald-600">- {formatCurrency(order.shippingDiscountTotal)}</span>
              </div>
            )}
            <div className="flex items-center justify-between border-t border-gray-100 pt-2">
              <span className="font-black text-gray-950">Total</span>
              <span className="text-lg font-black text-[#6b21a8]">{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>

        <div className="mt-3 rounded-2xl bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Cupons usados</p>
          {order.coupons.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {order.coupons.map((coupon) => (
                <span key={coupon.id} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                  {coupon.code}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-gray-500">Nenhum cupom aplicado.</p>
          )}
        </div>
      </div>

      <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-black text-white transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #6b21a8, #7c3aed)' }}
        >
          <PackageCheck className="h-4 w-4" strokeWidth={1.8} />
          Voltar para loja
        </Link>
        <Link
          href="/admin/pedidos"
          className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-5 py-3 text-sm font-bold text-gray-600 transition-all hover:border-[#6b21a8]/30 hover:bg-[#6b21a8]/5 hover:text-[#6b21a8]"
        >
          Ver painel de pedidos
        </Link>
      </div>
    </div>
  );
}
