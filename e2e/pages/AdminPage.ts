import { Page, expect } from '@playwright/test'

export class AdminPage {
  constructor(readonly page: Page) {}

  async goto(section = '') {
    await this.page.goto(`/admin${section}`)
    await this.page.waitForLoadState('domcontentloaded')
  }

  // ── Sidebar ───────────────────────────────────────────────────────────────

  get sidebar()         { return this.page.locator('nav, aside').filter({ hasText: /produtos|pedidos|cupons/i }).first() }
  get dashboardLink()   { return this.page.getByRole('link', { name: /dashboard|painel|início/i }) }
  get productsLink()    { return this.page.getByRole('link', { name: /produtos/i }).filter({ hasNot: this.page.locator('text=/novos|criar/i') }).first() }
  get ordersLink()      { return this.page.getByRole('link', { name: /pedidos/i }).first() }
  get couponsLink()     { return this.page.getByRole('link', { name: /cupons/i }).first() }
  get bannersLink()     { return this.page.getByRole('link', { name: /banners/i }).first() }

  // ── Dashboard ─────────────────────────────────────────────────────────────

  get revenueCard()     { return this.page.locator('text=/receita|faturamento/i').first() }
  get ordersCard()      { return this.page.locator('text=/pedidos/i').first() }
  get statCards()       { return this.page.locator('[class*="StatCard"], [class*="stat-card"]').or(
                            this.page.locator('div').filter({ hasText: /receita|pedidos|clientes/i })
                          ).first() }

  // ── Produtos ──────────────────────────────────────────────────────────────

  get newProductButton()  { return this.page.getByRole('button', { name: /novo produto|criar produto|adicionar produto/i }).or(
                              this.page.locator('button').filter({ has: this.page.locator('svg') }).filter({ hasText: /novo|produto/i })
                            ).first() }
  get productTable()      { return this.page.locator('table, [role="table"]').first() }
  get productRows()       { return this.productTable.locator('tr, [role="row"]').filter({ hasText: /R\$/ }) }
  get searchInput()       { return this.page.getByPlaceholder(/buscar|pesquisar|search/i) }

  // Modal de produto
  get productModal()      { return this.page.locator('[role="dialog"], [class*="Modal"]').first() }
  get productNameInput()  { return this.productModal.getByPlaceholder(/nome|produto/i).first().or(
                              this.productModal.locator('input').first()
                            ) }
  get saveProductButton() { return this.productModal.getByRole('button', { name: /salvar|criar|confirmar/i }) }
  get closeModalButton()  { return this.productModal.getByRole('button', { name: /fechar|cancelar|×/i }) }

  editProductButton(name: string) {
    return this.page.locator('tr, [role="row"]')
      .filter({ hasText: name })
      .getByRole('button')
      .filter({ has: this.page.locator('svg') })
      .first()
  }

  deleteProductButton(name: string) {
    return this.page.locator('tr, [role="row"]')
      .filter({ hasText: name })
      .getByRole('button', { name: /excluir|deletar|remover/i })
      .last()
  }

  // ── Cupons ────────────────────────────────────────────────────────────────

  get newCouponButton()  { return this.page.getByRole('button', { name: /novo cupom|criar cupom|adicionar/i }).or(
                             this.page.locator('button').filter({ has: this.page.locator('svg') }).filter({ hasText: /cupom|novo/i })
                           ).first() }
  get couponModal()      { return this.page.locator('[role="dialog"], [class*="Modal"]').first() }
  get couponCodeInput()  { return this.couponModal.locator('input').filter({ hasText: '' }).first() }
  get saveCouponButton() { return this.couponModal.getByRole('button', { name: /salvar|criar/i }) }
  get couponRows()       { return this.page.locator('tr, [role="row"]').filter({ hasText: /%|R\$|frete/i }) }

  // ── Banners ───────────────────────────────────────────────────────────────

  get newBannerButton()  { return this.page.getByRole('button', { name: /novo banner|criar banner|adicionar/i }).or(
                             this.page.locator('button').filter({ has: this.page.locator('svg') }).filter({ hasText: /banner|novo/i })
                           ).first() }
  get bannerModal()      { return this.page.locator('[role="dialog"], [class*="Modal"]').first() }
  get bannerTitleInput() { return this.bannerModal.locator('input[type="text"]').first() }
  get saveBannerButton() { return this.bannerModal.getByRole('button', { name: /salvar|criar/i }) }

  // ── Pedidos ───────────────────────────────────────────────────────────────

  get orderRows()        { return this.page.locator('tr, [role="row"]').filter({ hasText: /MTL-|aguardando|pago/i }) }
  get orderSearchInput() { return this.page.getByPlaceholder(/buscar|pedido|número/i) }

  // ── Actions ───────────────────────────────────────────────────────────────

  async navigateTo(section: string) {
    await this.page.goto(`/admin/${section}`)
    await this.page.waitForLoadState('domcontentloaded')
  }

  async waitForTable() {
    await this.page.waitForFunction(
      () => document.querySelectorAll('tr').length > 1 || document.querySelectorAll('[role="row"]').length > 1,
      { timeout: 10_000 }
    )
  }

  async createProduct(data: { name: string; sku: string; price: number; stock: number }) {
    await this.newProductButton.click()
    await expect(this.productModal).toBeVisible()
    // Preenche o nome (campo mais importante)
    const nameField = this.productModal.locator('input[placeholder*="nome"], input').filter({ hasText: '' }).first()
    await nameField.fill(data.name)
    await this.saveProductButton.click()
  }

  async openProductEditModal(productName: string) {
    await this.editProductButton(productName).click()
    await expect(this.productModal).toBeVisible()
  }

  async createCoupon(data: { code: string; type: 'percent' | 'fixed' | 'shipping'; value?: number }) {
    await this.newCouponButton.click()
    await expect(this.couponModal).toBeVisible()
  }

  // ── Assertions ────────────────────────────────────────────────────────────

  async assertDashboardLoaded() {
    await expect(this.page).toHaveURL(/\/admin/)
    // Aguarda pelo menos um card de estatística
    await expect(this.page.locator('text=/receita|pedidos|clientes|ticket/i').first()).toBeVisible({ timeout: 10_000 })
  }

  async assertProductsLoaded() {
    await expect(this.page).toHaveURL(/\/admin\/produtos/)
    await expect(this.newProductButton).toBeVisible()
  }

  async assertProductInList(name: string) {
    await expect(this.page.locator(`text=${name}`)).toBeVisible({ timeout: 5_000 })
  }

  async assertProductNotInList(name: string) {
    await expect(this.page.locator(`text=${name}`)).not.toBeVisible({ timeout: 5_000 })
  }

  async assertCouponsLoaded() {
    await expect(this.page).toHaveURL(/\/admin\/cupons/)
    await expect(this.newCouponButton).toBeVisible()
  }

  async assertBannersLoaded() {
    await expect(this.page).toHaveURL(/\/admin\/banners/)
    await expect(this.newBannerButton).toBeVisible()
  }

  async assertOrdersLoaded() {
    await expect(this.page).toHaveURL(/\/admin\/pedidos/)
  }

  async assertRedirectsToAdminLogin() {
    await expect(this.page).toHaveURL(/admin\/login/, { timeout: 5_000 })
  }
}
