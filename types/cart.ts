import type { Product } from '@/types/product';

export interface CartItem {
  productId: number;
  name: string;
  brand: string;
  imageUrl: string | null;
  unitPrice: number;
  quantity: number;
  stock: number;
  color: string;
}

export interface CartCouponState {
  discountCouponCode: string | null;
  freeShippingCouponCode: string | null;
}

export interface CartState {
  items: CartItem[];
  coupons: CartCouponState;
}

export interface CartTotals {
  itemCount: number;
  subtotal: number;
}

export type AddCartProductInput = Product;
