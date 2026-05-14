import type { CartItem } from '@/types/cart';
import type { CouponState } from '@/types/coupon';

export interface CalculatedCartTotals {
  itemCount: number;
  subtotal: number;
  discountTotal: number;
  shippingTotal: number;
  shippingDiscountTotal: number;
  payableShippingTotal: number;
  total: number;
}

export function calculateDiscount(subtotal: number, coupons: CouponState) {
  const discountCoupon = coupons.discount;

  if (!discountCoupon) return 0;

  if (discountCoupon.discountMode === 'percent') {
    return subtotal * (discountCoupon.value / 100);
  }

  if (discountCoupon.discountMode === 'fixed') {
    return Math.min(subtotal, discountCoupon.value);
  }

  return 0;
}

export function calculateCartTotals({
  items,
  coupons,
  shippingPrice = 0,
}: {
  items: CartItem[];
  coupons: CouponState;
  shippingPrice?: number;
}): CalculatedCartTotals {
  const base = items.reduce(
    (acc, item) => ({
      itemCount: acc.itemCount + item.quantity,
      subtotal: acc.subtotal + item.unitPrice * item.quantity,
    }),
    { itemCount: 0, subtotal: 0 },
  );

  const discountTotal = Math.min(base.subtotal, calculateDiscount(base.subtotal, coupons));
  const shippingDiscountTotal = coupons.freeShipping ? shippingPrice : 0;
  const payableShippingTotal = Math.max(0, shippingPrice - shippingDiscountTotal);
  const total = Math.max(0, base.subtotal - discountTotal + payableShippingTotal);

  return {
    itemCount: base.itemCount,
    subtotal: base.subtotal,
    discountTotal,
    shippingTotal: shippingPrice,
    shippingDiscountTotal,
    payableShippingTotal,
    total,
  };
}
