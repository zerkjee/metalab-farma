'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { calculateCartTotals } from '@/services/cartTotals';
import { couponSlot, emptyCouponState, validateCoupon } from '@/services/coupons';
import type {
  AddCartProductInput,
  ApplyCouponFn,
  CartItem,
  CartState,
  CartTotals,
  RemoveCouponFn,
} from '@/types/cart';
import type { AppliedCoupon, CouponState } from '@/types/coupon';

const CART_STORAGE_KEY = 'metalab_cart_state_v1';

const initialCartState: CartState = {
  items: [],
  coupons: emptyCouponState,
};

interface CartContextValue {
  items: CartItem[];
  coupons: CartState['coupons'];
  totals: CartTotals;
  isOpen: boolean;
  hydrated: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (product: AddCartProductInput, quantity?: number) => void;
  increaseItem: (productId: number) => void;
  decreaseItem: (productId: number) => void;
  removeItem: (productId: number) => void;
  applyCoupon: ApplyCouponFn;
  removeCoupon: RemoveCouponFn;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function productToCartItem(product: AddCartProductInput, quantity: number): CartItem {
  const unitPrice = typeof product.preco === 'string' ? parseFloat(product.preco) : product.preco;

  return {
    productId: product.id,
    name: product.nome,
    brand: product.marca,
    imageUrl: product.imagem_url,
    unitPrice,
    quantity,
    stock: product.estoque,
    color: product.cor_principal || '#6b21a8',
  };
}

function sanitizeCartState(value: unknown): CartState {
  if (!value || typeof value !== 'object') return initialCartState;

  const maybeState = value as Partial<CartState>;
  const items = Array.isArray(maybeState.items)
    ? maybeState.items.filter((item): item is CartItem => {
      if (!item || typeof item !== 'object') return false;
      const maybeItem = item as Partial<CartItem>;
      return typeof maybeItem.productId === 'number'
        && typeof maybeItem.name === 'string'
        && typeof maybeItem.unitPrice === 'number'
        && typeof maybeItem.quantity === 'number';
    })
    : [];

  const maybeCoupons = maybeState.coupons as Partial<CouponState> & {
    discountCouponCode?: string | null;
    freeShippingCouponCode?: string | null;
  } | undefined;

  const isAppliedCoupon = (coupon: unknown): coupon is AppliedCoupon => {
    if (!coupon || typeof coupon !== 'object') return false;
    const maybeCoupon = coupon as Partial<AppliedCoupon>;
    return typeof maybeCoupon.code === 'string'
      && (maybeCoupon.type === 'discount' || maybeCoupon.type === 'free_shipping')
      && typeof maybeCoupon.name === 'string';
  };

  return {
    items: items.map((item) => ({
      ...item,
      quantity: Math.max(1, Math.min(item.quantity, item.stock || item.quantity)),
      color: item.color || '#6b21a8',
    })),
    coupons: {
      discount: isAppliedCoupon(maybeCoupons?.discount) ? maybeCoupons.discount : null,
      freeShipping: isAppliedCoupon(maybeCoupons?.freeShipping) ? maybeCoupons.freeShipping : null,
    },
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartState>(initialCartState);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem(CART_STORAGE_KEY);
        if (stored) {
          setCart(sanitizeCartState(JSON.parse(stored)));
        }
      } catch {
        setCart(initialCartState);
      } finally {
        setHydrated(true);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart, hydrated]);

  const totals = useMemo<CartTotals>(() => calculateCartTotals({
    items: cart.items,
    coupons: cart.coupons,
  }), [cart.coupons, cart.items]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((current) => !current), []);

  const addItem = useCallback((product: AddCartProductInput, quantity = 1) => {
    setCart((current) => {
      const existing = current.items.find((item) => item.productId === product.id);

      if (existing) {
        return {
          ...current,
          items: current.items.map((item) => item.productId === product.id
            ? { ...item, quantity: Math.min(item.stock, item.quantity + quantity) }
            : item),
        };
      }

      return {
        ...current,
        items: [
          ...current.items,
          productToCartItem(product, Math.max(1, Math.min(quantity, product.estoque))),
        ],
      };
    });
    setIsOpen(true);
  }, []);

  const increaseItem = useCallback((productId: number) => {
    setCart((current) => ({
      ...current,
      items: current.items.map((item) => item.productId === productId
        ? { ...item, quantity: Math.min(item.stock, item.quantity + 1) }
        : item),
    }));
  }, []);

  const decreaseItem = useCallback((productId: number) => {
    setCart((current) => ({
      ...current,
      items: current.items
        .map((item) => item.productId === productId
          ? { ...item, quantity: item.quantity - 1 }
          : item)
        .filter((item) => item.quantity > 0),
    }));
  }, []);

  const removeItem = useCallback((productId: number) => {
    setCart((current) => ({
      ...current,
      items: current.items.filter((item) => item.productId !== productId),
    }));
  }, []);

  const applyCoupon = useCallback<ApplyCouponFn>((code) => {
    const subtotal = calculateCartTotals({
      items: cart.items,
      coupons: cart.coupons,
    }).subtotal;
    const result = validateCoupon({ code, coupons: cart.coupons, subtotal });

    if (result.ok && result.coupon) {
      const slot = couponSlot(result.coupon.type);
      setCart((current) => ({
        ...current,
        coupons: {
          ...current.coupons,
          [slot]: result.coupon ?? null,
        },
      }));
    }

    return result;
  }, [cart.coupons, cart.items]);

  const removeCoupon = useCallback<RemoveCouponFn>((type) => {
    const slot = couponSlot(type);
    setCart((current) => ({
      ...current,
      coupons: {
        ...current.coupons,
        [slot]: null,
      },
    }));
  }, []);

  const clearCart = useCallback(() => {
    setCart(initialCartState);
  }, []);

  const value = useMemo<CartContextValue>(() => ({
    items: cart.items,
    coupons: cart.coupons,
    totals,
    isOpen,
    hydrated,
    openCart,
    closeCart,
    toggleCart,
    addItem,
    increaseItem,
    decreaseItem,
    removeItem,
    applyCoupon,
    removeCoupon,
    clearCart,
  }), [
    addItem,
    applyCoupon,
    cart.coupons,
    cart.items,
    clearCart,
    closeCart,
    decreaseItem,
    hydrated,
    increaseItem,
    isOpen,
    openCart,
    removeCoupon,
    removeItem,
    toggleCart,
    totals,
  ]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }

  return context;
}
