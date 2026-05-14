import { mockCoupons } from '@/data/mock/coupons';
import type { AppliedCoupon, Coupon, CouponState, CouponType, CouponValidationResult } from '@/types/coupon';

export const emptyCouponState: CouponState = {
  discount: null,
  freeShipping: null,
};

export function normalizeCouponCode(code: string) {
  return code.trim().replace(/\s/g, '').toUpperCase();
}

export function couponToAppliedCoupon(coupon: Coupon): AppliedCoupon {
  return {
    id: coupon.id,
    code: coupon.code,
    name: coupon.name,
    type: coupon.type,
    discountMode: coupon.discountMode,
    value: coupon.value,
  };
}

export function couponSlot(type: CouponType): keyof CouponState {
  return type === 'discount' ? 'discount' : 'freeShipping';
}

export function findCoupon(code: string) {
  const normalized = normalizeCouponCode(code);
  return mockCoupons.find((coupon) => coupon.code === normalized);
}

export function validateCoupon({
  code,
  coupons,
  subtotal,
}: {
  code: string;
  coupons: CouponState;
  subtotal: number;
}): CouponValidationResult {
  const normalized = normalizeCouponCode(code);

  if (!normalized) {
    return { ok: false, message: 'Digite um codigo de cupom.' };
  }

  const coupon = findCoupon(normalized);

  if (!coupon) {
    return { ok: false, message: 'Cupom invalido ou nao encontrado.' };
  }

  if (!coupon.active) {
    return { ok: false, message: 'Este cupom esta inativo.' };
  }

  if (new Date(`${coupon.validUntil}T23:59:59`) < new Date()) {
    return { ok: false, message: 'Este cupom esta expirado.' };
  }

  if (subtotal < coupon.minimumSubtotal) {
    return {
      ok: false,
      message: `Este cupom exige subtotal minimo de ${new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(coupon.minimumSubtotal)}.`,
    };
  }

  const slot = couponSlot(coupon.type);
  const existingCoupon = coupons[slot];

  if (existingCoupon) {
    const label = coupon.type === 'discount' ? 'desconto' : 'frete gratis';
    return {
      ok: false,
      message: `Voce ja aplicou um cupom de ${label}. Remova o atual para trocar.`,
      type: coupon.type,
    };
  }

  const appliedCoupon = couponToAppliedCoupon(coupon);

  return {
    ok: true,
    coupon: appliedCoupon,
    type: coupon.type,
    message: coupon.type === 'discount'
      ? `${coupon.code} aplicado com sucesso.`
      : `${coupon.code} aplicado. Frete gratis no checkout.`,
  };
}
