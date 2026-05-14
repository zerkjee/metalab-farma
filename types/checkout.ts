import type { CartItem } from '@/types/cart';

export type ShippingMethodId = 'standard' | 'express';
export type PaymentMethodId = 'pix' | 'card' | 'boleto';

export interface CheckoutForm {
  fullName: string;
  email: string;
  phone: string;
  cpf: string;
  zipCode: string;
  address: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;
}

export interface ShippingMethod {
  id: ShippingMethodId;
  label: string;
  description: string;
  price: number;
  estimate: string;
}

export interface PaymentMethod {
  id: PaymentMethodId;
  label: string;
  description: string;
}

export interface MockOrder {
  id: string;
  createdAt: string;
  customer: CheckoutForm;
  items: CartItem[];
  shipping: ShippingMethod;
  payment: PaymentMethod;
  subtotal: number;
  shippingTotal: number;
  total: number;
  status: 'mock_created';
}
