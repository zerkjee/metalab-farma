import type { AppliedCoupon } from '@/types/coupon';

export type ShippingMethodId = 'standard' | 'express';
export type PaymentMethodId = 'PIX' | 'CARTAO_CREDITO' | 'BOLETO';

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

export type FreteStatus = 'idle' | 'loading' | 'done' | 'error';

export interface PaymentMethod {
  id: PaymentMethodId;
  label: string;
  description: string;
}

export interface RealOrder {
  id: string;
  numero: string;
  total: number;
  metodoPagamento: PaymentMethodId;
  pixQrCode?: string;
  pixQrCodeBase64?: string;
  customer: CheckoutForm;
  shipping: ShippingMethod;
  coupons: AppliedCoupon[];
}
