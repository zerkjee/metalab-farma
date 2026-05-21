import { Page, expect } from '@playwright/test'

export class VipPage {
  constructor(readonly page: Page) {}

  async goto() {
    await this.page.goto('/vip')
    await this.page.waitForLoadState('domcontentloaded')
  }

  // ── Locators ──────────────────────────────────────────────────────────────

  get tierBadge()           { return this.page.locator('text=/silver|gold|black/i').first() }
  get pointsDisplay()       { return this.page.locator('text=/pontos/i').first() }
  get redeemSection()       { return this.page.locator('text=/resgatar|resgate/i').first() }
  get redeemInput()         { return this.page.locator('input[type="number"], input[placeholder*="pontos"]').first() }
  get redeemButton()        { return this.page.getByRole('button', { name: /resgatar/i }) }
  get redeemSuccess()       { return this.page.locator('text=/resgatado|cupom gerado|sucesso/i') }
  get redeemError()         { return this.page.locator('text=/pontos insuficientes|erro|inválido/i') }
  get ordersSection()       { return this.page.locator('text=/pedidos recentes|histórico/i').first() }
  get loginPrompt()         { return this.page.locator('text=/faça login|entrar|acesso/i').first() }
  get cashbackInfo()        { return this.page.locator('text=/cashback|desconto/i').first() }

  // ── Assertions ────────────────────────────────────────────────────────────

  async assertLoggedInView() {
    await expect(this.tierBadge.or(this.pointsDisplay)).toBeVisible({ timeout: 5_000 })
  }

  async assertLoginRedirectOrPrompt() {
    // Pode redirecionar para /login ou mostrar um prompt de login na própria página
    const isLoginPage = this.page.url().includes('/login')
    const hasLoginPrompt = await this.loginPrompt.isVisible().catch(() => false)
    expect(isLoginPage || hasLoginPrompt).toBeTruthy()
  }

  async assertRedeemFormVisible() {
    await expect(this.redeemSection).toBeVisible()
  }
}
