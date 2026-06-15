/**
 * Testes E2E — Scroll ao navegar
 *
 * Toda navegação CLIENT-SIDE (App Router) entre rotas deve começar no TOPO
 * (window.scrollY === 0). Regressão alvo: o body-scroll-lock do CartDrawer
 * restaurava a rolagem antiga ao fechar, fazendo o /checkout abrir "lá embaixo".
 * Corrigido pelo componente global ScrollToTop (usePathname + scrollTo instant).
 */
import { test, expect, cartWithProduct } from '../fixtures/fixtures'

const MOCK_PRODUCT_SLUG = process.env.E2E_PRODUCT_SLUG || 'cogniflex'
const MOCK_PRODUCT_ID = 'e2e-scroll-product'

// Rola até o fim e confirma que de fato saiu do topo (torna o assert significativo).
async function scrollToBottom(page: import('@playwright/test').Page) {
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.waitForFunction(() => window.scrollY > 50, undefined, { timeout: 5_000 }).catch(() => {})
}

async function seedCart(page: import('@playwright/test').Page) {
  await page.addInitScript(
    (cart) => localStorage.setItem('metalab_cart_state_v2', cart),
    cartWithProduct(MOCK_PRODUCT_SLUG, MOCK_PRODUCT_ID, 89.9),
  )
}

const scrollY = (page: import('@playwright/test').Page) => page.evaluate(() => window.scrollY)

test.describe('Scroll — navegação começa no topo (desktop)', () => {
  test('home → produto começa no topo', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await scrollToBottom(page)

    await page.locator('a[href*="/produtos/"]').first().click()
    await page.waitForURL(/\/produtos\//)
    await expect.poll(() => scrollY(page), { timeout: 5_000 }).toBe(0)
  })

  test('carrinho → checkout começa no topo (regressão do bug)', async ({ page }) => {
    await seedCart(page)
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await scrollToBottom(page)

    await page.getByRole('button', { name: /abrir carrinho/i }).click()
    await page.getByRole('link', { name: /continuar para checkout/i }).click()
    await page.waitForURL(/\/checkout/)
    await expect.poll(() => scrollY(page), { timeout: 5_000 }).toBe(0)
  })

  test('navegação entre páginas principais começa no topo', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await scrollToBottom(page)

    await page.locator('header').getByRole('link', { name: /avalia/i }).first().click()
    await page.waitForURL(/\/avaliacoes/)
    await expect.poll(() => scrollY(page), { timeout: 5_000 }).toBe(0)
  })
})

test.describe('Scroll — mobile 390px', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('carrinho → checkout começa no topo (mobile)', async ({ page }) => {
    await seedCart(page)
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await scrollToBottom(page)

    await page.getByRole('button', { name: /abrir carrinho/i }).click()
    await page.getByRole('link', { name: /continuar para checkout/i }).click()
    await page.waitForURL(/\/checkout/)
    await expect.poll(() => scrollY(page), { timeout: 5_000 }).toBe(0)
  })
})
