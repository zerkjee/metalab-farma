import { Page, expect } from '@playwright/test'

export class AuthPage {
  constructor(readonly page: Page) {}

  // ── Login ─────────────────────────────────────────────────────────────────

  async gotoLogin() {
    await this.page.goto('/login')
    await this.page.waitForLoadState('domcontentloaded')
  }

  async gotoRegister() {
    await this.page.goto('/registro')
    await this.page.waitForLoadState('domcontentloaded')
  }

  async gotoAdminLogin() {
    await this.page.goto('/admin/login')
    await this.page.waitForLoadState('domcontentloaded')
  }

  // ── Locators — Login ──────────────────────────────────────────────────────

  get loginEmailInput()    { return this.page.getByPlaceholder(/seu@email/i) }
  get loginPasswordInput() { return this.page.locator('input[type="password"]').first() }
  get loginSubmitButton()  { return this.page.getByRole('button', { name: /entrar/i }) }
  get loginErrorMessage()  { return this.page.locator('[id="login-error"], text=/email ou senha inválidos/i') }
  get loginLink()          { return this.page.getByRole('link', { name: /entrar|login/i }) }
  get registerLink()       { return this.page.getByRole('link', { name: /criar conta|cadastro|registr/i }) }

  // ── Locators — Registro ───────────────────────────────────────────────────

  get regNameInput()     { return this.page.getByPlaceholder(/nome completo|nome/i).first() }
  get regEmailInput()    { return this.page.getByPlaceholder(/email/i).first() }
  get regCpfInput()      { return this.page.getByPlaceholder(/cpf|000\.000/i) }
  get regPhoneInput()    { return this.page.getByPlaceholder(/telefone|\(11\)/i) }
  get regPasswordInput() { return this.page.locator('input[type="password"]').first() }
  get regSubmitButton()  { return this.page.getByRole('button', { name: /criar conta|cadastrar|registrar/i }) }
  get regSuccessIndicator() { return this.page.locator('text=/conta criada|bem-vindo|entrando/i') }
  get regErrorMessage()  { return this.page.locator('text=/erro|já cadastrado|inválido/i') }

  // Indicadores de força de senha
  get passwordRequirements() { return this.page.locator('text=/mínimo 8|maiúscula|minúscula|número|caractere especial/i') }

  // ── Logout ────────────────────────────────────────────────────────────────

  get userMenuButton()  { return this.page.locator('header button').filter({ hasText: /^[A-Z]$/ }) }
  get logoutButton()    { return this.page.getByRole('button', { name: /sair/i }) }

  // ── Actions ───────────────────────────────────────────────────────────────

  async login(email: string, password: string) {
    await this.loginEmailInput.fill(email)
    await this.loginPasswordInput.fill(password)
    await this.loginSubmitButton.click()
  }

  async loginExpectSuccess(email: string, password: string) {
    await this.login(email, password)
    await this.page.waitForURL((url) => !url.pathname.includes('login'), { timeout: 15_000 })
  }

  async loginExpectError(email: string, password: string) {
    await this.login(email, password)
    await expect(this.loginErrorMessage).toBeVisible({ timeout: 5_000 })
  }

  async register(data: { name: string; email: string; cpf: string; phone: string; password: string }) {
    await this.regNameInput.fill(data.name)
    await this.regEmailInput.fill(data.email)
    await this.regCpfInput.fill(data.cpf)
    await this.regPhoneInput.fill(data.phone)
    await this.regPasswordInput.fill(data.password)
    await this.regSubmitButton.click()
  }

  async logout() {
    await this.userMenuButton.hover()
    await this.logoutButton.click()
    await this.page.waitForLoadState('domcontentloaded')
  }

  async adminLogin(email: string, password: string) {
    await this.page.getByPlaceholder(/email/i).fill(email)
    await this.page.locator('input[type="password"]').fill(password)
    await this.page.getByRole('button', { name: /entrar/i }).click()
    await this.page.waitForURL('**/admin', { timeout: 15_000 })
  }

  // ── Assertions ────────────────────────────────────────────────────────────

  async assertLoginPage() {
    await expect(this.loginEmailInput).toBeVisible()
    await expect(this.loginPasswordInput).toBeVisible()
    await expect(this.loginSubmitButton).toBeVisible()
  }

  async assertRegisterPage() {
    await expect(this.regNameInput).toBeVisible()
    await expect(this.regEmailInput).toBeVisible()
    await expect(this.regPasswordInput).toBeVisible()
  }

  async assertLoggedIn(name?: string) {
    // Header mostra inicial do nome do usuário ou avatar
    await expect(
      this.page.locator('header').locator('button, a').filter({ hasText: name ? new RegExp(name[0], 'i') : /^[A-Z]$/ })
    ).toBeVisible({ timeout: 5_000 })
  }

  async assertLoggedOut() {
    await expect(this.page.getByRole('link', { name: /entrar/i })).toBeVisible({ timeout: 5_000 })
  }
}
