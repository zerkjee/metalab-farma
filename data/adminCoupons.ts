import type { AdminCoupon, AdminCouponFormValues } from '@/types/adminCoupon';

export const couponKindLabels = {
  discount: 'Desconto',
  free_shipping: 'Frete gratis',
} as const;

export const couponStatusLabels = {
  active: 'Ativo',
  inactive: 'Inativo',
} as const;

export const emptyCouponForm: AdminCouponFormValues = {
  code: '',
  name: '',
  kind: 'discount',
  percentage: 10,
  fixedValue: 0,
  validUntil: '2026-12-31',
  usageLimit: 100,
  minimumOrderValue: 0,
  status: 'active',
};

export const mockAdminCoupons: AdminCoupon[] = [
  {
    id: 'coupon-primeiracompra30',
    code: 'PRIMEIRACOMPRA30',
    name: 'Primeira compra 30% OFF',
    kind: 'discount',
    discountMode: 'percent',
    percentage: 30,
    fixedValue: 0,
    validUntil: '2026-12-31',
    usageLimit: 500,
    usedTotal: 138,
    minimumOrderValue: 120,
    status: 'active',
    createdAt: '2026-05-01',
  },
  {
    id: 'coupon-carrinho30',
    code: 'CARRINHO30',
    name: 'Recuperacao de carrinho',
    kind: 'discount',
    discountMode: 'fixed',
    percentage: 0,
    fixedValue: 30,
    validUntil: '2026-09-30',
    usageLimit: 300,
    usedTotal: 64,
    minimumOrderValue: 180,
    status: 'active',
    createdAt: '2026-05-04',
  },
  {
    id: 'coupon-fretegratis',
    code: 'FRETEGRATIS',
    name: 'Frete gratis nacional',
    kind: 'free_shipping',
    discountMode: 'fixed',
    percentage: 0,
    fixedValue: 0,
    validUntil: '2026-08-31',
    usageLimit: 250,
    usedTotal: 91,
    minimumOrderValue: 199,
    status: 'active',
    createdAt: '2026-05-05',
  },
];
