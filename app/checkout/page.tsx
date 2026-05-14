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
  const { items, totals, hydrated, clearCart } = useCart();
  const [form, setForm] = useState<CheckoutFormValues>(initialForm);
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
  const total = totals.subtotal + selectedShipping.price;

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
    });

    setOrder(mockOrder);
    clearCart();
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
          <OrderSummary
            formId={checkoutFormId}
            items={items}
            subtotal={totals.subtotal}
            shippingTotal={selectedShipping.price}
            total={total}
          />
        </section>
      </main>
      <Footer />
    </>
  );
}
