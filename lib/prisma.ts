import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"
import { Pool } from "pg"

declare global {
  var _prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set")
  }

  // Strip sslmode from the URL and use explicit ssl config — necessário porque
  // pg v8+ trata sslmode=require como verify-full, quebrando a chain do Supabase.
  const url = new URL(connectionString)
  url.searchParams.delete("sslmode")

  // max: 2 evita esgotar conexões no Supabase free (limite: 60) com múltiplas instâncias serverless
  const pool = new Pool({
    connectionString: url.toString(),
    ssl: { rejectUnauthorized: false },
    max: process.env.NODE_ENV === "production" ? 2 : 10,
  })

  const adapter = new PrismaPg(pool)
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  })
}

// Lazy init: o client só é criado no primeiro acesso a uma propriedade (runtime),
// nunca no mero import do módulo. Isso evita que `next build` → "Collecting page data"
// — que importa todos os route handlers — dispare createPrismaClient() (e o throw de
// DATABASE_URL) em ambientes sem a env var (ex.: Preview da Vercel).
//
// O client é memoizado em `global._prisma` em TODOS os ambientes (singleton por
// processo). Memoizar só fora de produção fazia cada acesso de propriedade do Proxy
// recriar um Pool pg novo (jamais fechado) → vazamento de conexões que esgotava o
// pooler do Supabase (EMAXCONN, limite 200) sob carga, p.ex. na Full Suite E2E.
function getClient(): PrismaClient {
  global._prisma ??= createPrismaClient()
  return global._prisma
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getClient()
    const value = Reflect.get(client, prop, receiver)
    // Liga métodos ao client real para preservar o `this` (ex.: $transaction).
    return typeof value === "function" ? value.bind(client) : value
  },
})
