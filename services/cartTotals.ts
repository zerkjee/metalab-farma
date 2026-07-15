import type { CartItem } from '@/types/cart';
import type { CouponState } from '@/types/coupon';
import { roundMoney } from '@/lib/volume-pricing';

export interface CalculatedCartTotals {
  itemCount: number;
  itemsSubtotal: number;
  volumeDiscountTotal: number;
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
      itemsSubtotal: acc.itemsSubtotal + roundMoney((item.baseUnitPrice ?? item.unitPrice) * item.quantity),
      subtotal: acc.subtotal + roundMoney(item.unitPrice * item.quantity),
    }),
    { itemCount: 0, itemsSubtotal: 0, subtotal: 0 },
  );

  const subtotal = roundMoney(base.subtotal);
  const itemsSubtotal = roundMoney(base.itemsSubtotal);
  const discountTotal = roundMoney(Math.min(subtotal, calculateDiscount(subtotal, coupons)));
  const volumeDiscountTotal = roundMoney(Math.max(0, itemsSubtotal - subtotal));
  const shippingTotal = roundMoney(shippingPrice);
  const shippingDiscountTotal = coupons.freeShipping ? shippingTotal : 0;
  const payableShippingTotal = roundMoney(Math.max(0, shippingTotal - shippingDiscountTotal));
  const total = roundMoney(Math.max(0, subtotal - discountTotal + payableShippingTotal));

  return {
    itemCount: base.itemCount,
    itemsSubtotal,
    volumeDiscountTotal,
    subtotal,
    discountTotal,
    shippingTotal,
    shippingDiscountTotal,
    payableShippingTotal,
    total,
  };
}
