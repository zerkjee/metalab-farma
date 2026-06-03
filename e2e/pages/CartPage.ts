import { Page, expect } from '@playwright/test'

export class CartPage {
  constructor(readonly page: Page) {}

  // ── Locators ──────────────────────────────────────────────────────────────

  get drawer()          { return this.page.getByRole('complementary', { name: /carrinho/i }) }
  get closeButton()     { return this.page.getByRole('button', { name: /fechar carrinho/i }) }
  get emptyMessage()    { return this.page.locator('text=/carrinho está vazio/i') }
  get checkoutButton()  { return this.drawer.getByRole('link', { name: /finalizar|checkout|comprar/i }) }
  get couponInput()     { return this.drawer.getByPlaceholder(/PRIMEIRA|cupom|código/i) }
  get applyCouponBtn()  { return this.drawer.getByRole('button', { name: /aplicar/i }) }
  get couponSuccess()   { return this.drawer.locator('text=/cupom aplicado|desconto/i').first() }
  get couponError()     { return this.drawer.locator('text=/inválido|expirado|não encontrado/i') }
  get totalValue()      { return this.drawer.locator('text=/total/i').locator('..').last() }

  // Itens dentro do drawer
  get cartItems()       { return this.drawer.locator('li, [class*="item"]').filter({ hasText: /R\$/ }) }

  increaseButton(index = 0) {
    // Botão Plus (aumentar quantidade) — ícone Lucide Plus
    return this.cartItems.nth(index).getByRole('button').filter({ has: this.page.locator('svg') }).last()
  }

  decreaseButton(index = 0) {
    return this.cartItems.nth(index).getByRole('button').filter({ has: this.page.locator('svg') }).first()
  }

  removeButton(index = 0) {
    // Trash2 icon button para remover
    return this.cartItems.nth(index).getByRole('button', { name: /remover|excluir/i })
  }

  itemQuantity(index = 0) {
    // Quantidade exibida entre os botões de +/−
    return this.cartItems.nth(index).locator('text=/^\\d+$/')
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  async open() {
    const cartBtn = this.page.getByRole('button', { name: /abrir carrinho/i })
    await cartBtn.click()
    await expect(this.drawer).toBeVisible()
  }

  async close() {
    await this.closeButton.click()
    await expect(this.drawer).not.toBeVisible()
  }

  async applyCoupon(code: string) {
    await this.couponInput.fill(code)
    await this.applyCouponBtn.click()
  }

  async increaseItemQuantity(index = 0) {
    const before = await this.getItemQuantity(index)
    await this.increaseButton(index).click()
    await expect(async () => {
      const after = await this.getItemQuantity(index)
      expect(after).toBeGreaterThan(before)
    }).toPass({ timeout: 3_000 })
  }

  async decreaseItemQuantity(index = 0) {
    const before = await this.getItemQuantity(index)
    await this.decreaseButton(index).click()
    // Pode remover o item se qty=1
    if (before > 1) {
      await expect(async () => {
        const after = await this.getItemQuantity(index)
        expect(after).toBeLessThan(before)
      }).toPass({ timeout: 3_000 })
    }
  }

  async getItemQuantity(index = 0): Promise<number> {
    // Busca texto numérico entre os botões de ajuste de quantidade
    const qtyLocator = this.cartItems.nth(index).locator('span, p').filter({ hasText: /^\d+$/ }).first()
    const text = await qtyLocator.textContent()
    return parseInt(text ?? '1', 10)
  }

  async getItemCount(): Promise<number> {
    return this.cartItems.count()
  }

  async goToCheckout() {
    await this.checkoutButton.click()
    await this.page.waitForURL('**/checkout', { timeout: 10_000 })
  }

  // ── Assertions ────────────────────────────────────────────────────────────

  async assertOpen() {
    await expect(this.drawer).toBeVisible()
  }

  async assertEmpty() {
    await expect(this.emptyMessage).toBeVisible()
  }

  async assertHasItems(count?: number) {
    await expect(this.cartItems.first()).toBeVisible()
    if (count !== undefined) {
      await expect(this.cartItems).toHaveCount(count)
    }
  }

  async assertCouponApplied() {
    await expect(this.couponSuccess).toBeVisible({ timeout: 15_000 })
  }

  async assertCouponError() {
    await expect(this.couponError).toBeVisible({ timeout: 15_000 })
  }
}
