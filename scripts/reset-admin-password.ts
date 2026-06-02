/**
 * Cria ou redefine o usuário admin em produção.
 *
 * Variáveis de ambiente necessárias:
 *   DATABASE_URL   — connection string do PostgreSQL
 *   ADMIN_EMAIL    — e-mail do admin (default: admin@metalab.com.br)
 *   ADMIN_PASSWORD — nova senha (mín. 8 chars)
 *
 * Uso seguro (nunca passe a senha como argumento CLI):
 *   ADMIN_EMAIL=admin@metalab.com.br \
 *   ADMIN_PASSWORD=suasenha \
 *   npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/reset-admin-password.ts
 *
 * O que faz:
 *   - Se o usuário NÃO existe → cria com papel SUPER_ADMIN e ativo=true
 *   - Se o usuário JÁ existe  → atualiza senha, papel=SUPER_ADMIN e ativo=true
 *   - Nunca imprime senha nem hash
 */

import { readFileSync } from 'fs'
import { resolve } from 'path'

// ── 1. Carrega .env.local se existir (sem depender do dotenv) ────────────────
try {
  const envPath = resolve(process.cwd(), '.env.local')
  const lines = readFileSync(envPath, 'utf8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx === -1) continue
    const key = trimmed.slice(0, idx).trim()
    const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '')
    if (!process.env[key]) process.env[key] = val
  }
} catch { /* .env.local não existe — usa vars do sistema */ }

// ── 2. Valida entradas ───────────────────────────────────────────────────────
const DATABASE_URL  = process.env.DATABASE_URL
const ADMIN_EMAIL   = (process.env.ADMIN_EMAIL ?? 'admin@metalab.com.br').toLowerCase().trim()
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? ''

if (!DATABASE_URL) {
  console.error('❌  DATABASE_URL não definida.')
  process.exit(1)
}

if (ADMIN_PASSWORD.length < 8) {
  console.error('❌  ADMIN_PASSWORD deve ter no mínimo 8 caracteres.')
  console.error('    Defina: export ADMIN_PASSWORD=suasenha')
  process.exit(1)
}

// ── 3. Conecta e opera ───────────────────────────────────────────────────────
import { randomBytes } from 'crypto'
import bcrypt from 'bcryptjs'
import { Client } from 'pg'

const client = new Client({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

async function run() {
  await client.connect()
  console.log('✓ Conectado ao banco.')

  // Busca usuário sem expor dados sensíveis
  const { rows } = await client.query<{ id: string; papel: string; ativo: boolean }>(
    `SELECT id, papel, ativo FROM usuarios WHERE email = $1`,
    [ADMIN_EMAIL],
  )

  // Hash com custo 12 — mesmo que o authorize() espera
  const hash = await bcrypt.hash(ADMIN_PASSWORD, 12)

  if (rows.length === 0) {
    // ── Cria novo admin ──────────────────────────────────────────────────────
    const newId = randomBytes(16).toString('hex')
    await client.query(
      `INSERT INTO usuarios (id, email, nome, senha, papel, ativo, "criadoEm")
       VALUES ($1, $2, $3, $4, 'SUPER_ADMIN', true, NOW())`,
      [newId, ADMIN_EMAIL, 'Admin Metalab', hash],
    )
    console.log(`✓ Admin criado: ${ADMIN_EMAIL} → papel=SUPER_ADMIN, ativo=true`)
  } else {
    // ── Atualiza existente ───────────────────────────────────────────────────
    const { id, papel, ativo } = rows[0]
    await client.query(
      `UPDATE usuarios SET senha = $1, papel = 'SUPER_ADMIN', ativo = true WHERE id = $2`,
      [hash, id],
    )
    const mudancas: string[] = ['senha redefinida']
    if (papel !== 'SUPER_ADMIN') mudancas.push(`papel: ${papel} → SUPER_ADMIN`)
    if (!ativo) mudancas.push('ativo: false → true')
    console.log(`✓ Admin atualizado: ${ADMIN_EMAIL} (${mudancas.join(', ')})`)
  }

  console.log('✓ Pronto. Tente logar em /admin/login agora.')
}

run()
  .catch((err: unknown) => {
    // Nunca imprime o objeto err completo — pode conter a query com o hash
    const msg = err instanceof Error ? err.message : String(err)
    console.error('❌  Erro ao executar script:', msg)
    process.exit(1)
  })
  .finally(() => client.end())
