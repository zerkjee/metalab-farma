/**
 * Cria os arquivos de estado de autenticação usados pelos testes.
 * Executa uma vez antes de todos os outros projetos.
 *
 * Lê E2E_USER_EMAIL / E2E_USER_PASSWORD e E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD.
 * Se as credenciais não estiverem definidas, salva estado vazio (testes dependentes serão pulados).
 */
import { test as setup, expect } from '@playwright/test'
import path from 'path'

export const USER_AUTH_FILE  = path.join(__dirname, '../.auth/user.json')
export const ADMIN_AUTH_FILE = path.join(__dirname, '../.auth/admin.json')

async function loginViaForm(page: import('@playwright/test').Page, url: string, email: string, password: string) {
  await page.goto(url)
  await page.getByPlaceholder(/email/i).fill(email)
  await page.getByPlaceholder(/senha|password/i).fill(password)
  await page.getByRole('button', { name: /entrar/i }).click()
  // Aguarda redirecionamento pós-login
  await page.waitForURL((u) => !u.pathname.includes('login'), { timeout: 15_000 })
}

setup('autenticar usuário comum', async ({ page }) => {
  const email    = process.env.E2E_USER_EMAIL
  const password = process.env.E2E_USER_PASSWORD

  if (!email || !password) {
    console.warn('[setup] E2E_USER_EMAIL/PASSWORD não definidos — auth de usuário pulada')
    await page.context().storageState({ path: USER_AUTH_FILE })
    return
  }

  await loginViaForm(page, '/login', email, password)
  await page.context().storageState({ path: USER_AUTH_FILE })
})

setup('autenticar admin', async ({ page }) => {
  const email    = process.env.E2E_ADMIN_EMAIL
  const password = process.env.E2E_ADMIN_PASSWORD

  if (!email || !password) {
    console.warn('[setup] E2E_ADMIN_EMAIL/PASSWORD não definidos — auth de admin pulada')
    await page.context().storageState({ path: ADMIN_AUTH_FILE })
    return
  }

  await loginViaForm(page, '/admin/login', email, password)
  await expect(page).toHaveURL('/admin')
  await page.context().storageState({ path: ADMIN_AUTH_FILE })
})
