import { Page, expect } from '@playwright/test'

export class CheckoutPage {
  constructor(readonly page: Page) {}

  async goto() {
    await this.page.goto('/checkout')
    await this.page.waitForLoadState('domcontentloaded')
  }

  // ── Locators ──────────────────────────────────────────────────────────────

  // Dados do cliente
  get nameInput()       { return this.page.getByPlaceholder('Maria Silva') }
  get emailInput()      { return this.page.getByPlaceholder('maria@email.com') }
  get phoneInput()      { return this.page.getByPlaceholder('(11) 99999-9999') }
  get cpfInput()        { return this.page.getByPlaceholder('000.000.000-00') }

  // Endereço
  get zipCodeInput()    { return this.page.getByPlaceholder('00000-000') }
  get addressInput()    { return this.page.getByPlaceholder('Rua das Fórmulas') }
  get numberInput()     { return this.page.getByPlaceholder('120') }
  get complementInput() { return this.page.getByPlaceholder('Apto 402') }
  get districtInput()   { return this.page.getByPlaceholder('Centro') }
  get cityInput()       { return this.page.getByPlaceholder('São Paulo') }
  get stateInput()      { return this.page.getByPlaceholder('SP') }

  // Frete
  get shippingSection()  { return this.page.locator('text=/frete|entrega/i').first() }
  get shippingOptions()  { return this.page.locator('input[type="radio"]') }

  // Pagamento
  get pixOption()       { return this.page.getByRole('radio', { name: /pix/i }) }
  get creditOption()    { return this.page.getByRole('radio', { name: /cartão de crédito/i }) }

  // Resumo
  get orderSummary()    { return this.page.locator('text=/resumo|seu pedido/i').first() }

  // Submit
  get submitButton()    { return this.page.getByRole('button', { name: /finalizar pedido|pagar|confirmar/i }) }

  // Sucesso — QR Code
  get pixQrCode()       { return this.page.locator('text=/pix|qr code|copie o código/i').first() }
  get successTitle()    { return this.page.locator('text=/pedido confirmado|pagamento|obrigado/i').first() }

  // Carrinho vazio redirect
  get emptyCartMessage() { return this.page.locator('text=/carrinho vazio|nenhum item/i') }

  // ── Mocks ─────────────────────────────────────────────────────────────────

  async mockFreteApi() {
    await this.page.route('**/api/frete', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'standard',
            name: 'PAC',
            price: 15.9,
            currency: 'BRL',
            delivery_time: 7,
            company: { name: 'Correios', picture: '' },
          },
          {
            id: 'express',
            name: 'SEDEX',
            price: 29.9,
            currency: 'BRL',
            delivery_time: 2,
            company: { name: 'Correios', picture: '' },
          },
        ]),
      })
    })
  }

  async mockCepApi(cep = '01310100') {
    await this.page.route(`**/api/cep*`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          logradouro: 'Avenida Paulista',
          bairro: 'Bela Vista',
          cidade: 'São Paulo',
          estado: 'SP',
        }),
      })
    })
  }

  async mockPedidoApi(orderId = 'e2e-test-order-001') {
    await this.page.route('**/api/pedidos', async (route) => {
      if (route.request().method() !== 'POST') { await route.continue(); return }
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          pedidoId: orderId,
          pedidoNumero: 'MTL-2026-E2ETEST',
          total: 99.9,
          metodoPagamento: 'PIX',
        }),
      })
    })
  }

  async mockPagamentoApi() {
    await this.page.route('**/api/pagamento/criar', async (route) => {
      if (route.request().method() !== 'POST') { await route.continue(); return }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          tipo: 'PIX',
          pagamentoId: 'mp-e2e-test-123',
          qrCode: '00020126580014br.gov.bcb.pix0136e2e-test-pix-code',
          qrCodeBase64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
          expiracao: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        }),
      })
    })
    // Mock polling de status — retorna não-pago por padrão (estado correto para PIX pendente)
    await this.page.route('**/api/pagamento/status/**', async (route) => {
      if (route.request().method() !== 'GET') { await route.continue(); return }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ pago: false, status: 'AGUARDANDO_PAGAMENTO' }),
      })
    })
  }

  async mockPagamentoApiConfirmado(orderId = 'e2e-test-order-001') {
    await this.mockPagamentoApi()
    // Sobrescreve o status para simular webhook confirmado
    await this.page.route(`**/api/pagamento/status/${orderId}`, async (route) => {
      if (route.request().method() !== 'GET') { await route.continue(); return }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ pago: true, status: 'PAGAMENTO_APROVADO' }),
      })
    })
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  async fillPersonalData(data: { name: string; email: string; phone: string; cpf: string }) {
    await this.nameInput.fill(data.name)
    await this.emailInput.fill(data.email)
    await this.phoneInput.fill(data.phone)
    await this.cpfInput.fill(data.cpf)
  }

  async fillAddress(data: { zip: string; address?: string; number: string; district?: string; city?: string; state?: string }) {
    await this.zipCodeInput.fill(data.zip)
    // Aguarda autopreenchimento via CEP (ou mockado)
    await this.page.waitForTimeout(500)
    if (data.address) await this.addressInput.fill(data.address)
    await this.numberInput.fill(data.number)
    if (data.district) await this.districtInput.fill(data.district)
    if (data.city)     await this.cityInput.fill(data.city)
    if (data.state)    await this.stateInput.fill(data.state)
  }

  async selectShipping(index = 0) {
    const options = this.shippingOptions
    const count = await options.count()
    if (count > index) await options.nth(index).click()
  }

  async selectPix() {
    const pix = this.page.locator('text=/pix/i').first()
    await pix.click()
  }

  async submit() {
    await this.submitButton.click()
  }

  // ── Assertions ────────────────────────────────────────────────────────────

  async assertLoaded() {
    await expect(this.page).toHaveURL(/checkout/)
    await expect(this.submitButton).toBeVisible()
  }

  async assertOrderSummaryVisible() {
    await expect(this.orderSummary).toBeVisible()
  }

  async assertRedirectsToLoginWhenEmpty() {
    await expect(this.page).toHaveURL(/login|\/|produtos/, { timeout: 5_000 })
  }

  async assertPixQrVisible() {
    await expect(this.successTitle.or(this.pixQrCode)).toBeVisible({ timeout: 15_000 })
  }
}
