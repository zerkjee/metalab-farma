import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"

const connectionString = process.env.DATABASE_URL!
const adapter = new PrismaPg({ connectionString, max: 2, ssl: { rejectUnauthorized: false } })
const prisma = new PrismaClient({ adapter })

async function main() {
  const products = await prisma.produto.findMany({
    select: { id: true, nome: true, slug: true, ativo: true, imagemUrl: true },
    orderBy: { nome: 'asc' }
  })
  console.log(JSON.stringify(products, null, 2))
}

main()
  .then(() => prisma.$disconnect())
  .catch(e => { console.error(e.message); prisma.$disconnect(); process.exit(1) })
