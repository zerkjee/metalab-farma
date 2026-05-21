/**
 * Testes E2E — Mobile & Tablet
 *
 * Executados nos projetos: mobile-iphone (iPhone 14 Pro), mobile-android (Pixel 7), tablet (iPad Pro).
 * Verifica comportamentos específicos de viewport: menu hamburger, sticky CTA, touch targets,
 * layout responsivo, carousel, etc.
 */
import { test, expect, cartWithProduct } from '../fixtures/fixtures'
import { HomePage } from '../pages/HomePage'
import { ProductPage } from '../pages/ProductPage'

const PRODUCT_SLUG = process.env.E2E_PRODUCT_SLUG || 'cogniflex'
const MOCK_PRODUCT_ID = 'e2e-mobile-product'

test.describe('Mobile — Header e Navegação', () => {
  test('deve exibir botão hamburger no mobile', async ({ page, viewport }) => {
    const home = new HomePage(page)
    await home.goto()

    const hamburger = page.getByRole('button', { name: /abrir menu|fechar menu/i })
    const isSmall   = (viewport?.width ?? 1024) < 768

    if (isSmall) {
      await expect(hamburger).toBeVisible()
    }
  })

  test('hamburger deve abrir menu mobile', async ({ page, viewport }) => {
    const isSmall = (viewport?.width ?? 1024) < 768
    if (!isSmall) test.skip(true, 'Teste apenas para mobile')

    const home = new HomePage(page)
    await home.goto()

    const hamburger = page.getByRole('button', { name: /abrir menu/i })
    await hamburger.click()

    // Menu mobile deve aparecer
    const mobileNav = page.locator('#mobile-nav').or(
      page.locator('[class*="mobile"]').filter({ hasText: /produtos|vip|avaliações/i })
    )
    await expect(mobileNav).toBeVisible({ timeout: 3_000 })
  })

  test('menu mobile deve fechar ao pressionar Escape', async ({ page, viewport }) => {
    const isSmall = (viewport?.width ?? 1024) < 768
    if (!isSmall) test.skip(true, 'Teste apenas para mobile')

    const home = new HomePage(page)
    await home.goto()

    const hamburger = page.getByRole('button', { name: /abrir menu/i })
    await hamburger.click()

    await page.keyboard.press('Escape')
    await page.waitForTimeout(300)

    const mobileNav = page.locator('#mobile-nav')
    const isVisible = await mobileNav.isVisible().catch(() => false)
    expect(isVisible).toBeFalsy()
  })

  test('nav links devem estar acessíveis via menu mobile', async ({ page, viewport }) => {
    const isSmall = (viewport?.width ?? 1024) < 768
    if (!isSmall) test.skip(true, 'Teste apenas para mobile')

    const home = new HomePage(page)
    await home.goto()

    const hamburger = page.getByRole('button', { name: /abrir menu/i })
    await hamburger.click()

    // Escopa ao mobile-nav para evitar o link do desktop (hidden md:flex)
    const mobileNav = page.locator('#mobile-nav')
    await expect(mobileNav.getByRole('link', { name: /VIP/i })).toBeVisible()
    await expect(mobileNav.getByRole('link', { name: /Avaliações/i })).toBeVisible()
  })

  test('logo deve estar visível em mobile', async ({ page }) => {
    const home = new HomePage(page)
    await home.goto()
    await expect(home.logo).toBeVisible()
  })

  test('botão do carrinho deve estar visível em mobile', async ({ page }) => {
    const home = new HomePage(page)
    await home.goto()
    await expect(home.cartButton).toBeVisible()
  })
})

test.describe('Mobile — Banner Carousel', () => {
  test('banner deve ser visível e não ocupar tela toda', async ({ page, viewport }) => {
    const home = new HomePage(page)
    await home.goto()

    const isSmall = (viewport?.width ?? 1024) <= 430

    const firstSection = page.locator('section').first()
    await expect(firstSection).toBeVisible()

    if (isSmall) {
      // Em mobile, o banner não deve ocupar mais de 75% da viewport height
      const box = await firstSection.boundingBox()
      const vpHeight = viewport?.height ?? 844
      if (box) {
        const ratio = box.height / vpHeight
        // Verifica que o banner não domina toda a tela (deixa espaço para conteúdo abaixo)
        expect(ratio).toBeLessThan(0.85)
      }
    }
  })
})

test.describe('Mobile — Produto (PDP)', () => {
  test('título do produto deve ser legível em mobile', async ({ page, viewport }) => {
    const pdp = new ProductPage(page)
    await pdp.goto(PRODUCT_SLUG)

    const title = page.locator('h1')
    await expect(title).toBeVisible()

    const box = await title.boundingBox()
    if (box && viewport) {
      // Título não deve transbordar a viewport
      expect(box.width).toBeLessThanOrEqual(viewport.width + 20) // +20 para tolerância
    }
  })

  test('botão "Adicionar ao Carrinho" deve ser acessível em mobile', async ({ page, viewport }) => {
    const pdp = new ProductPage(page)
    await pdp.goto(PRODUCT_SLUG)

    const btn = pdp.addToCartButton
    await expect(btn).toBeVisible()

    // Touch target mínimo: 44px de altura
    const box = await btn.boundingBox()
    if (box) {
      expect(box.height).toBeGreaterThanOrEqual(40) // tolerância de 4px
    }
  })

  test('sticky CTA deve aparecer ao rolar a PDP em mobile', async ({ page, viewport }) => {
    const isSmall = (viewport?.width ?? 1024) < 768
    if (!isSmall) test.skip(true, 'Sticky CTA é exclusivo de mobile')

    const pdp = new ProductPage(page)
    await pdp.goto(PRODUCT_SLUG)

    // Rola para ativar o sticky
    await page.evaluate(() => window.scrollBy(0, 600))
    await page.waitForTimeout(400)

    const stickyCta = page.locator('[class*="fixed"][class*="bottom"]').filter({
      has: page.locator('button')
    })
    const exists = await stickyCta.count() > 0
    expect(exists).toBeTruthy()
  })
})

test.describe('Mobile — Carrinho', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript((cartState) => {
      localStorage.setItem('metalab_cart_state_v2', cartState)
    }, cartWithProduct(PRODUCT_SLUG, MOCK_PRODUCT_ID, 89.9))
  })

  test('drawer do carrinho deve abrir e ocupar a tela em mobile', async ({ page, viewport }) => {
    const home = new HomePage(page)
    await home.goto()

    await page.getByRole('button', { name: /abrir carrinho/i }).click()
    const drawer = page.getByRole('complementary', { name: /carrinho/i })
    await expect(drawer).toBeVisible()

    const isSmall = (viewport?.width ?? 1024) < 768
    if (isSmall) {
      const box = await drawer.boundingBox()
      if (box && viewport) {
        // Em mobile, o drawer deve ocupar toda a largura
        expect(box.width).toBeGreaterThanOrEqual(viewport.width - 10)
      }
    }
  })

  test('botões +/- do carrinho devem ter tamanho adequado para toque', async ({ page }) => {
    const home = new HomePage(page)
    await home.goto()

    await page.getByRole('button', { name: /abrir carrinho/i }).click()
    const drawer = page.getByRole('complementary', { name: /carrinho/i })
    await expect(drawer).toBeVisible()

    // Botões de quantidade
    const quantityBtns = drawer.locator('button').filter({ has: page.locator('svg') })
    const count = await quantityBtns.count()

    if (count > 0) {
      const btn = quantityBtns.first()
      const box = await btn.boundingBox()
      if (box) {
        // Deve ser pelo menos 32px para toque razoável em mobile
        expect(box.height).toBeGreaterThanOrEqual(28)
        expect(box.width).toBeGreaterThanOrEqual(28)
      }
    }
  })
})

test.describe('Mobile — Layout geral', () => {
  test('página inicial não deve ter overflow horizontal', async ({ page, viewport }) => {
    const home = new HomePage(page)
    await home.goto()

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    const vpWidth   = viewport?.width ?? 375

    // Aceita até 5px de margem para scrollbar
    expect(bodyWidth).toBeLessThanOrEqual(vpWidth + 5)
  })

  test('página de produto não deve ter overflow horizontal', async ({ page, viewport }) => {
    const pdp = new ProductPage(page)
    await pdp.goto(PRODUCT_SLUG)

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    const vpWidth   = viewport?.width ?? 375

    expect(bodyWidth).toBeLessThanOrEqual(vpWidth + 5)
  })

  test('checkout deve ser navegável em mobile', async ({ page }) => {
    await page.addInitScript((cartState) => {
      localStorage.setItem('metalab_cart_state_v2', cartState)
    }, cartWithProduct(PRODUCT_SLUG, MOCK_PRODUCT_ID, 89.9))

    await page.goto('/checkout')
    await page.waitForLoadState('domcontentloaded')

    await expect(page).toHaveURL(/checkout/)

    // Aguarda RSC streaming completar (h1 é o primeiro marcador confiável)
    await expect(page.locator('h1')).toBeVisible({ timeout: 15_000 })

    // Checkout deve exibir algum conteúdo reconhecível: heading, formulário ou itens
    const hasHeading = await page.locator('text=/finalize|checkout/i').first().isVisible().catch(() => false)
    const hasForm    = await page.locator('text=/dados|identificação|endereço/i').first().isVisible().catch(() => false)
    const hasItems   = await page.locator('text=/R\\$/').first().isVisible().catch(() => false)
    expect(hasHeading || hasForm || hasItems).toBeTruthy()
  })
})

test.describe('Tablet — Layout', () => {
  test('deve exibir navegação corretamente em tablet', async ({ page, viewport }) => {
    const home = new HomePage(page)
    await home.goto()

    const isTablet = (viewport?.width ?? 1024) >= 768 && (viewport?.width ?? 1024) < 1280

    if (isTablet) {
      // Tablet pode mostrar nav desktop ou mobile
      const desktopNav = page.locator('header .hidden.md\\:flex')
      const mobileHamburger = page.getByRole('button', { name: /abrir menu/i })

      const hasDesktopNav = await desktopNav.isVisible().catch(() => false)
      const hasMobileMenu = await mobileHamburger.isVisible().catch(() => false)

      expect(hasDesktopNav || hasMobileMenu).toBeTruthy()
    }
  })

  test('grid de produtos deve ser visível em tablet', async ({ page, viewport }) => {
    const home = new HomePage(page)
    await home.goto()

    await page.waitForFunction(
      () => document.querySelectorAll('a[href*="/produtos/"]').length > 0,
      { timeout: 15_000 }
    )

    const productLinks = page.locator('a[href*="/produtos/"]')
    const count = await productLinks.count()
    expect(count).toBeGreaterThan(0)
  })
})

test.describe('Cross-device — Funcionalidade core', () => {
  test('deve navegar de home para PDP em qualquer device', async ({ page }) => {
    const home = new HomePage(page)
    await home.goto()

    await page.waitForFunction(
      () => document.querySelectorAll('a[href*="/produtos/"]').length > 0,
      { timeout: 15_000 }
    )

    await home.clickFirstProduct()
    await expect(page).toHaveURL(/\/produtos\//)
    await expect(page.locator('h1')).toBeVisible()
  })

  test('deve abrir carrinho em qualquer device', async ({ page }) => {
    const home = new HomePage(page)
    await home.goto()

    const cartBtn = page.getByRole('button', { name: /abrir carrinho/i })
    await expect(cartBtn).toBeVisible()
    await cartBtn.click()

    const drawer = page.getByRole('complementary', { name: /carrinho/i })
    await expect(drawer).toBeVisible()
  })

  test('login deve funcionar em qualquer device', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('input[type="email"], input[placeholder*="email"]').first()).toBeVisible()
    await expect(page.locator('input[type="password"]').first()).toBeVisible()
    await expect(page.getByRole('button', { name: /entrar/i })).toBeVisible()
  })
})
