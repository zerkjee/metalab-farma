import { prisma } from "../lib/prisma"

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
