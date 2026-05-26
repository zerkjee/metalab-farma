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
    <div className="mx-auto max-w-3xl rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm">
      <div
        className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl text-white shadow-xl shadow-emerald-200"
        style={{ background: 'linear-gradient(135deg, #065f46, #059669)' }}
      >
        <CheckCircle2 className="h-10 w-10" strokeWidth={1.8} />
      </div>

      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
        Pagamento confirmado
      </p>
      <h1 className="mt-3 text-3xl font-black text-gray-950">Compra finalizada!</h1>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-500">
        Seu pagamento foi aprovado. Você receberá um e-mail de confirmação em breve.
        Acompanhe o envio na área do cliente.
      </p>

      <div className="mt-8 rounded-2xl border border-gray-100 bg-gray-50 p-5 text-left">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
              Número do pedido
            </p>
            <p className="mt-1 text-2xl font-black text-gray-950">{order.numero}</p>
          </div>
          <div className="rounded-2xl bg-white px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Total</p>
            <p className="mt-1 text-xl font-black text-emerald-700">{fmtCurrency(order.total)}</p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-white p-4">
            <p className="text-xs text-gray-400">Cliente</p>
            <p className="mt-1 text-sm font-bold text-gray-950">{order.customer.fullName}</p>
          </div>
          <div className="rounded-xl bg-white p-4">
            <p className="text-xs text-gray-400">Entrega</p>
            <p className="mt-1 text-sm font-bold text-gray-950">
              {order.shipping.label}
              {order.shipping.estimate ? ` — ${order.shipping.estimate}` : ''}
            </p>
          </div>
        </div>

        {order.coupons.length > 0 && (
          <div className="mt-3 rounded-2xl bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
              Cupons aplicados
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {order.coupons.map((coupon) => (
                <span
                  key={coupon.code}
                  className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700"
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
          className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-black text-white transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #065f46, #059669)' }}
        >
          <PackageCheck className="h-4 w-4" strokeWidth={1.8} />
          Acompanhar pedido
        </Link>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-5 py-3 text-sm font-bold text-gray-600 transition-all hover:border-[#0f2756]/30 hover:bg-[#0f2756]/5 hover:text-[#0f2756]"
        >
          Continuar comprando
        </Link>
      </div>
    </div>
  );
}
