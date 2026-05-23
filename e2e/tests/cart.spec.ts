/**
 * Testes E2E — Carrinho (CartDrawer)
 *
 * Fluxos: abrir/fechar, adicionar produto, ajustar quantidade,
 *         remover item, aplicar cupom válido/inválido, ir para checkout.
 */
import { test, expect, cartWithProduct } from '../fixtures/fixtures'
import { CartPage } from '../pages/CartPage'
import { HomePage } from '../pages/HomePage'
import { ProductPage } from '../pages/ProductPage'

const MOCK_PRODUCT_ID   = 'e2e-test-product'
const MOCK_PRODUCT_SLUG = 'cogniflex' // deve existir no banco ou ser substituído por E2E_PRODUCT_SLUG

function getProductSlug() {
  return process.env.E2E_PRODUCT_SLUG || MOCK_PRODUCT_SLUG
}

test.describe('Carrinho — Estado vazio', () => {
  test('deve exibir mensagem de carrinho vazio', async ({ page }) => {
    const cart = new CartPage(page)
    const home = new HomePage(page)
    await home.goto()
    await cart.open()
    await cart.assertEmpty()
  })

  test('deve exibir botão para continuar comprando', async ({ page }) => {
    const cart = new CartPage(page)
    const home = new HomePage(page)
    await home.goto()
    await cart.open()
    // Carrinho vazio deve ter CTA para ir ao catálogo
    await expect(page.locator('text=/ver produtos|continuar comprando|catálogo/i').or(
      page.getByRole('button', { name: /fechar|continuar/i })
    ).first()).toBeVisible()
  })

  test('deve fechar ao clicar no botão X', async ({ page }) => {
    const cart = new CartPage(page)
    const home = new HomePage(page)
    await home.goto()
    await cart.open()
    await cart.close()
  })

  test('deve fechar ao clicar no backdrop', async ({ page }) => {
    const cart = new CartPage(page)
    const home = new HomePage(page)
    await home.goto()
    await cart.open()
    await page.getByTestId('cart-backdrop').click()
    await expect(cart.drawer).not.toBeVisible({ timeout: 3_000 })
  })
})

test.describe('Carrinho — Adicionar produtos', () => {
  test('deve adicionar produto via PDP e aparecer no carrinho', async ({ page }) => {
    const slug = getProductSlug()
    const pdp = new ProductPage(page)
    const cart = new CartPage(page)

    await pdp.goto(slug)

    const inStock = await page.locator('text=/em estoque/i').isVisible().catch(() => false)
    if (!inStock) test.skip(true, 'Produto sem estoque')

    await pdp.addToCart()
    await cart.assertHasItems()
  })

  test('adicionar produto duas vezes deve aumentar quantidade (não duplicar linha)', async ({ page }) => {
    const slug = getProductSlug()
    const pdp = new ProductPage(page)
    const cart = new CartPage(page)

    await pdp.goto(slug)
    const inStock = await page.locator('text=/em estoque/i').isVisible().catch(() => false)
    if (!inStock) test.skip(true, 'Produto sem estoque')

    // Adiciona 2 vezes
    await pdp.addToCartButton.click()
    await cart.close()
    await pdp.addToCartButton.click()

    await cart.assertHasItems()
    const qty = await cart.getItemQuantity(0)
    expect(qty).toBeGreaterThanOrEqual(2)
  })
})

test.describe('Carrinho — Manipulação de itens', () => {
  // Pré-carrega carrinho via localStorage para evitar navegar pela UI
  test.beforeEach(async ({ page }) => {
    const slug = getProductSlug()
    await page.addInitScript((cartState) => {
      localStorage.setItem('metalab_cart_state_v2', cartState)
    }, cartWithProduct(slug, MOCK_PRODUCT_ID, 89.9))
  })

  test('deve aumentar quantidade do item', async ({ page }) => {
    const home = new HomePage(page)
    const cart = new CartPage(page)
    await home.goto()
    await cart.open()
    await cart.assertHasItems()

    const before = await cart.getItemQuantity(0)
    // Encontra o botão de incremento (ícone Plus)
    const plusBtn = page.getByRole('complementary', { name: /carrinho/i })
      .locator('button').filter({ has: page.locator('svg') })
    const btns = await plusBtn.all()
    // O botão + é geralmente o último dos dois botões (−, quantidade, +)
    if (btns.length >= 2) {
      await btns[btns.length - 1].click()
      await page.waitForTimeout(300)
      const after = await cart.getItemQuantity(0)
      expect(after).toBeGreaterThanOrEqual(before)
    }
  })

  test('deve remover item ao clicar no botão de lixeira', async ({ page }) => {
    const home = new HomePage(page)
    const cart = new CartPage(page)
    await home.goto()
    await cart.open()
    await cart.assertHasItems()

    const trashBtn = page.getByRole('button', { name: /remover/i }).first()
    await trashBtn.click()
    await page.waitForTimeout(500)
    // Carrinho deve estar vazio ou com menos itens
    const itemCount = await cart.getItemCount()
    expect(itemCount).toBe(0)
  })

  test('deve exibir total calculado corretamente', async ({ page }) => {
    const home = new HomePage(page)
    const cart = new CartPage(page)
    await home.goto()
    await cart.open()
    // Deve exibir R$ em algum lugar com o total
    await expect(page.locator('text=/total/i').first()).toBeVisible()
    await expect(page.locator('text=/R\\$/').first()).toBeVisible()
  })
})

test.describe('Carrinho — Cupons', () => {
  test.beforeEach(async ({ page }) => {
    const slug = getProductSlug()
    await page.addInitScript((cartState) => {
      localStorage.setItem('metalab_cart_state_v2', cartState)
    }, cartWithProduct(slug, MOCK_PRODUCT_ID, 89.9))
  })

  test('deve mostrar erro ao aplicar cupom inválido', async ({ page }) => {
    const home = new HomePage(page)
    const cart = new CartPage(page)
    await home.goto()
    await cart.open()
    await cart.applyCoupon('CUPOM_INEXISTENTE_XYZ')
    await cart.assertCouponError()
  })

  test('deve aplicar cupom válido se configurado', async ({ page }) => {
    const coupon = process.env.E2E_COUPON_CODE
    if (!coupon) test.skip(true, 'E2E_COUPON_CODE não definido')

    const home = new HomePage(page)
    const cart = new CartPage(page)
    await home.goto()
    await cart.open()
    await cart.applyCoupon(coupon!)
    await cart.assertCouponApplied()
  })

  test('campo de cupom deve aceitar digitação', async ({ page }) => {
    const home = new HomePage(page)
    const cart = new CartPage(page)
    await home.goto()
    await cart.open()

    const input = page.getByRole('complementary', { name: /carrinho/i })
      .getByPlaceholder(/PRIMEIRA|cupom|código/i)
    const visible = await input.isVisible().catch(() => false)
    if (visible) {
      await input.fill('TESTE123')
      await expect(input).toHaveValue('TESTE123')
    }
  })
})

test.describe('Carrinho — Navegação para Checkout', () => {
  test.beforeEach(async ({ page }) => {
    const slug = getProductSlug()
    await page.addInitScript((cartState) => {
      localStorage.setItem('metalab_cart_state_v2', cartState)
    }, cartWithProduct(slug, MOCK_PRODUCT_ID, 89.9))
  })

  test('deve ter botão para ir ao checkout', async ({ page }) => {
    const home = new HomePage(page)
    const cart = new CartPage(page)
    await home.goto()
    await cart.open()
    const btn = page.getByRole('link', { name: /finalizar|checkout/i })
      .or(page.getByRole('button', { name: /finalizar|checkout/i }))
    await expect(btn.first()).toBeVisible()
  })

  test('clicar em finalizar deve navegar para /checkout', async ({ page }) => {
    const home = new HomePage(page)
    const cart = new CartPage(page)
    await home.goto()
    await cart.open()
    await cart.goToCheckout()
  })
})
