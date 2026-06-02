/**
 * Cria ou redefine o usuário admin em produção.
 *
 * Variáveis de ambiente necessárias:
 *   DATABASE_URL   — connection string do PostgreSQL
 *   ADMIN_EMAIL    — e-mail do admin (default: admin@metalab.com.br)
 *   ADMIN_PASSWORD — nova senha (mín. 8 chars)
 *
 * Uso (rode da raiz do projeto):
 *   ADMIN_EMAIL=admin@metalab.com.br \
 *   ADMIN_PASSWORD=suasenha \
 *   node scripts/reset-admin-password.mjs
 *
 * Nunca imprime senha nem hash.
 */

import { readFileSync } from 'fs'
import { resolve } from 'path'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

// ── Carrega .env.local se existir ─────────────────────────────────────────────
try {
  const envPath = resolve(process.cwd(), '.env.local')
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const idx = t.indexOf('=')
    if (idx === -1) continue
    const key = t.slice(0, idx).trim()
    const val = t.slice(idx + 1).trim().replace(/^["']|["']$/g, '')
    if (!process.env[key]) process.env[key] = val
  }
} catch { /* sem .env.local — usa vars do sistema */ }

// ── Valida entradas ───────────────────────────────────────────────────────────
const DATABASE_URL   = process.env.DATABASE_URL
const ADMIN_EMAIL    = (process.env.ADMIN_EMAIL ?? 'admin@metalab.com.br').toLowerCase().trim()
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

// ── Conecta e opera ───────────────────────────────────────────────────────────
const bcrypt = require('bcryptjs')
const { Client } = require('pg')

const client = new Client({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

try {
  await client.connect()
  console.log('✓ Conectado ao banco.')

  const { rows } = await client.query(
    'SELECT id, papel, ativo FROM usuarios WHERE email = $1',
    [ADMIN_EMAIL],
  )

  const hash = await bcrypt.hash(ADMIN_PASSWORD, 12)

  if (rows.length === 0) {
    // Cria novo admin
    const newId = require('crypto').randomBytes(16).toString('hex')
    await client.query(
      `INSERT INTO usuarios (id, email, nome, senha, papel, ativo, "criadoEm")
       VALUES ($1, $2, 'Admin Metalab', $3, 'SUPER_ADMIN', true, NOW())`,
      [newId, ADMIN_EMAIL, hash],
    )
    console.log(`✓ Admin criado: ${ADMIN_EMAIL} → papel=SUPER_ADMIN, ativo=true`)
  } else {
    // Atualiza existente
    const { id, papel, ativo } = rows[0]
    await client.query(
      `UPDATE usuarios SET senha = $1, papel = 'SUPER_ADMIN', ativo = true WHERE id = $2`,
      [hash, id],
    )
    const mudancas = ['senha redefinida']
    if (papel !== 'SUPER_ADMIN') mudancas.push(`papel: ${papel} → SUPER_ADMIN`)
    if (!ativo) mudancas.push('ativo: false → true')
    console.log(`✓ Admin atualizado: ${ADMIN_EMAIL} (${mudancas.join(', ')})`)
  }

  console.log('✓ Pronto. Acesse /admin/login para testar.')
} catch (err) {
  console.error('❌  Erro:', err?.message ?? String(err))
  process.exit(1)
} finally {
  await client.end()
}
