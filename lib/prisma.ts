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

export const prisma = global._prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") global._prisma = prisma
