declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    fbq?: (...args: unknown[]) => void
    dataLayer?: unknown[]
  }
}

export function trackAddToCart(item: { id: string; name: string; price: number; quantity: number }) {
  if (typeof window === 'undefined') return
  window.gtag?.('event', 'add_to_cart', {
    currency: 'BRL',
    value: item.price * item.quantity,
    items: [{ item_id: item.id, item_name: item.name, price: item.price, quantity: item.quantity }],
  })
  window.fbq?.('track', 'AddToCart', {
    content_ids: [item.id],
    content_name: item.name,
    value: item.price * item.quantity,
    currency: 'BRL',
  })
}

export function trackViewItem(item: { id: string; name: string; price: number }) {
  if (typeof window === 'undefined') return
  window.gtag?.('event', 'view_item', {
    currency: 'BRL',
    value: item.price,
    items: [{ item_id: item.id, item_name: item.name, price: item.price }],
  })
  window.fbq?.('track', 'ViewContent', {
    content_ids: [item.id],
    content_name: item.name,
    value: item.price,
    currency: 'BRL',
  })
}

export function trackBeginCheckout(value: number, itemCount: number) {
  if (typeof window === 'undefined') return
  window.gtag?.('event', 'begin_checkout', { currency: 'BRL', value, num_items: itemCount })
  window.fbq?.('track', 'InitiateCheckout', { value, currency: 'BRL', num_items: itemCount })
}

export function trackPurchase(params: {
  orderId: string
  value: number
  items: { id: string; name: string; price: number; quantity: number }[]
}) {
  if (typeof window === 'undefined') return
  window.gtag?.('event', 'purchase', {
    transaction_id: params.orderId,
    currency: 'BRL',
    value: params.value,
    items: params.items.map((i) => ({
      item_id: i.id,
      item_name: i.name,
      price: i.price,
      quantity: i.quantity,
    })),
  })
  window.fbq?.('track', 'Purchase', {
    value: params.value,
    currency: 'BRL',
    content_ids: params.items.map((i) => i.id),
    num_items: params.items.reduce((s, i) => s + i.quantity, 0),
  })
}

export function trackCouponApplied(code: string) {
  if (typeof window === 'undefined') return
  window.gtag?.('event', 'coupon_applied', { coupon: code })
  window.fbq?.('trackCustom', 'CouponApplied', { coupon: code })
}

export function trackLogin() {
  if (typeof window === 'undefined') return
  window.gtag?.('event', 'login', { method: 'email' })
}

export function trackRegister() {
  if (typeof window === 'undefined') return
  window.gtag?.('event', 'sign_up', { method: 'email' })
}
