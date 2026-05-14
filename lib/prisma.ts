import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"

declare global {
  // eslint-disable-next-line no-var
  var _prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set")
  }
  const adapter = new PrismaPg({ connectionString })
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  })
}

export const prisma = global._prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") global._prisma = prisma
