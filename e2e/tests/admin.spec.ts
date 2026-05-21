/**
 * Testes E2E — Painel Administrativo
 *
 * Fluxos: dashboard, CRUD de produtos, CRUD de cupons, CRUD de banners, pedidos.
 * Requer E2E_ADMIN_EMAIL e E2E_ADMIN_PASSWORD configurados.
 */
import { test, expect } from '../fixtures/fixtures'
import { AdminPage } from '../pages/AdminPage'
import { AuthPage } from '../pages/AuthPage'

const E2E_PREFIX = `[E2E-${Date.now()}]`

// Login admin antes de cada teste neste describe
async function loginAdmin(page: import('@playwright/test').Page) {
  const email    = process.env.E2E_ADMIN_EMAIL
  const password = process.env.E2E_ADMIN_PASSWORD
  if (!email || !password) {
    test.skip(true, 'E2E_ADMIN_EMAIL/PASSWORD não definidos — testes admin pulados')
    return false
  }
  await page.addInitScript(() => {
    localStorage.setItem('metalab_cookie_consent', 'all')
  })
  const auth = new AuthPage(page)
  await auth.gotoAdminLogin()
  await auth.adminLogin(email, password)
  return true
}

test.describe('Admin — Dashboard', () => {
  test('deve carregar o dashboard com métricas', async ({ page }) => {
    const ok = await loginAdmin(page)
    if (!ok) return

    const admin = new AdminPage(page)
    await admin.assertDashboardLoaded()
  })

  test('deve exibir cards de KPI (receita, pedidos, etc.)', async ({ page }) => {
    const ok = await loginAdmin(page)
    if (!ok) return

    await expect(
      page.locator('text=/receita|pedidos|clientes|ticket médio/i').first()
    ).toBeVisible({ timeout: 10_000 })
  })

  test('sidebar deve ter links de navegação', async ({ page }) => {
    const ok = await loginAdmin(page)
    if (!ok) return

    await expect(page.getByRole('link', { name: /produtos/i }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: /pedidos/i }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: /cupons/i }).first()).toBeVisible()
  })
})

test.describe('Admin — Produtos', () => {
  test('deve carregar a listagem de produtos', async ({ page }) => {
    const ok = await loginAdmin(page)
    if (!ok) return

    const admin = new AdminPage(page)
    await admin.navigateTo('produtos')
    await admin.assertProductsLoaded()
  })

  test('deve exibir produtos na tabela', async ({ page }) => {
    const ok = await loginAdmin(page)
    if (!ok) return

    const admin = new AdminPage(page)
    await admin.navigateTo('produtos')
    // Aguarda pelo menos um produto carregar
    await page.waitForFunction(
      () => document.querySelectorAll('tr').length > 1 || document.querySelectorAll('[class*="row"]').length > 0,
      { timeout: 10_000 }
    )
    const rows = page.locator('tr').filter({ hasText: /R\$/ })
      .or(page.locator('div[class*="row"]').filter({ hasText: /R\$/ }))
    const count = await rows.count()
    expect(count).toBeGreaterThan(0)
  })

  test('deve ter botão para criar novo produto', async ({ page }) => {
    const ok = await loginAdmin(page)
    if (!ok) return

    const admin = new AdminPage(page)
    await admin.navigateTo('produtos')
    await expect(admin.newProductButton).toBeVisible()
  })

  test('deve ter campo de busca de produtos', async ({ page }) => {
    const ok = await loginAdmin(page)
    if (!ok) return

    const admin = new AdminPage(page)
    await admin.navigateTo('produtos')
    await expect(admin.searchInput).toBeVisible()
  })

  test('busca de produtos deve filtrar resultados', async ({ page }) => {
    const ok = await loginAdmin(page)
    if (!ok) return

    const admin = new AdminPage(page)
    await admin.navigateTo('produtos')
    await admin.searchInput.fill('cogniflex')
    await page.waitForTimeout(600)

    // Deve mostrar pelo menos um resultado relacionado
    const hasResult = await page.locator('text=/cogni/i').isVisible().catch(() => false)
    const hasNoResult = await page.locator('text=/nenhum|sem resultado/i').isVisible().catch(() => false)
    expect(hasResult || hasNoResult).toBeTruthy()
  })

  test('modal de criação de produto deve abrir', async ({ page }) => {
    const ok = await loginAdmin(page)
    if (!ok) return

    const admin = new AdminPage(page)
    await admin.navigateTo('produtos')
    await admin.newProductButton.click()

    // Modal deve abrir
    await expect(
      page.locator('[role="dialog"]').or(page.locator('[class*="modal"]'))
    ).toBeVisible({ timeout: 5_000 })
  })

  test('modal de criação deve ter campos de produto', async ({ page }) => {
    const ok = await loginAdmin(page)
    if (!ok) return

    const admin = new AdminPage(page)
    await admin.navigateTo('produtos')
    await admin.newProductButton.click()

    const modal = page.locator('[role="dialog"]').or(page.locator('[class*="Modal"], [class*="modal"]'))
    await expect(modal).toBeVisible({ timeout: 5_000 })

    // Deve ter campos básicos
    const inputs = await modal.locator('input').count()
    expect(inputs).toBeGreaterThan(0)
  })

  test('deve fechar modal ao clicar em cancelar/X', async ({ page }) => {
    const ok = await loginAdmin(page)
    if (!ok) return

    const admin = new AdminPage(page)
    await admin.navigateTo('produtos')
    await admin.newProductButton.click()

    const modal = page.locator('[role="dialog"]').or(page.locator('[class*="Modal"]'))
    await expect(modal).toBeVisible({ timeout: 5_000 })

    // Fecha modal
    const closeBtn = modal.getByRole('button', { name: /fechar|cancelar|×|X/i })
      .or(page.locator('button[aria-label*="fechar"]'))
    await closeBtn.first().click()

    await expect(modal).not.toBeVisible({ timeout: 3_000 })
  })
})

test.describe('Admin — Cupons', () => {
  test('deve carregar a listagem de cupons', async ({ page }) => {
    const ok = await loginAdmin(page)
    if (!ok) return

    const admin = new AdminPage(page)
    await admin.navigateTo('cupons')
    await admin.assertCouponsLoaded()
  })

  test('deve ter botão para criar novo cupom', async ({ page }) => {
    const ok = await loginAdmin(page)
    if (!ok) return

    const admin = new AdminPage(page)
    await admin.navigateTo('cupons')
    await expect(admin.newCouponButton).toBeVisible()
  })

  test('modal de criação de cupom deve abrir', async ({ page }) => {
    const ok = await loginAdmin(page)
    if (!ok) return

    const admin = new AdminPage(page)
    await admin.navigateTo('cupons')
    await admin.newCouponButton.click()

    await expect(
      page.locator('[role="dialog"]').or(page.locator('[class*="Modal"], [class*="modal"]'))
    ).toBeVisible({ timeout: 5_000 })
  })

  test('deve listar cupons existentes', async ({ page }) => {
    const ok = await loginAdmin(page)
    if (!ok) return

    const admin = new AdminPage(page)
    await admin.navigateTo('cupons')
    await page.waitForTimeout(2_000)

    // Pode ter cupons ou mensagem de "nenhum cupom"
    const hasCoupons = await page.locator('text=/%|frete grátis|código/i').first().isVisible().catch(() => false)
    const isEmpty    = await page.locator('text=/nenhum|sem cupons/i').isVisible().catch(() => false)
    expect(hasCoupons || isEmpty).toBeTruthy()
  })
})

test.describe('Admin — Banners', () => {
  test('deve carregar a listagem de banners', async ({ page }) => {
    const ok = await loginAdmin(page)
    if (!ok) return

    const admin = new AdminPage(page)
    await admin.navigateTo('banners')
    await admin.assertBannersLoaded()
  })

  test('deve ter botão para criar novo banner', async ({ page }) => {
    const ok = await loginAdmin(page)
    if (!ok) return

    const admin = new AdminPage(page)
    await admin.navigateTo('banners')
    await expect(admin.newBannerButton).toBeVisible()
  })

  test('modal de banner deve ter campos de título e subtítulo', async ({ page }) => {
    const ok = await loginAdmin(page)
    if (!ok) return

    const admin = new AdminPage(page)
    await admin.navigateTo('banners')
    await admin.newBannerButton.click()

    const modal = page.locator('[role="dialog"]').or(page.locator('[class*="Modal"]'))
    await expect(modal).toBeVisible({ timeout: 5_000 })

    const inputs = await modal.locator('input[type="text"]').count()
    expect(inputs).toBeGreaterThan(0)
  })

  test('deve exibir preview de banner ao criar', async ({ page }) => {
    const ok = await loginAdmin(page)
    if (!ok) return

    const admin = new AdminPage(page)
    await admin.navigateTo('banners')
    await admin.newBannerButton.click()

    const modal = page.locator('[role="dialog"]').or(page.locator('[class*="Modal"]'))
    await expect(modal).toBeVisible({ timeout: 5_000 })

    // O componente BannerPreview deve estar no modal
    const preview = modal.locator('[class*="rounded"]').filter({ has: page.locator('h3') }).first()
    const previewVisible = await preview.isVisible().catch(() => false)
    expect(previewVisible).toBeTruthy()
  })
})

test.describe('Admin — Pedidos', () => {
  test('deve carregar a listagem de pedidos', async ({ page }) => {
    const ok = await loginAdmin(page)
    if (!ok) return

    const admin = new AdminPage(page)
    await admin.navigateTo('pedidos')
    await admin.assertOrdersLoaded()
  })

  test('deve exibir pedidos ou mensagem de lista vazia', async ({ page }) => {
    const ok = await loginAdmin(page)
    if (!ok) return

    const admin = new AdminPage(page)
    await admin.navigateTo('pedidos')
    await page.waitForTimeout(2_000)

    const hasOrders  = await page.locator('text=/MTL-|aguardando|pago/i').first().isVisible().catch(() => false)
    const isEmpty    = await page.locator('text=/nenhum pedido|sem pedidos/i').isVisible().catch(() => false)
    const hasTable   = await page.locator('table, [role="table"]').isVisible().catch(() => false)
    expect(hasOrders || isEmpty || hasTable).toBeTruthy()
  })

  test('deve ter filtros de status de pedido', async ({ page }) => {
    const ok = await loginAdmin(page)
    if (!ok) return

    const admin = new AdminPage(page)
    await admin.navigateTo('pedidos')

    // Deve ter algum filtro ou campo de busca
    const hasFilter = await page.locator('select, [role="combobox"]').first().isVisible().catch(() => false)
    const hasSearch = await page.locator('input[type="text"], input[type="search"]').first().isVisible().catch(() => false)
    expect(hasFilter || hasSearch).toBeTruthy()
  })
})

test.describe('Admin — Proteção de rotas', () => {
  test('deve redirecionar usuário não-admin para login', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('metalab_cookie_consent', 'all')
    })
    // Acessa sem auth
    await page.goto('/admin/produtos')
    await page.waitForLoadState('domcontentloaded')
    expect(page.url()).toContain('admin/login')
  })
})

test.describe('Admin — Avaliações', () => {
  test('deve carregar a listagem de avaliações', async ({ page }) => {
    const ok = await loginAdmin(page)
    if (!ok) return

    await page.goto('/admin/avaliacoes')
    await page.waitForLoadState('domcontentloaded')
    await expect(page).toHaveURL(/\/admin\/avaliacoes/)
    await expect(page.locator('text=/avaliações|reviews/i').first()).toBeVisible({ timeout: 5_000 })
  })
})
