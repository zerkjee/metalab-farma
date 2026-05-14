'use client';

import { ArrowLeft, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import CheckoutForm from '@/components/checkout/CheckoutForm';
import CheckoutSuccess from '@/components/checkout/CheckoutSuccess';
import OrderSummary from '@/components/checkout/OrderSummary';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { calculateCartTotals } from '@/services/cartTotals';
import { createMockOrder } from '@/services/orders';
import type {
  CheckoutForm as CheckoutFormValues,
  MockOrder,
  PaymentMethod,
  PaymentMethodId,
  ShippingMethod,
  ShippingMethodId,
} from '@/types/checkout';

const initialForm: CheckoutFormValues = {
  fullName: '',
  email: '',
  phone: '',
  cpf: '',
  zipCode: '',
  address: '',
  number: '',
  complement: '',
  district: '',
  city: '',
  state: '',
};

const checkoutFormId = 'metalab-checkout-form';

const shippingMethods: ShippingMethod[] = [
  {
    id: 'standard',
    label: 'Entrega padrao',
    description: 'Envio nacional mockado com rastreio.',
    price: 19.9,
    estimate: '5 a 8 dias uteis',
  },
  {
    id: 'express',
    label: 'Entrega expressa',
    description: 'Prioridade na separacao e no envio.',
    price: 34.9,
    estimate: '2 a 4 dias uteis',
  },
];

const paymentMethods: PaymentMethod[] = [
  {
    id: 'pix',
    label: 'Pix',
    description: 'Confirmacao mockada instantanea.',
  },
  {
    id: 'card',
    label: 'Cartao',
    description: 'Pagamento visual sem transacao real.',
  },
  {
    id: 'boleto',
    label: 'Boleto',
    description: 'Boleto demonstrativo para pedido mockado.',
  },
];

export default function CheckoutPage() {
  const {
    items,
    coupons,
    hydrated,
    applyCoupon,
    removeCoupon,
    clearCart,
  } = useCart();
  const [form, setForm] = useState<CheckoutFormValues>(initialForm);
  const [couponCode, setCouponCode] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedShippingId, setSelectedShippingId] = useState<ShippingMethodId>('standard');
  const [selectedPaymentId, setSelectedPaymentId] = useState<PaymentMethodId>('pix');
  const [order, setOrder] = useState<MockOrder | null>(null);

  const selectedShipping = useMemo(
    () => shippingMethods.find((method) => method.id === selectedShippingId) ?? shippingMethods[0],
    [selectedShippingId],
  );
  const selectedPayment = useMemo(
    () => paymentMethods.find((method) => method.id === selectedPaymentId) ?? paymentMethods[0],
    [selectedPaymentId],
  );
  const totals = useMemo(() => calculateCartTotals({
    items,
    coupons,
    shippingPrice: selectedShipping.price,
  }), [coupons, items, selectedShipping.price]);
  const appliedCoupons = useMemo(
    () => [coupons.discount, coupons.freeShipping].filter((coupon) => coupon !== null),
    [coupons.discount, coupons.freeShipping],
  );

  function updateForm<K extends keyof CheckoutFormValues>(key: K, value: CheckoutFormValues[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function finishOrder() {
    const mockOrder = createMockOrder({
      customer: form,
      items,
      shipping: selectedShipping,
      payment: selectedPayment,
      subtotal: totals.subtotal,
      discountTotal: totals.discountTotal,
      shippingDiscountTotal: totals.shippingDiscountTotal,
      payableShippingTotal: totals.payableShippingTotal,
      total: totals.total,
      coupons: appliedCoupons,
    });

    setOrder(mockOrder);
    clearCart();
  }

  function handleApplyCoupon() {
    const result = applyCoupon(couponCode);
    setCouponMessage({ type: result.ok ? 'success' : 'error', text: result.message });
    if (result.ok) {
      setCouponCode('');
    }
  }

  if (order) {
    return (
      <>
        <Header />
        <main className="bg-[#fafafa] px-4 py-14 sm:px-6 lg:px-8">
          <CheckoutSuccess order={order} />
        </main>
        <Footer />
      </>
    );
  }

  if (!hydrated) {
    return (
      <>
        <Header />
        <main className="flex min-h-[60vh] items-center justify-center bg-[#fafafa] px-4">
          <div className="h-12 w-12 animate-pulse rounded-2xl bg-[#6b21a8]/20" />
        </main>
        <Footer />
      </>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <Header />
        <main className="bg-[#fafafa] px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#6b21a8]/10 text-[#6b21a8]">
              <ShoppingBag className="h-8 w-8" strokeWidth={1.7} />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6b21a8]">Checkout</p>
            <h1 className="mt-3 text-3xl font-black text-gray-950">Seu carrinho esta vazio</h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500">
              Adicione produtos ao carrinho antes de iniciar o checkout mockado.
            </p>
            <Link
              href="/#produtos"
              className="mt-7 inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-black text-white transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #6b21a8, #7c3aed)' }}
            >
              Voltar para loja
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="bg-[#fafafa]">
        <section className="border-b border-gray-100 bg-white px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-4">
            <Link href="/#produtos" className="inline-flex items-center gap-2 self-start text-sm font-bold text-gray-500 transition-colors hover:text-[#6b21a8]">
              <ArrowLeft className="h-4 w-4" strokeWidth={1.8} />
              Continuar comprando
            </Link>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6b21a8]">Checkout mockado</p>
              <h1 className="mt-2 text-3xl font-black text-gray-950 sm:text-4xl">Finalize seu pedido</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
                Fluxo visual conectado ao carrinho. Nenhum pagamento real sera processado nesta etapa.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:px-8">
          <div className="flex flex-col gap-6">
            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6b21a8]">Cupons</p>
                <h2 className="mt-1 text-xl font-black text-gray-950">Aplique seus beneficios</h2>
                <p className="mt-1 text-sm text-gray-500">Permitido 1 cupom de desconto + 1 cupom de frete gratis.</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  value={couponCode}
                  onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
                  placeholder="PRIMEIRA30"
                  className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm font-bold uppercase tracking-wide text-gray-950 outline-none placeholder:text-gray-400 focus:border-[#6b21a8] focus:bg-white"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="rounded-xl bg-[#6b21a8] px-5 py-3 text-sm font-black text-white transition-all hover:opacity-90"
                >
                  Aplicar cupom
                </button>
              </div>
              {couponMessage && (
                <p className={`mt-3 text-sm font-semibold ${
                  couponMessage.type === 'success' ? 'text-emerald-600' : 'text-red-500'
                }`}>
                  {couponMessage.text}
                </p>
              )}
              {(coupons.discount || coupons.freeShipping) && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {coupons.discount && (
                    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                      {coupons.discount.code}
                      <button type="button" onClick={() => removeCoupon('discount')} className="text-red-500">remover</button>
                    </span>
                  )}
                  {coupons.freeShipping && (
                    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                      {coupons.freeShipping.code}
                      <button type="button" onClick={() => removeCoupon('free_shipping')} className="text-red-500">remover</button>
                    </span>
                  )}
                </div>
              )}
            </section>

            <CheckoutForm
              formId={checkoutFormId}
              values={form}
              shippingMethods={shippingMethods}
              paymentMethods={paymentMethods}
              selectedShippingId={selectedShippingId}
              selectedPaymentId={selectedPaymentId}
              onChange={updateForm}
              onShippingChange={setSelectedShippingId}
              onPaymentChange={setSelectedPaymentId}
              onSubmit={finishOrder}
            />
          </div>
          <OrderSummary
            formId={checkoutFormId}
            items={items}
            subtotal={totals.subtotal}
            shippingTotal={selectedShipping.price}
            discountTotal={totals.discountTotal}
            shippingDiscountTotal={totals.shippingDiscountTotal}
            payableShippingTotal={totals.payableShippingTotal}
            total={totals.total}
            coupons={coupons}
          />
        </section>
      </main>
      <Footer />
    </>
  );
}
