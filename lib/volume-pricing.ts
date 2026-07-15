export interface VolumePrice {
  quantity: number
  baseUnitPrice: number
  unitPrice: number
  discountPercent: number
  originalSubtotal: number
  subtotal: number
  discountTotal: number
}

/** Limite de unidades por produto em um único pedido (regra de negócio + tiers de desconto). */
export const MAX_UNITS_PER_PRODUCT = 3

export function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

/** Teto de unidades compráveis: nunca acima do estoque nem do limite por pedido. */
export function maxPurchasableUnits(stock: number) {
  return Math.max(0, Math.min(stock, MAX_UNITS_PER_PRODUCT))
}

export function getVolumeDiscountPercent(quantity: number) {
  if (quantity >= 3) return 15
  if (quantity === 2) return 10
  return 0
}

export function calculateVolumePrice(baseUnitPrice: number, quantity: number): VolumePrice {
  const safeQuantity = Math.max(1, Math.trunc(quantity))
  const safeBaseUnitPrice = roundMoney(Math.max(0, baseUnitPrice))
  const discountPercent = getVolumeDiscountPercent(safeQuantity)
  const unitPrice = discountPercent > 0
    ? roundMoney(safeBaseUnitPrice * (1 - discountPercent / 100))
    : safeBaseUnitPrice
  const originalSubtotal = roundMoney(safeBaseUnitPrice * safeQuantity)
  const subtotal = roundMoney(unitPrice * safeQuantity)

  return {
    quantity: safeQuantity,
    baseUnitPrice: safeBaseUnitPrice,
    unitPrice,
    discountPercent,
    originalSubtotal,
    subtotal,
    discountTotal: roundMoney(originalSubtotal - subtotal),
  }
}
