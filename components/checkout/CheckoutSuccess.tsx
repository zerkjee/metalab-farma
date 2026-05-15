'use client';

import { CheckCircle2, Copy, PackageCheck } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import type { RealOrder } from '@/types/checkout';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export default function CheckoutSuccess({ order }: { order: RealOrder }) {
  const [copied, setCopied] = useState(false);

  function copyPix() {
    if (!order.pixQrCode) return;
    navigator.clipboard.writeText(order.pixQrCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  return (
    <div className="mx-auto max-w-3xl rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm">
      <div
        className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl text-white shadow-xl shadow-purple-200"
        style={{ background: 'linear-gradient(135deg, #6b21a8, #7c3aed)' }}
      >
        <CheckCircle2 className="h-10 w-10" strokeWidth={1.8} />
      </div>

      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6b21a8]">Pedido criado</p>
      <h1 className="mt-3 text-3xl font-black text-gray-950">Compra finalizada com sucesso</h1>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-500">
        Seu pedido foi recebido. Acompanhe o status pelo seu e-mail ou na área do cliente.
      </p>

      <div className="mt-8 rounded-2xl border border-gray-100 bg-gray-50 p-5 text-left">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Número do pedido</p>
            <p className="mt-1 text-2xl font-black text-gray-950">{order.numero}</p>
          </div>
          <div className="rounded-2xl bg-white px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Total</p>
            <p className="mt-1 text-xl font-black text-[#6b21a8]">{formatCurrency(order.total)}</p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-white p-4">
            <p className="text-xs text-gray-400">Cliente</p>
            <p className="mt-1 text-sm font-bold text-gray-950">{order.customer.fullName}</p>
          </div>
          <div className="rounded-xl bg-white p-4">
            <p className="text-xs text-gray-400">Entrega</p>
            <p className="mt-1 text-sm font-bold text-gray-950">{order.shipping.label} — {order.shipping.estimate}</p>
          </div>
        </div>

        {order.coupons.length > 0 && (
          <div className="mt-3 rounded-2xl bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Cupons aplicados</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {order.coupons.map((coupon) => (
                <span key={coupon.code} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                  {coupon.code}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {order.metodoPagamento === 'PIX' && order.pixQrCode && (
        <div className="mt-6 rounded-2xl border border-purple-100 bg-purple-50 p-5 text-left">
          <p className="text-sm font-black text-gray-950">Pague com Pix</p>
          <p className="mt-1 text-xs leading-5 text-gray-500">
            Escaneie o QR Code ou copie o código Pix para pagar. O pedido será confirmado automaticamente após o pagamento.
          </p>

          {order.pixQrCodeBase64 && (
            <div className="mt-4 flex justify-center">
              <img
                src={`data:image/png;base64,${order.pixQrCodeBase64}`}
                alt="QR Code Pix"
                className="h-48 w-48 rounded-xl border border-purple-200 bg-white p-2"
              />
            </div>
          )}

          <div className="mt-4 flex items-center gap-2 rounded-xl border border-purple-200 bg-white px-3 py-3">
            <p className="flex-1 truncate text-xs font-mono text-gray-700">{order.pixQrCode}</p>
            <button
              onClick={copyPix}
              className="flex-shrink-0 rounded-lg bg-[#6b21a8] p-1.5 text-white transition-all hover:opacity-90"
              title="Copiar código Pix"
            >
              <Copy className="h-4 w-4" strokeWidth={1.8} />
            </button>
          </div>
          {copied && (
            <p className="mt-2 text-center text-xs font-semibold text-emerald-600">Código copiado!</p>
          )}
        </div>
      )}

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
          href="/pedidos"
          className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-5 py-3 text-sm font-bold text-gray-600 transition-all hover:border-[#6b21a8]/30 hover:bg-[#6b21a8]/5 hover:text-[#6b21a8]"
        >
          Meus pedidos
        </Link>
      </div>
    </div>
  );
}
