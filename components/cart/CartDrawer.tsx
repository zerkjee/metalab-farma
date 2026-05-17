'use client';

import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useCart } from '@/context/CartContext';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export default function CartDrawer() {
  const [couponCode, setCouponCode] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const {
    items,
    coupons,
    totals,
    isOpen,
    closeCart,
    increaseItem,
    decreaseItem,
    removeItem,
    applyCoupon,
    removeCoupon,
  } = useCart();

  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.overflowY = 'scroll';
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflowY = '';
      if (scrollY) window.scrollTo(0, parseInt(scrollY) * -1);
    }
    return () => {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflowY = '';
      if (scrollY) window.scrollTo(0, parseInt(scrollY) * -1);
    };
  }, [isOpen]);

  async function handleApplyCoupon() {
    if (!couponCode.trim() || isApplyingCoupon) return;
    setIsApplyingCoupon(true);
    setCouponMessage(null);
    try {
      const result = await applyCoupon(couponCode);
      setCouponMessage({ type: result.ok ? 'success' : 'error', text: result.message });
      if (result.ok) setCouponCode('');
    } finally {
      setIsApplyingCoupon(false);
    }
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-[70] bg-slate-950/45 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={closeCart}
        aria-hidden="true"
      />

      <aside
        className={`fixed right-0 top-0 z-[80] flex h-dvh w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-label="Carrinho de compras"
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6b21a8]">Sua compra</p>
            <h2 className="mt-1 text-xl font-black text-gray-950">Carrinho</h2>
          </div>
          <button
            onClick={closeCart}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-all hover:border-[#6b21a8]/30 hover:bg-[#6b21a8]/5 hover:text-[#6b21a8]"
            aria-label="Fechar carrinho"
          >
            <X className="h-5 w-5" strokeWidth={1.8} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#6b21a8]/10 text-[#6b21a8]">
              <ShoppingBag className="h-8 w-8" strokeWidth={1.7} />
            </div>
            <p className="text-lg font-black text-gray-950">Seu carrinho está vazio</p>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Adicione produtos do catálogo para iniciar seu pedido.
            </p>
            <button
              onClick={closeCart}
              className="mt-6 rounded-xl px-5 py-3 text-sm font-bold text-white transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #6b21a8, #7c3aed)' }}
            >
              Ver produtos
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-5">
              <div className="flex flex-col gap-4">
                {items.map((item) => (
                  <div key={item.productId} className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
                    <div className="flex gap-4">
                      <Link
                        href={`/produtos/${item.productId}`}
                        onClick={closeCart}
                        className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-xl bg-white"
                      >
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="h-full w-full object-contain p-2"
                          />
                        ) : (
                          <ShoppingBag className="h-7 w-7 text-gray-300" strokeWidth={1.5} />
                        )}
                      </Link>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">{item.brand}</p>
                            <Link
                              href={`/produtos/${item.productId}`}
                              onClick={closeCart}
                              className="mt-1 line-clamp-2 text-sm font-black leading-snug text-gray-950 hover:text-[#6b21a8]"
                            >
                              {item.name}
                            </Link>
                          </div>
                          <button
                            onClick={() => removeItem(item.productId)}
                            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-gray-400 transition-all hover:bg-red-50 hover:text-red-500"
                            aria-label={`Remover ${item.name}`}
                          >
                            <Trash2 className="h-4 w-4" strokeWidth={1.8} />
                          </button>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-3">
                          <div className="inline-flex items-center rounded-xl border border-gray-200 bg-white">
                            <button
                              onClick={() => decreaseItem(item.productId)}
                              className="flex h-9 w-9 items-center justify-center text-gray-500 transition-colors hover:text-[#6b21a8]"
                              aria-label={`Diminuir quantidade de ${item.name}`}
                            >
                              <Minus className="h-4 w-4" strokeWidth={2} />
                            </button>
                            <span className="min-w-8 text-center text-sm font-black text-gray-950">{item.quantity}</span>
                            <button
                              onClick={() => increaseItem(item.productId)}
                              disabled={item.quantity >= item.stock}
                              className="flex h-9 w-9 items-center justify-center text-gray-500 transition-colors hover:text-[#6b21a8] disabled:cursor-not-allowed disabled:opacity-35"
                              aria-label={`Aumentar quantidade de ${item.name}`}
                            >
                              <Plus className="h-4 w-4" strokeWidth={2} />
                            </button>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-black text-gray-950">{formatCurrency(item.unitPrice * item.quantity)}</p>
                            <p className="text-[10px] text-gray-400">{formatCurrency(item.unitPrice)} cada</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-100 bg-white px-5 py-5">
              <div className="mb-4 rounded-2xl border border-dashed border-[#6b21a8]/30 bg-[#6b21a8]/5 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6b21a8]">Cupons</p>
                <p className="mt-1 text-sm text-gray-600">
                  Use 1 cupom de desconto + 1 cupom de frete grátis.
                </p>
                <div className="mt-3 flex gap-2">
                  <input
                    value={couponCode}
                    onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                    placeholder="PRIMEIRA30"
                    disabled={isApplyingCoupon}
                    className="min-w-0 flex-1 rounded-xl border border-purple-200 bg-white px-3 py-2 text-xs font-bold uppercase tracking-wide text-gray-950 outline-none placeholder:text-gray-400 focus:border-[#6b21a8] disabled:opacity-60"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={isApplyingCoupon || !couponCode.trim()}
                    className="rounded-xl bg-[#6b21a8] px-3 py-2 text-xs font-black text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 min-w-[60px] flex items-center justify-center"
                  >
                    {isApplyingCoupon ? (
                      <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : 'Aplicar'}
                  </button>
                </div>
                {couponMessage && (
                  <p className={`mt-2 text-xs font-semibold ${
                    couponMessage.type === 'success' ? 'text-emerald-600' : 'text-red-500'
                  }`}>
                    {couponMessage.text}
                  </p>
                )}
                {(coupons.discount || coupons.freeShipping) && (
                  <div className="mt-3 flex flex-col gap-2">
                    {coupons.discount && (
                      <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-xs">
                        <span className="font-bold text-gray-700">{coupons.discount.code}</span>
                        <button onClick={() => removeCoupon('discount')} className="font-bold text-red-500 hover:text-red-600">
                          Remover
                        </button>
                      </div>
                    )}
                    {coupons.freeShipping && (
                      <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-xs">
                        <span className="font-bold text-gray-700">{coupons.freeShipping.code}</span>
                        <button onClick={() => removeCoupon('free_shipping')} className="font-bold text-red-500 hover:text-red-600">
                          Remover
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Itens</span>
                  <span className="font-bold text-gray-950">{totals.itemCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-bold text-gray-950">{formatCurrency(totals.subtotal)}</span>
                </div>
                {totals.discountTotal > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-emerald-600">Desconto</span>
                    <span className="font-bold text-emerald-600">- {formatCurrency(totals.discountTotal)}</span>
                  </div>
                )}
                {coupons.freeShipping && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-emerald-600">Frete grátis</span>
                    <span className="font-bold text-emerald-600">Aplicado no checkout</span>
                  </div>
                )}
                <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                  <span className="text-base font-bold text-gray-950">Total parcial</span>
                  <span className="text-2xl font-black text-[#6b21a8]">{formatCurrency(totals.total)}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                onClick={closeCart}
                className="mt-5 block w-full rounded-xl px-5 py-3 text-center text-sm font-black text-white transition-all hover:opacity-90 active:scale-[0.99]"
                style={{ background: 'linear-gradient(135deg, #6b21a8, #7c3aed)' }}
              >
                Continuar para checkout
              </Link>
              <p className="mt-3 text-center text-[11px] text-gray-400">
                Pagamento seguro via Mercado Pago.
              </p>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
