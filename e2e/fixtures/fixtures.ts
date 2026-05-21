import { test as base, expect, type Page } from '@playwright/test'
import path from 'path'

export { expect }

const USER_AUTH_FILE  = path.join(__dirname, '../.auth/user.json')
const ADMIN_AUTH_FILE = path.join(__dirname, '../.auth/admin.json')

// Aceita cookies e suprime o banner em todos os testes
async function acceptCookies(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('metalab_cookie_consent', 'all')
  })
}

// Pré-carrega um produto no carrinho via localStorage (evita navegar pela UI)
export function cartWithProduct(productSlug: string, productId: string, price = 99.9) {
  const state = {
    items: [{
      productId,
      slug: productSlug,
      name: 'Produto E2E Test',
      brand: 'Metalab',
      imageUrl: null,
      unitPrice: price,
      quantity: 1,
      stock: 10,
      color: '#6b21a8',
    }],
    coupons: { discount: null, freeShipping: null },
  }
  return JSON.stringify(state)
}

// Fixture base — sem autenticação, com cookies aceitos
export const test = base.extend<{
  page: Page
}>({
  page: async ({ page }, use) => {
    await acceptCookies(page)
    await use(page)
  },
})

// Fixture com usuário logado
export const userTest = base.extend<{ page: Page }>({
  page: async ({ browser }, use) => {
    const context = await browser.newContext({ storageState: USER_AUTH_FILE })
    const page = context.newPage()
    await (await page).addInitScript(() => {
      localStorage.setItem('metalab_cookie_consent', 'all')
    })
    await use(await page)
    await context.close()
  },
})

// Fixture com admin logado
export const adminTest = base.extend<{ page: Page }>({
  page: async ({ browser }, use) => {
    const context = await browser.newContext({ storageState: ADMIN_AUTH_FILE })
    const page = context.newPage()
    await (await page).addInitScript(() => {
      localStorage.setItem('metalab_cookie_consent', 'all')
    })
    await use(await page)
    await context.close()
  },
})

// Verifica se a autenticação está disponível (credenciais foram configuradas)
export function skipIfNoAuth(envKey: string) {
  if (!process.env[envKey]) {
    test.skip(true, `${envKey} não definido — teste pulado`)
  }
}
