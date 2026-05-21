import { Page, expect } from '@playwright/test'

export class ProductPage {
  constructor(readonly page: Page) {}

  async goto(slug: string) {
    await this.page.goto(`/produtos/${slug}`, { waitUntil: 'domcontentloaded', timeout: 60_000 })
  }

  // ── Locators ──────────────────────────────────────────────────────────────

  get productTitle()       { return this.page.locator('h1') }
  get addToCartButton()    { return this.page.getByRole('button', { name: /adicionar ao carrinho/i }).first() }
  get moreInfoButton()     { return this.page.getByRole('button', { name: /mais informações/i }) }
  get priceDisplay()       { return this.page.locator('text=/R\$/').first() }
  get stockStatus()        { return this.page.locator('text=/em estoque|fora de estoque/i') }
  get kitSelector()        { return this.page.locator('text=/escolha a quantidade/i') }
  get kitBaseOption()      { return this.page.getByRole('button', { name: /1 unidade/i }) }
  get brandBadge()         { return this.page.locator('span').filter({ hasText: /Metalab|metalab/i }).first() }
  get composicaoSection()  { return this.page.locator('text=/composição|ingredientes/i').first() }
  get modoDeUsoSection()   { return this.page.locator('text=/como incluir na rotina/i') }
  get reviewsSection()     { return this.page.locator('text=/avaliações/i').last() }
  get stickyCtaButton()    { return this.page.locator('[class*="fixed"][class*="bottom"]').getByRole('button', { name: /comprar|adicionar/i }) }

  // Kit buttons (exceto "1 unidade")
  kitOption(quantity: number) {
    return this.page.getByRole('button', { name: new RegExp(`kit\\s*${quantity}`, 'i') })
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  async addToCart() {
    await this.addToCartButton.click()
    // Aguarda o CartDrawer abrir: usa CSS attr selector para evitar lag de
    // accessibility tree ao mudar aria-hidden de "true" para "false"
    await this.page.waitForSelector(
      'aside[aria-label="Carrinho de compras"][aria-hidden="false"]',
      { state: 'visible', timeout: 5_000 },
    )
  }

  async selectKit(quantity: number) {
    await this.kitOption(quantity).click()
  }

  async getPriceText(): Promise<string> {
    const el = this.page.getByTestId('product-current-price')
    return (await el.textContent()) ?? ''
  }

  async scrollToReviews() {
    await this.reviewsSection.scrollIntoViewIfNeeded()
  }

  // ── Assertions ────────────────────────────────────────────────────────────

  async assertLoaded(expectedSlug?: string) {
    await expect(this.productTitle).toBeVisible()
    await expect(this.addToCartButton).toBeVisible()
    await expect(this.stockStatus).toBeVisible()
    if (expectedSlug) {
      await expect(this.page).toHaveURL(new RegExp(expectedSlug))
    }
  }

  async assertHasKitSelector() {
    await expect(this.kitSelector).toBeVisible()
    await expect(this.kitBaseOption).toBeVisible()
  }

  async assertJsonLd() {
    const scripts = await this.page.locator('script[type="application/ld+json"]').all()
    expect(scripts.length).toBeGreaterThanOrEqual(2) // Product + BreadcrumbList
  }
}
