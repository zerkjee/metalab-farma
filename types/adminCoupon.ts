export type AdminCouponKind = 'discount' | 'free_shipping';
export type AdminCouponDiscountMode = 'percent' | 'fixed';
export type AdminCouponStatus = 'active' | 'inactive';

export interface AdminCoupon {
  id: string;
  code: string;
  name: string;
  kind: AdminCouponKind;
  discountMode: AdminCouponDiscountMode;
  percentage: number;
  fixedValue: number;
  validUntil: string;
  usageLimit: number;
  usedTotal: number;
  minimumOrderValue: number;
  status: AdminCouponStatus;
  createdAt: string;
}

export interface AdminCouponFormValues {
  code: string;
  name: string;
  kind: AdminCouponKind;
  percentage: number;
  fixedValue: number;
  validUntil: string;
  usageLimit: number;
  minimumOrderValue: number;
  status: AdminCouponStatus;
}
