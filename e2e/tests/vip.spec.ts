/**
 * Testes E2E — Programa VIP
 *
 * Fluxos: acesso sem login, acesso com login, exibição de tier, resgate de pontos.
 */
import { test, userTest, expect } from '../fixtures/fixtures'
import { VipPage } from '../pages/VipPage'

test.describe('VIP — Acesso sem login', () => {
  test('deve carregar /vip mesmo sem autenticação', async ({ page }) => {
    const vip = new VipPage(page)
    await vip.goto()
    // Pode redirecionar para login ou mostrar dados mock
    await expect(page).toHaveURL(/vip|login/)
  })

  test('deve exibir prompt de login ou redirecionamento', async ({ page }) => {
    const vip = new VipPage(page)
    await vip.goto()
    await vip.assertLoginRedirectOrPrompt()
  })

  test('deve exibir informações sobre o programa VIP', async ({ page }) => {
    const vip = new VipPage(page)
    await vip.goto()
    // Deve exibir algo sobre os tiers (Silver, Gold, Black)
    const hasTierInfo = await page.locator('text=/silver|gold|black/i').first().isVisible().catch(() => false)
    const hasVipInfo  = await page.locator('text=/vip|cashback|pontos/i').first().isVisible().catch(() => false)
    expect(hasTierInfo || hasVipInfo).toBeTruthy()
  })
})

test.describe('VIP — Acesso com login', () => {
  test('deve exibir dados do usuário logado', async ({ page }) => {
    const email    = process.env.E2E_USER_EMAIL
    const password = process.env.E2E_USER_PASSWORD
    if (!email || !password) test.skip(true, 'E2E_USER_EMAIL/PASSWORD não definidos')

    // Login manual
    await page.addInitScript(() => {
      localStorage.setItem('metalab_cookie_consent', 'all')
    })
    await page.goto('/login')
    await page.getByPlaceholder(/email/i).fill(email!)
    await page.locator('input[type="password"]').fill(password!)
    await page.getByRole('button', { name: /entrar/i }).click()
    await page.waitForURL((url) => !url.pathname.includes('login'), { timeout: 15_000 })

    const vip = new VipPage(page)
    await vip.goto()
    await vip.assertLoggedInView()
  })
})

test.describe('VIP — Estrutura da página', () => {
  test('deve exibir tabela de benefícios por tier', async ({ page }) => {
    const vip = new VipPage(page)
    await vip.goto()
    const hasTiers = await page.locator('text=/silver|gold|black/i').first().isVisible().catch(() => false)
    expect(hasTiers).toBeTruthy()
  })

  test('deve exibir percentuais de cashback', async ({ page }) => {
    const vip = new VipPage(page)
    await vip.goto()
    await expect(page.locator('text=/cashback|%/i').first()).toBeVisible()
  })

  test('deve ter CTA para começar compras', async ({ page }) => {
    const vip = new VipPage(page)
    await vip.goto()
    const cta = page.getByRole('link', { name: /comprar|produtos|começar/i })
      .or(page.getByRole('button', { name: /comprar|produtos/i }))
    const hasCta = await cta.first().isVisible().catch(() => false)
    expect(hasCta).toBeTruthy()
  })
})

test.describe('VIP — Resgate de pontos', () => {
  test('formulário de resgate deve estar visível para usuário logado', async ({ page }) => {
    const email    = process.env.E2E_USER_EMAIL
    const password = process.env.E2E_USER_PASSWORD
    if (!email || !password) test.skip(true, 'E2E_USER_EMAIL/PASSWORD não definidos')

    await page.addInitScript(() => {
      localStorage.setItem('metalab_cookie_consent', 'all')
    })
    await page.goto('/login')
    await page.getByPlaceholder(/email/i).fill(email!)
    await page.locator('input[type="password"]').fill(password!)
    await page.getByRole('button', { name: /entrar/i }).click()
    await page.waitForURL((url) => !url.pathname.includes('login'), { timeout: 15_000 })

    const vip = new VipPage(page)
    await vip.goto()
    await vip.assertRedeemFormVisible()
  })

  test('resgate com pontos insuficientes deve mostrar erro', async ({ page }) => {
    const email    = process.env.E2E_USER_EMAIL
    const password = process.env.E2E_USER_PASSWORD
    if (!email || !password) test.skip(true, 'E2E_USER_EMAIL/PASSWORD não definidos')

    await page.addInitScript(() => {
      localStorage.setItem('metalab_cookie_consent', 'all')
    })
    await page.goto('/login')
    await page.getByPlaceholder(/email/i).fill(email!)
    await page.locator('input[type="password"]').fill(password!)
    await page.getByRole('button', { name: /entrar/i }).click()
    await page.waitForURL((url) => !url.pathname.includes('login'), { timeout: 15_000 })

    const vip = new VipPage(page)
    await vip.goto()

    const redeemInput = page.locator('input[type="number"]').first()
    const inputVisible = await redeemInput.isVisible().catch(() => false)
    if (!inputVisible) test.skip(true, 'Input de resgate não encontrado')

    // Tenta resgatar mais pontos do que possível
    await redeemInput.fill('999999')
    const redeemBtn = page.getByRole('button', { name: /resgatar/i })
    await redeemBtn.click()
    await page.waitForTimeout(2_000)

    // Deve mostrar erro
    await expect(
      page.locator('text=/insuficientes|mínimo|erro|inválido/i').first()
    ).toBeVisible({ timeout: 5_000 })
  })
})
