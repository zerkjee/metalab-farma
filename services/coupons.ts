import type { AppliedCoupon, CouponState, CouponType, CouponValidationResult } from '@/types/coupon';

export const emptyCouponState: CouponState = {
  discount: null,
  freeShipping: null,
};

export function normalizeCouponCode(code: string) {
  return code.trim().replace(/\s/g, '').toUpperCase();
}

export function couponSlot(type: CouponType): keyof CouponState {
  return type === 'discount' ? 'discount' : 'freeShipping';
}

export async function validateCoupon({
  code,
  coupons,
  subtotal,
}: {
  code: string;
  coupons: CouponState;
  subtotal: number;
}): Promise<CouponValidationResult> {
  const normalized = normalizeCouponCode(code);

  if (!normalized) {
    return { ok: false, message: 'Digite um código de cupom.' };
  }

  let data: { codigo: string; tipo: string; valor: number; desconto: number; freteGratis: boolean };

  try {
    const res = await fetch('/api/cupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigo: normalized, subtotal }),
    });
    const json = await res.json();
    if (!res.ok) {
      return { ok: false, message: json.erro ?? 'Cupom inválido.' };
    }
    data = json;
  } catch {
    return { ok: false, message: 'Erro ao validar cupom. Tente novamente.' };
  }

  const type: CouponType = data.freteGratis ? 'free_shipping' : 'discount';
  const discountMode = data.tipo === 'PERCENTUAL' ? 'percent' as const
    : data.tipo === 'FRETE_GRATIS' ? 'shipping' as const
    : 'fixed' as const;

  const slot = couponSlot(type);
  if (coupons[slot]) {
    const label = type === 'discount' ? 'desconto' : 'frete grátis';
    return { ok: false, message: `Você já aplicou um cupom de ${label}. Remova o atual para trocar.`, type };
  }

  const appliedCoupon: AppliedCoupon = {
    id: data.codigo,
    code: data.codigo,
    name: data.codigo,
    type,
    discountMode,
    value: data.valor,
  };

  return {
    ok: true,
    coupon: appliedCoupon,
    type,
    message: type === 'discount'
      ? `${data.codigo} aplicado com sucesso.`
      : `${data.codigo} aplicado. Frete grátis no checkout.`,
  };
}
