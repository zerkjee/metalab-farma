import { describe, expect, it } from 'vitest'
import { calculateVolumePrice, getVolumeDiscountPercent, maxPurchasableUnits, MAX_UNITS_PER_PRODUCT } from '@/lib/volume-pricing'
import { calculateCartTotals } from '@/services/cartTotals'
import { emptyCouponState } from '@/services/coupons'
import type { CartItem } from '@/types/cart'

function item(quantity: number): CartItem {
  const price = calculateVolumePrice(100, quantity)
  return {
    productId: 'prod-1',
    slug: 'produto-teste',
    name: 'Produto teste',
    brand: 'Metalab',
    imageUrl: null,
    baseUnitPrice: price.baseUnitPrice,
    unitPrice: price.unitPrice,
    volumeDiscountPercent: price.discountPercent,
    quantity: price.quantity,
    stock: 3,
    color: '#323C64',
  }
}

describe('volume pricing', () => {
  it('aplica as faixas comerciais por quantidade', () => {
    expect(getVolumeDiscountPercent(1)).toBe(0)
    expect(getVolumeDiscountPercent(2)).toBe(10)
    expect(getVolumeDiscountPercent(3)).toBe(15)
  })

  it('calcula preço unitário e economia da faixa de 2 unidades', () => {
    expect(calculateVolumePrice(100, 2)).toMatchObject({
      baseUnitPrice: 100,
      unitPrice: 90,
      discountPercent: 10,
      originalSubtotal: 200,
      subtotal: 180,
      discountTotal: 20,
    })
  })

  it('calcula preço unitário e economia da faixa de 3 unidades', () => {
    expect(calculateVolumePrice(39.9, 3)).toMatchObject({
      baseUnitPrice: 39.9,
      unitPrice: 33.92,
      discountPercent: 15,
      originalSubtotal: 119.7,
      subtotal: 101.76,
      discountTotal: 17.94,
    })
  })

  it('limita unidades compráveis ao menor entre estoque e o teto por pedido', () => {
    expect(MAX_UNITS_PER_PRODUCT).toBe(3)
    expect(maxPurchasableUnits(100)).toBe(3) // estoque alto → capado no limite do pedido
    expect(maxPurchasableUnits(2)).toBe(2)   // estoque baixo manda
    expect(maxPurchasableUnits(0)).toBe(0)
    expect(maxPurchasableUnits(-5)).toBe(0)  // nunca negativo
  })

  it('calcula totais do carrinho separando desconto por quantidade de cupom', () => {
    const totals = calculateCartTotals({
      items: [item(2)],
      coupons: emptyCouponState,
      shippingPrice: 10,
    })

    expect(totals.itemsSubtotal).toBe(200)
    expect(totals.volumeDiscountTotal).toBe(20)
    expect(totals.subtotal).toBe(180)
    expect(totals.discountTotal).toBe(0)
    expect(totals.total).toBe(190)
  })
})
