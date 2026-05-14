import type { CartItem } from '@/types/cart';
import type { CheckoutForm, MockOrder, PaymentMethod, ShippingMethod } from '@/types/checkout';

interface CreateMockOrderInput {
  customer: CheckoutForm;
  items: CartItem[];
  shipping: ShippingMethod;
  payment: PaymentMethod;
  subtotal: number;
}

function createMockOrderId() {
  const date = new Date();
  const stamp = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('');
  const suffix = Math.floor(1000 + Math.random() * 9000);

  return `MLB-${stamp}-${suffix}`;
}

export function createMockOrder({
  customer,
  items,
  shipping,
  payment,
  subtotal,
}: CreateMockOrderInput): MockOrder {
  const shippingTotal = shipping.price;

  return {
    id: createMockOrderId(),
    createdAt: new Date().toISOString(),
    customer,
    items: items.map((item) => ({ ...item })),
    shipping,
    payment,
    subtotal,
    shippingTotal,
    total: subtotal + shippingTotal,
    status: 'mock_created',
  };
}
