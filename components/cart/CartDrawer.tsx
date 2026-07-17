'use client';

import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { IconButton } from '@/components/ui';
import { useCart } from '@/context/CartContext';
import { maxPurchasableUnits, MAX_UNITS_PER_PRODUCT } from '@/lib/volume-pricing';
import { fmtCurrency as formatCurrency } from '@/utils/formatters';
import ProductImage from '@/components/ProductImage';

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
    if (!isOpen) return;
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.overflowY = 'scroll';
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflowY = '';
      window.scrollTo(0, scrollY);
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
        data-testid="cart-backdrop"
        className={`fixed inset-0 z-[70] bg-[var(--surface-overlay)] backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={closeCart}
        aria-hidden="true"
      />

      <aside
        className={`fixed right-0 top-0 z-[80] flex h-dvh w-full max-w-md flex-col bg-surface-card transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ boxShadow: 'var(--shadow-lg)' }}
        aria-label="Carrinho de compras"
        aria-hidden={!isOpen}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-navy">Sua compra</p>
            <h2 className="mt-1 font-display text-xl font-semibold text-navy">Carrinho</h2>
          </div>
          <IconButton onClick={closeCart} aria-label="Fechar carrinho" variant="ghost">
            <X className="h-5 w-5" strokeWidth={1.8} />
          </IconButton>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 text-navy">
              <ShoppingBag className="h-8 w-8" strokeWidth={1.7} />
            </div>
            <p className="font-display text-lg font-semibold text-navy">Seu carrinho está vazio</p>
            <p className="mt-2 text-sm leading-6 text-ink-secondary">
              Adicione produtos do catálogo para iniciar seu pedido.
            </p>
            <button
              onClick={closeCart}
              className="mt-6 rounded-full bg-brand px-5 py-3 text-sm font-bold text-on-brand transition-all hover:bg-brand-hover"
            >
              Ver produtos
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-5">
              <div className="flex flex-col gap-4">
                {items.map((item) => (
                  <div key={item.productId} className="rounded-2xl border border-line bg-surface-sunken p-4">
                    <div className="flex gap-4">
                      <Link
                        href={`/produtos/${item.slug || item.productId}`}
                        onClick={closeCart}
                        className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-xl bg-surface-card p-2"
                      >
                        {item.imageUrl ? (
                          <ProductImage
                            src={item.imageUrl}
                            alt={item.name}
                            sizes="80px"
                            frameClassName="h-full w-full"
                          />
                        ) : (
                          <ShoppingBag className="h-7 w-7 text-neutral-300" strokeWidth={1.5} />
                        )}
                      </Link>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-wide text-ink-muted">{item.brand}</p>
                            <Link
                              href={`/produtos/${item.slug || item.productId}`}
                              onClick={closeCart}
                              className="mt-1 line-clamp-2 font-display text-sm font-semibold leading-snug text-navy hover:text-brand-700"
                            >
                              {item.name}
                            </Link>
                          </div>
                          <button
                            onClick={() => removeItem(item.productId)}
                            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-ink-muted transition-all hover:bg-danger-subtle hover:text-danger"
                            aria-label={`Remover ${item.name}`}
                          >
                            <Trash2 className="h-4 w-4" strokeWidth={1.8} />
                          </button>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-3">
                          <div className="inline-flex items-center rounded-full border border-line-default bg-surface-card">
                            <button
                              onClick={() => decreaseItem(item.productId)}
                              className="flex h-9 w-9 items-center justify-center text-ink-secondary transition-colors hover:text-navy"
                              aria-label={`Diminuir quantidade de ${item.name}`}
                            >
                              <Minus className="h-4 w-4" strokeWidth={2} />
                            </button>
                            <span className="min-w-8 text-center text-sm font-semibold text-navy">{item.quantity}</span>
                            <button
                              onClick={() => increaseItem(item.productId)}
                              disabled={item.quantity >= maxPurchasableUnits(item.stock)}
                              className="flex h-9 w-9 items-center justify-center text-ink-secondary transition-colors hover:text-navy disabled:cursor-not-allowed disabled:opacity-35"
                              aria-label={`Aumentar quantidade de ${item.name}`}
                            >
                              <Plus className="h-4 w-4" strokeWidth={2} />
                            </button>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-ink">{formatCurrency(item.unitPrice * item.quantity)}</p>
                            {item.volumeDiscountPercent > 0 ? (
                              <>
                                <p className="text-[10px] text-success">
                                  -{item.volumeDiscountPercent}% por quantidade
                                </p>
                                <p className="text-[10px] text-ink-muted">
                                  <span className="line-through">{formatCurrency(item.baseUnitPrice)}</span>{' '}
                                  {formatCurrency(item.unitPrice)} cada
                                </p>
                              </>
                            ) : (
                              <p className="text-[10px] text-ink-muted">{formatCurrency(item.unitPrice)} cada</p>
                            )}
                          </div>
                        </div>
                        {item.quantity >= MAX_UNITS_PER_PRODUCT && (
                          <p className="mt-1.5 text-[10px] text-ink-muted">Máx. {MAX_UNITS_PER_PRODUCT} unidades por pedido</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-line bg-surface-card px-5 py-5">
              <div className="mb-4 rounded-2xl border border-dashed border-brand/40 bg-brand-subtle p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-navy">Cupons</p>
                <p className="mt-1 text-sm text-ink-secondary">
                  Use 1 cupom de desconto + 1 cupom de frete grátis.
                </p>
                <div className="mt-3 flex gap-2">
                  <input
                    value={couponCode}
                    onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                    placeholder="PRIMEIRA30"
                    disabled={isApplyingCoupon}
                    className="min-w-0 flex-1 rounded-xl border border-brand/40 bg-surface-card px-3 py-2 text-xs font-bold uppercase tracking-wide text-ink outline-none placeholder:text-ink-muted focus:border-brand disabled:opacity-60"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={isApplyingCoupon || !couponCode.trim()}
                    className="flex min-w-[60px] items-center justify-center rounded-full bg-brand px-3 py-2 text-xs font-bold text-on-brand transition-all hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
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
                    couponMessage.type === 'success' ? 'text-success' : 'text-danger'
                  }`}>
                    {couponMessage.text}
                  </p>
                )}
                {(coupons.discount || coupons.freeShipping) && (
                  <div className="mt-3 flex flex-col gap-2">
                    {coupons.discount && (
                      <div className="flex items-center justify-between rounded-xl bg-surface-card px-3 py-2 text-xs">
                        <span className="font-semibold text-ink">{coupons.discount.code}</span>
                        <button onClick={() => removeCoupon('discount')} className="font-bold text-danger hover:opacity-80">
                          Remover
                        </button>
                      </div>
                    )}
                    {coupons.freeShipping && (
                      <div className="flex items-center justify-between rounded-xl bg-surface-card px-3 py-2 text-xs">
                        <span className="font-semibold text-ink">{coupons.freeShipping.code}</span>
                        <button onClick={() => removeCoupon('free_shipping')} className="font-bold text-danger hover:opacity-80">
                          Remover
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink-secondary">Itens</span>
                  <span className="font-semibold text-ink">{totals.itemCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink-secondary">Subtotal</span>
                  <span className="font-semibold text-ink">{formatCurrency(totals.itemsSubtotal)}</span>
                </div>
                {totals.volumeDiscountTotal > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-success">Desconto por quantidade</span>
                    <span className="font-semibold text-success">- {formatCurrency(totals.volumeDiscountTotal)}</span>
                  </div>
                )}
                {totals.discountTotal > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-success">Desconto</span>
                    <span className="font-semibold text-success">- {formatCurrency(totals.discountTotal)}</span>
                  </div>
                )}
                {coupons.freeShipping && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-success">Frete grátis</span>
                    <span className="font-semibold text-success">Aplicado no checkout</span>
                  </div>
                )}
                <div className="flex items-center justify-between border-t border-line pt-3">
                  <span className="text-base font-semibold text-navy">Total parcial</span>
                  <span className="font-display text-2xl font-semibold text-navy">{formatCurrency(totals.total)}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                onClick={closeCart}
                className="mt-5 block w-full rounded-full bg-brand px-5 py-3 text-center text-sm font-bold text-on-brand transition-all hover:bg-brand-hover active:scale-[0.99]"
              >
                Continuar para checkout
              </Link>
              <p className="mt-3 text-center text-[11px] text-ink-muted">
                Pagamento seguro via Mercado Pago.
              </p>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
