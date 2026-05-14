export type CouponType = 'discount' | 'free_shipping';
export type CouponDiscountMode = 'percent' | 'fixed' | 'shipping';

export interface Coupon {
  id: string;
  code: string;
  name: string;
  type: CouponType;
  discountMode: CouponDiscountMode;
  value: number;
  minimumSubtotal: number;
  active: boolean;
  validUntil: string;
}

export interface AppliedCoupon {
  id: string;
  code: string;
  name: string;
  type: CouponType;
  discountMode: CouponDiscountMode;
  value: number;
}

export interface CouponState {
  discount: AppliedCoupon | null;
  freeShipping: AppliedCoupon | null;
}

export interface CouponValidationResult {
  ok: boolean;
  message: string;
  coupon?: AppliedCoupon;
  type?: CouponType;
}
