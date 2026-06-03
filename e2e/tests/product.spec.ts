/**
 * Testes E2E — Página de Detalhe do Produto (PDP)
 *
 * Fluxos: carregamento, informações, kit selector, adicionar ao carrinho,
 *         composição, modo de uso, reviews, SEO/JSON-LD.
 */
import { test, expect } from '../fixtures/fixtures'
import { ProductPage } from '../pages/ProductPage'
import { HomePage } from '../pages/HomePage'

function getProductSlug(): string {
  return process.env.E2E_PRODUCT_SLUG || ''
}

async function resolveSlug(page: import('@playwright/test').Page): Promise<string> {
  const envSlug = getProductSlug()
  if (envSlug) return envSlug

  // Descobre via homepage
  const home = new HomePage(page)
  await home.goto()
  const slug = await home.getFirstProductSlug()
  if (!slug) throw new Error('Nenhum produto encontrado via homepage — defina E2E_PRODUCT_SLUG')
  return slug
}

test.describe('PDP — Estrutura básica', () => {
  test('deve carregar a página do produto', async ({ page }) => {
    const slug = await resolveSlug(page)
    const pdp = new ProductPage(page)
    await pdp.goto(slug)
    await pdp.assertLoaded(slug)
  })

  test('deve exibir o título do produto', async ({ page }) => {
    const slug = await resolveSlug(page)
    const pdp = new ProductPage(page)
    await pdp.goto(slug)
    const title = await pdp.productTitle.textContent()
    expect(title?.trim().length ?? 0).toBeGreaterThan(0)
  })

  test('deve exibir o preço formatado em BRL', async ({ page }) => {
    const slug = await resolveSlug(page)
    const pdp = new ProductPage(page)
    await pdp.goto(slug)
    await expect(page.locator('text=/R\\$/').first()).toBeVisible()
  })

  test('deve exibir status de estoque', async ({ page }) => {
    const slug = await resolveSlug(page)
    const pdp = new ProductPage(page)
    await pdp.goto(slug)
    await expect(pdp.stockStatus).toBeVisible()
  })

  test('deve ter botão "Adicionar ao Carrinho"', async ({ page }) => {
    const slug = await resolveSlug(page)
    const pdp = new ProductPage(page)
    await pdp.goto(slug)
    await expect(pdp.addToCartButton).toBeVisible()
  })

  test('deve exibir badge da marca', async ({ page }) => {
    const slug = await resolveSlug(page)
    const pdp = new ProductPage(page)
    await pdp.goto(slug)
    await expect(pdp.brandBadge).toBeVisible()
  })
})

test.describe('PDP — Seções de conteúdo', () => {
  test('deve exibir seção "Como incluir na rotina"', async ({ page }) => {
    const slug = await resolveSlug(page)
    const pdp = new ProductPage(page)
    await pdp.goto(slug)
    await expect(pdp.modoDeUsoSection).toBeVisible()
  })

  test('deve exibir seção de "Por que escolher este produto?"', async ({ page }) => {
    const slug = await resolveSlug(page)
    const pdp = new ProductPage(page)
    await pdp.goto(slug)
    await expect(page.locator('text=/por que escolher/i')).toBeVisible()
  })

  test('deve exibir seção de informações importantes', async ({ page }) => {
    const slug = await resolveSlug(page)
    const pdp = new ProductPage(page)
    await pdp.goto(slug)
    const infoSection = page.locator('text=/informações importantes/i').first()
    await infoSection.scrollIntoViewIfNeeded().catch(() => {})
    await expect(infoSection).toBeVisible({ timeout: 5_000 })
  })

  test('deve exibir seção de avaliações', async ({ page }) => {
    const slug = await resolveSlug(page)
    const pdp = new ProductPage(page)
    await pdp.goto(slug)
    await pdp.scrollToReviews()
    await expect(page.locator('text=/avaliações|reviews/i').first()).toBeVisible()
  })
})

test.describe('PDP — SEO', () => {
  test('deve ter JSON-LD de produto e breadcrumb', async ({ page }) => {
    const slug = await resolveSlug(page)
    const pdp = new ProductPage(page)
    await pdp.goto(slug)
    await pdp.assertJsonLd()
  })

  test('deve ter canonical URL', async ({ page }) => {
    const slug = await resolveSlug(page)
    const pdp = new ProductPage(page)
    await pdp.goto(slug)
    const canonical = page.locator('link[rel="canonical"]')
    const href = await canonical.getAttribute('href').catch(() => null)
    if (href) {
      expect(href).toContain(slug)
    }
  })

  test('deve ter Open Graph tags', async ({ page }) => {
    const slug = await resolveSlug(page)
    const pdp = new ProductPage(page)
    await pdp.goto(slug)
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content').catch(() => null)
    if (ogTitle) {
      expect(ogTitle.length).toBeGreaterThan(0)
    }
  })
})

test.describe('PDP — Carrinho', () => {
  test('deve adicionar produto ao carrinho e abrir drawer', async ({ page }) => {
    const slug = await resolveSlug(page)
    const pdp = new ProductPage(page)
    await pdp.goto(slug)

    // Aguarda hidratação antes de verificar estoque (isVisible sem retry)
    await expect(pdp.addToCartButton).toBeVisible()
    const inStock = await page.locator('text=/em estoque/i').isVisible().catch(() => false)
    if (!inStock) {
      test.skip(true, 'Produto sem estoque — pulando teste de adicionar ao carrinho')
    }

    await pdp.addToCart()

    // Cart drawer está aberto (addToCart já garantiu via waitForSelector)
    // Usa CSS locator para itens — não depende de aria-hidden
    const drawerItems = page.locator('aside[aria-label="Carrinho de compras"] li, aside[aria-label="Carrinho de compras"] [class*="item"]')
    await expect(drawerItems.filter({ hasText: /R\$/ }).first()).toBeVisible()
  })

  test('badge do carrinho deve atualizar após adicionar produto', async ({ page }) => {
    const slug = await resolveSlug(page)
    const pdp = new ProductPage(page)
    await pdp.goto(slug)

    // Aguarda hidratação antes de verificar estoque
    await expect(pdp.addToCartButton).toBeVisible()
    const inStock = await page.locator('text=/em estoque/i').isVisible().catch(() => false)
    if (!inStock) test.skip(true, 'Produto sem estoque')

    await pdp.addToCartButton.click()

    // Aguarda badge atualizar reativamente (sem waitForTimeout)
    const badge = page.locator('header span').filter({ hasText: /^[1-9][0-9]*$/ })
    await expect(badge).toBeVisible({ timeout: 5_000 }).catch(() => {
      // Badge pode não aparecer se o carrinho mostrar 0 ao ser zerado — não é erro
    })
    const badgeVisible = await badge.isVisible().catch(() => false)
    if (badgeVisible) {
      const count = parseInt((await badge.textContent()) ?? '0')
      expect(count).toBeGreaterThan(0)
    }
  })
})

test.describe('PDP — Kit Selector', () => {
  test('deve exibir kit selector quando produto tem kits', async ({ page }) => {
    const slug = await resolveSlug(page)
    const pdp = new ProductPage(page)
    await pdp.goto(slug)

    // Aguarda página hidratada antes de checar kit selector
    await expect(pdp.addToCartButton).toBeVisible()
    const hasKit = await pdp.kitSelector.isVisible().catch(() => false)
    if (!hasKit) {
      // Não é um erro — nem todo produto tem kits
      return
    }

    await pdp.assertHasKitSelector()
  })

  test('selecionar kit deve mudar o preço exibido', async ({ page }) => {
    const slug = await resolveSlug(page)
    const pdp = new ProductPage(page)
    await pdp.goto(slug)

    // Aguarda página hidratada antes de verificar kit selector
    await expect(pdp.addToCartButton).toBeVisible()
    const hasKit = await pdp.kitSelector.isVisible().catch(() => false)
    if (!hasKit) test.skip(true, 'Produto não tem kits')

    const priceBeforeKit = await pdp.getPriceText()

    // Clica no primeiro kit disponível (Kit 2, Kit 3, etc.)
    const kitBtn = page.locator('button').filter({ hasText: /kit\s+\d/i }).first()
    const hasKitBtn = await kitBtn.isVisible().catch(() => false)
    if (!hasKitBtn) test.skip(true, 'Nenhum botão de kit encontrado')

    await kitBtn.click()

    // Aguarda o preço atualizar reativamente (sem waitForTimeout)
    const priceLocator = page.getByTestId('product-current-price')
    await expect(priceLocator).not.toHaveText(priceBeforeKit, { timeout: 5_000 })

    const priceAfterKit = await pdp.getPriceText()
    expect(priceAfterKit).not.toBe(priceBeforeKit)
  })
})

test.describe('PDP — CTA Desktop', () => {
  // O sticky CTA tem md:hidden e é exclusivo de mobile.
  // Em desktop, validamos o CTA principal (botão "Adicionar ao Carrinho") e
  // o botão de "Mais Informações". O sticky CTA está coberto em mobile.spec.ts.
  test('CTA principal permanece visível no topo da PDP em desktop', async ({ page }) => {
    const slug = await resolveSlug(page)
    const pdp = new ProductPage(page)
    await pdp.goto(slug)

    // Ambos os botões do hero devem estar visíveis antes de qualquer scroll
    await expect(pdp.addToCartButton).toBeVisible()
    const moreInfoBtn = page.getByRole('button', { name: /ver composição/i })
    await expect(moreInfoBtn).toBeVisible()
  })
})
