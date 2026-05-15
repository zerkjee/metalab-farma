/**
 * Troca a senha do usuário admin em produção.
 * Uso: node scripts/reset-admin-password.mjs <email> <nova-senha>
 * Ex:  node scripts/reset-admin-password.mjs admin@metalab.com.br 'MinhaS3nhaForte!'
 *
 * Requer DATABASE_URL no ambiente (ou em .env.local via dotenv).
 */

import { createRequire } from 'module';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const require = createRequire(import.meta.url);

// Carrega .env.local se existir
try {
  const envPath = resolve(process.cwd(), '.env.local');
  const lines = readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = val;
  }
} catch { /* .env.local não existe — usa env do sistema */ }

const [email, novaSenha] = process.argv.slice(2);

if (!email || !novaSenha) {
  console.error('Uso: node scripts/reset-admin-password.mjs <email> <nova-senha>');
  process.exit(1);
}

if (novaSenha.length < 8) {
  console.error('Senha deve ter no mínimo 8 caracteres.');
  process.exit(1);
}

const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

try {
  const usuario = await prisma.usuario.findUnique({ where: { email: email.toLowerCase().trim() } });

  if (!usuario) {
    console.error(`Usuário não encontrado: ${email}`);
    process.exit(1);
  }

  const hash = await bcrypt.hash(novaSenha, 12);
  await prisma.usuario.update({
    where: { id: usuario.id },
    data: { senha: hash },
  });

  console.log(`✓ Senha atualizada para: ${email} (papel: ${usuario.papel})`);
} finally {
  await prisma.$disconnect();
}
