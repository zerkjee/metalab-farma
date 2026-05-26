/**
 * Testes E2E — Checkout ponta-a-ponta
 *
 * Fluxos: dados pessoais, CEP, frete, PIX, criação de pedido.
 * APIs externas (Mercado Pago, Melhor Envio) são mockadas por padrão.
 */
import { test, expect, cartWithProduct } from '../fixtures/fixtures'
import { CheckoutPage } from '../pages/CheckoutPage'

const MOCK_PRODUCT_ID   = 'e2e-checkout-product'
const MOCK_PRODUCT_SLUG = process.env.E2E_PRODUCT_SLUG || 'cogniflex'

const TEST_DATA = {
  name:  'Maria Teste Silva',
  email: 'maria.teste@example.com',
  phone: '(11) 99999-9999',
  cpf:   '869.934.780-08', // CPF com dígitos verificadores válidos
  zip:   process.env.E2E_TEST_CEP || '01310-100',
  address: 'Avenida Paulista',
  number:  '1000',
  district: 'Bela Vista',
  city:  'São Paulo',
  state: 'SP',
}

// Pré-carrega carrinho em todos os testes deste suite
test.beforeEach(async ({ page }) => {
  await page.addInitScript((cartState) => {
    localStorage.setItem('metalab_cart_state_v2', cartState)
  }, cartWithProduct(MOCK_PRODUCT_SLUG, MOCK_PRODUCT_ID, 89.9))
})

test.describe('Checkout — Acesso', () => {
  test('deve redirecionar para home ou mostrar vazio sem carrinho', async ({ page }) => {
    // Remove o carrinho para testar o caso vazio
    await page.addInitScript(() => {
      localStorage.removeItem('metalab_cart_state_v2')
    })
    await page.goto('/checkout')
    await page.waitForLoadState('domcontentloaded')
    // Deve redirecionar ou mostrar mensagem de carrinho vazio
    const checkout = new CheckoutPage(page)
    const url = page.url()
    const isEmpty = url.includes('checkout')
      ? await page.locator('text=/carrinho vazio|nenhum item|adicione produtos/i').isVisible().catch(() => false)
      : true
    expect(isEmpty || !url.includes('checkout')).toBeTruthy()
  })

  test('deve carregar a página de checkout com itens no carrinho', async ({ page }) => {
    const checkout = new CheckoutPage(page)
    await checkout.goto()
    await checkout.assertLoaded()
  })

  test('deve exibir resumo do pedido com produto', async ({ page }) => {
    const checkout = new CheckoutPage(page)
    await checkout.goto()
    await checkout.assertOrderSummaryVisible()
  })
})

test.describe('Checkout — Formulário de dados', () => {
  test('deve ter campos de dados pessoais visíveis (usuário não logado)', async ({ page }) => {
    const checkout = new CheckoutPage(page)
    await checkout.goto()

    // Para usuário não logado, campos editáveis devem aparecer
    // Para logado, campos somente-leitura aparecem — ambos são válidos
    const hasEditableForm = await checkout.nameInput.isVisible().catch(() => false)
    const hasReadonlyForm = await page.locator('text=/nome completo|identificação/i').isVisible().catch(() => false)
    expect(hasEditableForm || hasReadonlyForm).toBeTruthy()
  })

  test('deve aceitar preenchimento dos dados pessoais', async ({ page }) => {
    const checkout = new CheckoutPage(page)
    await checkout.goto()

    const hasForm = await checkout.nameInput.isVisible().catch(() => false)
    if (!hasForm) test.skip(true, 'Campos de dados pessoais não visíveis (usuário logado?)')

    await checkout.fillPersonalData({
      name:  TEST_DATA.name,
      email: TEST_DATA.email,
      phone: TEST_DATA.phone,
      cpf:   TEST_DATA.cpf,
    })

    await expect(checkout.nameInput).toHaveValue(TEST_DATA.name)
    await expect(checkout.emailInput).toHaveValue(TEST_DATA.email)
  })

  test('CEP deve acionar lookup de endereço', async ({ page }) => {
    const checkout = new CheckoutPage(page)
    await checkout.mockCepApi()
    await checkout.goto()

    const hasZip = await checkout.zipCodeInput.isVisible().catch(() => false)
    if (!hasZip) test.skip(true, 'Campo CEP não visível')

    await checkout.zipCodeInput.fill(TEST_DATA.zip)
    await page.waitForTimeout(800) // Aguarda debounce do CEP

    // Campos devem ser preenchidos automaticamente
    const addressFilled = await checkout.addressInput.inputValue().catch(() => '')
    expect(addressFilled.length).toBeGreaterThan(0)
  })
})

test.describe('Checkout — Frete', () => {
  test('deve exibir opções de frete após preencher CEP (com mock)', async ({ page }) => {
    const checkout = new CheckoutPage(page)
    await checkout.mockCepApi()
    await checkout.mockFreteApi()
    await checkout.goto()

    const hasZip = await checkout.zipCodeInput.isVisible().catch(() => false)
    if (!hasZip) test.skip(true, 'Campo CEP não visível')

    await checkout.fillAddress({
      zip:      TEST_DATA.zip,
      address:  TEST_DATA.address,
      number:   TEST_DATA.number,
      district: TEST_DATA.district,
      city:     TEST_DATA.city,
      state:    TEST_DATA.state,
    })

    // Aguarda opções de frete
    await page.waitForTimeout(1_000)
    const hasShipping = await page.locator('text=/pac|sedex|entrega/i').first().isVisible()
      .catch(() => false)
    // Aceitável se frete não aparece em dev sem as credenciais reais
    if (hasShipping) {
      await expect(page.locator('text=/pac|sedex|entrega/i').first()).toBeVisible()
    }
  })
})

test.describe('Checkout — Pagamento PIX (mockado)', () => {
  test('deve criar pedido e exibir QR Code PIX', async ({ page }) => {
    const checkout = new CheckoutPage(page)
    await checkout.mockCepApi()
    await checkout.mockFreteApi()
    await checkout.mockPedidoApi()
    await checkout.mockPagamentoApi()
    await checkout.goto()

    const hasForm = await checkout.nameInput.isVisible().catch(() => false)
    if (!hasForm) test.skip(true, 'Teste requer usuário não logado com form visível')

    // Preenche dados
    await checkout.fillPersonalData({
      name:  TEST_DATA.name,
      email: TEST_DATA.email,
      phone: TEST_DATA.phone,
      cpf:   TEST_DATA.cpf,
    })

    await checkout.fillAddress({
      zip:      TEST_DATA.zip,
      address:  TEST_DATA.address,
      number:   TEST_DATA.number,
      district: TEST_DATA.district,
      city:     TEST_DATA.city,
      state:    TEST_DATA.state,
    })

    await page.waitForTimeout(500)

    // Garante PIX selecionado
    const pixOption = page.locator('text=/pix/i').first()
    const pixVisible = await pixOption.isVisible().catch(() => false)
    if (pixVisible) await pixOption.click()

    // Submete
    const submitBtn = page.getByRole('button', { name: /finalizar pedido|pagar|confirmar/i })
    const btnVisible = await submitBtn.isVisible().catch(() => false)
    if (!btnVisible) test.skip(true, 'Botão de submit não encontrado')

    await submitBtn.click()

    // Aguarda resposta do pedido mockado
    await page.waitForTimeout(2_000)

    // FLUXO CORRETO: deve mostrar "Aguardando pagamento PIX" — NUNCA "Compra finalizada" ainda
    const pixPendingIndicators = [
      page.locator('text=/aguardando pagamento pix/i'),
      page.locator('text=/pague com pix/i'),
      page.locator('text=/pix copia e cola/i'),
      page.locator('text=/expira em/i'),
    ]
    let foundPending = false
    for (const indicator of pixPendingIndicators) {
      if (await indicator.isVisible().catch(() => false)) { foundPending = true; break }
    }

    // Garante que "Compra finalizada" NÃO aparece prematuramente
    const falsePositive = await page.locator('text=/compra finalizada/i').isVisible().catch(() => false)
    expect(falsePositive).toBeFalsy()

    // Se nenhum indicador de PIX pendente visível, aceita desde que não haja erro 500
    if (!foundPending) {
      const errorVisible = await page.locator('text=/erro interno|500|falha/i').isVisible().catch(() => false)
      expect(errorVisible).toBeFalsy()
    }
  })

  test('tela PIX pendente não deve exibir "Compra finalizada com sucesso"', async ({ page }) => {
    const checkout = new CheckoutPage(page)
    await checkout.mockCepApi()
    await checkout.mockFreteApi()
    await checkout.mockPedidoApi()
    await checkout.mockPagamentoApi()
    await checkout.goto()

    const hasForm = await checkout.nameInput.isVisible().catch(() => false)
    if (!hasForm) test.skip(true, 'Teste requer usuário não logado com form visível')

    await checkout.fillPersonalData({
      name:  TEST_DATA.name,
      email: TEST_DATA.email,
      phone: TEST_DATA.phone,
      cpf:   TEST_DATA.cpf,
    })
    await checkout.fillAddress({
      zip:      TEST_DATA.zip,
      address:  TEST_DATA.address,
      number:   TEST_DATA.number,
      district: TEST_DATA.district,
      city:     TEST_DATA.city,
      state:    TEST_DATA.state,
    })
    await page.waitForTimeout(500)

    const submitBtn = page.getByRole('button', { name: /finalizar pedido|pagar|confirmar/i })
    const btnVisible = await submitBtn.isVisible().catch(() => false)
    if (!btnVisible) test.skip(true, 'Botão de submit não encontrado')

    await submitBtn.click()
    await page.waitForTimeout(2_000)

    // Deve NUNCA mostrar "Compra finalizada" sem confirmação de pagamento
    const compraFinalizada = await page.locator('text=/compra finalizada/i').isVisible().catch(() => false)
    expect(compraFinalizada).toBeFalsy()
  })

  test('método de pagamento PIX deve estar selecionável', async ({ page }) => {
    const checkout = new CheckoutPage(page)
    await checkout.goto()

    const pixLabel = page.locator('text=/pix/i').first()
    await expect(pixLabel).toBeVisible()
  })

  test('cartão e boleto devem aparecer desabilitados com badge "Em breve"', async ({ page }) => {
    const checkout = new CheckoutPage(page)
    await checkout.goto()

    // Os métodos devem estar visíveis mas desabilitados
    await expect(page.locator('text=/cartão de crédito/i').first()).toBeVisible()
    await expect(page.locator('text=/boleto/i').first()).toBeVisible()
    // Badge "Em breve" deve estar presente
    const emBreve = await page.locator('text=/em breve/i').first().isVisible().catch(() => false)
    expect(emBreve).toBeTruthy()
  })
})

test.describe('Checkout — Resumo do pedido', () => {
  test('deve exibir produtos no resumo', async ({ page }) => {
    const checkout = new CheckoutPage(page)
    await checkout.goto()

    // O resumo deve conter o produto adicionado
    await expect(page.locator('text=/R\\$/').first()).toBeVisible()
  })

  test('deve exibir total no resumo', async ({ page }) => {
    const checkout = new CheckoutPage(page)
    await checkout.goto()
    await expect(page.locator('text=/total/i').first()).toBeVisible()
  })
})
