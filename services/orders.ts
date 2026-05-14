import type { CartItem } from '@/types/cart';
import type { AppliedCoupon } from '@/types/coupon';
import type { CheckoutForm, MockOrder, PaymentMethod, ShippingMethod } from '@/types/checkout';

interface CreateMockOrderInput {
  customer: CheckoutForm;
  items: CartItem[];
  shipping: ShippingMethod;
  payment: PaymentMethod;
  subtotal: number;
  discountTotal: number;
  shippingDiscountTotal: number;
  payableShippingTotal: number;
  total: number;
  coupons: AppliedCoupon[];
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
  discountTotal,
  shippingDiscountTotal,
  payableShippingTotal,
  total,
  coupons,
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
    discountTotal,
    shippingDiscountTotal,
    payableShippingTotal,
    total,
    coupons: coupons.map((coupon) => ({ ...coupon })),
    status: 'mock_created',
  };
}
