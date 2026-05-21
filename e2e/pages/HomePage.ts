import { Page, expect } from '@playwright/test'

export class HomePage {
  constructor(readonly page: Page) {}

  async goto() {
    await this.page.goto('/')
    await this.page.waitForLoadState('domcontentloaded')
  }

  // ── Locators ──────────────────────────────────────────────────────────────

  get logo()           { return this.page.getByText('METALAB').first() }
  get cartButton()     { return this.page.getByRole('button', { name: /abrir carrinho/i }) }
  get searchInput()    { return this.page.getByPlaceholder(/buscar|pesquisar|search/i) }
  get navLinks()       { return this.page.locator('header nav a') }
  get productCards()   { return this.page.locator('article, [data-product-card], .product-card').or(
                           this.page.locator('section').filter({ hasText: /adicionar ao carrinho/i }).locator('..')
                         ) }
  get bannerSection()  { return this.page.locator('section').first() }
  get footerSection()  { return this.page.locator('footer') }

  // ── Actions ───────────────────────────────────────────────────────────────

  async waitForProducts() {
    // Aguarda pelo menos um produto carregar na tela
    await this.page.waitForFunction(() => {
      const buttons = document.querySelectorAll('button')
      return [...buttons].some(b => /adicionar|carrinho/i.test(b.textContent ?? ''))
    }, { timeout: 15_000 })
  }

  async clickNavLink(label: string) {
    await this.page.getByRole('link', { name: new RegExp(label, 'i') }).first().click()
  }

  async openCart() {
    await this.cartButton.click()
    await expect(this.page.getByRole('complementary', { name: /carrinho/i })).toBeVisible()
  }

  async getFirstProductSlug(): Promise<string | null> {
    const productLinks = this.page.locator('a[href*="/produtos/"]')
    const count = await productLinks.count()
    if (count === 0) return null
    const href = await productLinks.first().getAttribute('href')
    return href?.split('/produtos/')[1] ?? null
  }

  async clickFirstProduct() {
    const link = this.page.locator('a[href*="/produtos/"]').first()
    await link.click()
    await this.page.waitForLoadState('domcontentloaded')
  }

  // ── Assertions ────────────────────────────────────────────────────────────

  async assertLoaded() {
    await expect(this.page).toHaveTitle(/.+/)
    await expect(this.logo).toBeVisible()
    await expect(this.cartButton).toBeVisible()
    await expect(this.footerSection).toBeVisible()
  }

  async assertNavigationLinks() {
    const labels = ['Início', 'Produtos', 'Avaliações', 'VIP']
    for (const label of labels) {
      await expect(
        this.page.getByRole('link', { name: new RegExp(label, 'i') }).first()
      ).toBeVisible()
    }
  }
}
