import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL is required to sync the informative catalog')
}

const url = new URL(connectionString)
url.searchParams.delete('sslmode')
const rejectUnauthorized = process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== 'false'

const pool = new Pool({
  connectionString: url.toString(),
  ssl: { rejectUnauthorized },
  max: 1,
})

const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })
const outputPath = resolve(process.argv[2] ?? 'data/informativos/catalog.json')

async function main() {
  const products = await prisma.produto.findMany({
    where: { ativo: true, tipo: 'SIMPLES' },
    orderBy: { nome: 'asc' },
    select: {
      id: true,
      nome: true,
      slug: true,
      marca: true,
      imagemUrl: true,
      corPrincipal: true,
    },
  })

  const catalog = {
    syncedAt: new Date().toISOString(),
    source: 'production-catalog',
    products,
  }

  mkdirSync(dirname(outputPath), { recursive: true })
  writeFileSync(outputPath, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8')
  console.log(`Synced ${products.length} active products to ${outputPath}`)
}

main()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`Catalog sync failed: ${message}`)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
