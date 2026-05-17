import { createRequire } from 'module';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const require = createRequire(import.meta.url);

try {
  const envPath = resolve(process.cwd(), '.env.local');
  const lines = readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '');
    if (!process.env[key]) process.env[key] = val;
  }
} catch {}

const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

await client.connect();

const existing = await client.query(
  `SELECT id FROM produtos WHERE slug = 'produto-teste' LIMIT 1`
);

if (existing.rows.length > 0) {
  console.log('Produto já existe, atualizando preço para R$0,10...');
  await client.query(
    `UPDATE produtos SET preco = 0.10, ativo = true, estoque = 999 WHERE slug = 'produto-teste'`
  );
  console.log('Atualizado com sucesso.');
} else {
  const id = `ctest${Date.now()}`;
  await client.query(
    `INSERT INTO produtos (id, nome, slug, sku, preco, "descricaoHtml", "descricaoCurta", estoque, "estoqueMin", ativo, destaque, marca, "criadoEm", "atualizadoEm")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())`,
    [
      id,
      'Produto Teste',
      'produto-teste',
      'TESTE-001',
      '0.10',
      '<p>Produto de teste para validação do fluxo de pagamento PIX.</p>',
      'Produto de teste — não comprar.',
      999,
      0,
      true,
      false,
      'Metalab',
    ]
  );
  console.log('Produto Teste criado com sucesso! ID:', id);
}

await client.end();
