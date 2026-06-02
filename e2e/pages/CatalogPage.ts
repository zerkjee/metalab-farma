import { Page, expect } from "@playwright/test"

export class CatalogPage {
  constructor(readonly page: Page) {}

  async goto() {
    await this.page.goto("/produtos")
    await this.page.waitForLoadState("load")
  }

  // ── Locators ──────────────────────────────────────────────────────────────

  get heading() {
    return this.page.getByRole("heading", { name: /produtos metalab/i })
  }
  get grid() {
    return this.page.locator('[data-testid="catalog-grid"]')
  }
  get productCards() {
    return this.page.locator('[data-testid="catalog-grid"] > div')
  }
  get searchInput() {
    return this.page.locator('[data-testid="catalog-search"]')
  }
  get sortSelect() {
    return this.page.locator('[data-testid="sort-select"]').filter({ visible: true }).first()
  }
  get loadMoreBtn() {
    return this.page.locator('[data-testid="load-more"]')
  }
  get clearFiltersBtn() {
    return this.page
      .locator('[data-testid="clear-filters"], [data-testid="clear-filters-desktop"]')
      .filter({ visible: true })
      .first()
  }
  get mobileFilterToggle() {
    return this.page.locator('[data-testid="toggle-filters-mobile"]')
  }
  get emptyState() {
    return this.page.locator('[data-testid="empty-state"]')
  }

  categoryBtn(slug: string) {
    return this.page.locator(`[data-testid="filter-category-${slug}"]`)
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  async waitForProducts() {
    // Aguarda grid E input interativos (React hidratado)
    await this.page.waitForFunction(
      () =>
        document.querySelector('[data-testid="catalog-grid"]') !== null &&
        document.querySelector('[data-testid="catalog-search"]') !== null,
      { timeout: 15_000 }
    )
    await this.searchInput.waitFor({ state: "visible" })
  }

  async search(term: string) {
    // Usa fill() para limpar + pressSequentially para digitar (mais confiável com React 19)
    await this.searchInput.fill("")
    if (term) {
      await this.searchInput.pressSequentially(term, { delay: 30 })
    }
  }

  async filterByCategory(slug: string) {
    await this.categoryBtn(slug).click()
  }

  async clearFilters() {
    await this.clearFiltersBtn.click()
  }

  async clickFirstProduct() {
    const link = this.grid.locator('a[href*="/produtos/"]').first()
    await Promise.all([
      this.page.waitForURL(/\/produtos\/.+/, { waitUntil: "domcontentloaded" }),
      link.click(),
    ])
  }

  async getFirstProductSlug(): Promise<string | null> {
    const link = this.grid.locator('a[href*="/produtos/"]').first()
    const href = await link.getAttribute("href")
    return href?.split("/produtos/")[1] ?? null
  }

  async addFirstProductToCart() {
    const btn = this.grid
      .getByRole("button", { name: /adicionar ao carrinho/i })
      .first()
    await btn.click()
  }

  // ── Assertions ─────────────────────────────────────────────────────────────

  async assertLoaded() {
    await expect(this.page).toHaveTitle(/produtos.*metalab|metalab.*produtos/i)
    await expect(this.heading).toBeVisible()
  }

  async assertHasProducts() {
    await expect(this.grid).toBeVisible()
    const count = await this.productCards.count()
    expect(count).toBeGreaterThan(0)
  }

  async assertProductCount(expected: number) {
    const count = await this.productCards.count()
    expect(count).toBe(expected)
  }
}
