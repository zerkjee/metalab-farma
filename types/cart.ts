import type { Product } from '@/types/product';
import type { CouponState, CouponType, CouponValidationResult } from '@/types/coupon';
import type { CalculatedCartTotals } from '@/services/cartTotals';

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  brand: string;
  imageUrl: string | null;
  unitPrice: number;
  quantity: number;
  stock: number;
  color: string;
}

export interface CartState {
  items: CartItem[];
  coupons: CouponState;
}

export type CartTotals = CalculatedCartTotals;

export type AddCartProductInput = Product;

export type ApplyCouponFn = (code: string) => Promise<CouponValidationResult>;
export type RemoveCouponFn = (type: CouponType) => void;
