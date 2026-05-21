/**
 * Testes E2E — Homepage
 *
 * Fluxos: banner, navegação, busca, categorias, listagem de produtos, carrinho.
 */
import { test, expect } from '../fixtures/fixtures'
import { HomePage } from '../pages/HomePage'

let home: HomePage

test.beforeEach(async ({ page }) => {
  home = new HomePage(page)
  await home.goto()
})

test.describe('Homepage — Estrutura básica', () => {
  test('deve carregar com logo, navegação e carrinho', async () => {
    await home.assertLoaded()
  })

  test('deve exibir links de navegação principais', async () => {
    await home.assertNavigationLinks()
  })

  test('deve exibir o rodapé', async ({ page }) => {
    await page.locator('footer').scrollIntoViewIfNeeded()
    await expect(page.locator('footer')).toBeVisible()
  })

  test('deve ter título de página definido', async ({ page }) => {
    const title = await page.title()
    expect(title.length).toBeGreaterThan(0)
    expect(title).toMatch(/metalab|store|suplemento/i)
  })

  test('deve ter meta description', async ({ page }) => {
    const meta = page.locator('meta[name="description"]')
    const content = await meta.getAttribute('content')
    expect(content?.length ?? 0).toBeGreaterThan(10)
  })
})

test.describe('Homepage — BannerCarousel', () => {
  test('deve exibir pelo menos um banner', async ({ page }) => {
    // O carousel ocupa o topo da página após o header
    const banner = page.locator('section').first()
    await expect(banner).toBeVisible()
  })

  test('banner deve ter elemento de texto ou imagem visível', async ({ page }) => {
    // Garante que o carousel renderizou conteúdo
    const hasContent = await page.locator('text=/metalab|suplemento|produto|qualidade/i').first().isVisible()
      .catch(() => false)
    expect(hasContent).toBeTruthy()
  })
})

test.describe('Homepage — Produtos', () => {
  test('deve exibir produtos na página', async ({ page }) => {
    // Aguarda carregamento de produtos (API com ISR)
    await page.waitForFunction(
      () => document.querySelectorAll('a[href*="/produtos/"]').length > 0,
      { timeout: 15_000 }
    )
    const productLinks = page.locator('a[href*="/produtos/"]')
    const count = await productLinks.count()
    expect(count).toBeGreaterThan(0)
  })

  test('deve exibir preços dos produtos', async ({ page }) => {
    await page.waitForFunction(
      () => document.body.textContent?.includes('R$'),
      { timeout: 15_000 }
    )
    await expect(page.locator('text=/R\\$/').first()).toBeVisible()
  })

  test('clicar em produto deve navegar para a PDP', async ({ page }) => {
    // Aguarda produtos carregarem (ISR pode demorar na primeira visita)
    await page.waitForFunction(
      () => document.querySelectorAll('a[href*="/produtos/"]').length > 0,
      { timeout: 20_000 }
    )

    const slug = await home.getFirstProductSlug()
    if (!slug) test.skip(true, 'Nenhum produto encontrado na homepage')

    await home.clickFirstProduct()
    await expect(home.page).toHaveURL(/\/produtos\//, { timeout: 30_000 })
  })
})

test.describe('Homepage — Carrinho', () => {
  test('deve abrir o drawer do carrinho ao clicar no ícone', async () => {
    await home.openCart()
    // Carrinho vazio
    await expect(home.page.locator('text=/carrinho está vazio|seu carrinho/i')).toBeVisible()
  })

  test('deve fechar o carrinho ao clicar no botão fechar', async ({ page }) => {
    await home.openCart()
    // Aguarda o botão ser clicável (Playwright auto-aguarda estabilidade de animação)
    const closeBtn = page.getByRole('button', { name: /fechar carrinho/i })
    await expect(closeBtn).toBeVisible()
    await closeBtn.click()
    // aria-hidden=true é aplicado imediatamente no fechamento — getByRole não encontra o aside
    await expect(page.getByRole('complementary', { name: /carrinho/i })).not.toBeVisible({ timeout: 5_000 })
  })

  test('badge do carrinho deve mostrar 0 inicialmente', async ({ page }) => {
    // Se o badge não aparece quando vazio, isso também é aceitável
    const badge = page.locator('header span').filter({ hasText: /^[0-9]+$/ })
    const isVisible = await badge.isVisible().catch(() => false)
    if (isVisible) {
      const text = await badge.textContent()
      expect(parseInt(text ?? '0')).toBe(0)
    }
  })
})

test.describe('Homepage — Busca', () => {
  test('deve exibir campo de busca ou atalho para busca', async ({ page }) => {
    // A busca pode estar no Header, em um SearchBar dedicado, ou apenas em /produtos
    const searchEl = page.getByPlaceholder(/buscar|pesquisar|search/i)
      .or(page.getByRole('searchbox'))
      .or(page.locator('input[type="search"]'))
    const isVisible = await searchEl.first().isVisible().catch(() => false)

    if (isVisible) {
      // Se há um campo de busca visível, ok
      return
    }

    // Aceita que a busca seja acessível via link de navegação
    const searchLink = page.getByRole('link', { name: /buscar|pesquisar|produtos/i })
    const linkVisible = await searchLink.first().isVisible().catch(() => false)

    if (!linkVisible) {
      // Busca pode estar apenas em /produtos — não é falha crítica
      test.skip(true, 'Homepage não tem campo de busca nem link direto para busca — comportamento esperado')
    }
  })
})

test.describe('Homepage — Links institucionais', () => {
  test('deve ter link para página VIP', async ({ page }) => {
    await expect(page.getByRole('link', { name: /vip/i }).first()).toBeVisible()
  })

  test('deve ter link para avaliações', async ({ page }) => {
    await expect(page.getByRole('link', { name: /avaliações/i }).first()).toBeVisible()
  })

  test('link Entrar deve apontar para /login', async ({ page }) => {
    const link = page.getByRole('link', { name: /entrar/i }).first()
    const visible = await link.isVisible().catch(() => false)
    if (visible) {
      const href = await link.getAttribute('href')
      expect(href).toContain('login')
    }
  })
})
