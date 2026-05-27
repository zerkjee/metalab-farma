import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"

const connectionString = process.env.DATABASE_URL!
const adapter = new PrismaPg({ connectionString, max: 2, ssl: { rejectUnauthorized: false } })
const prisma = new PrismaClient({ adapter })

// Products that have images from the Drive — set imagemUrl and keep active
const productImages: Record<string, string> = {
  "articulice-curcuma-30-comprimidos": "/products/articulice-curcuma.jpg",
  "articulice-curcuma-30comp-kit-2-unidades": "/products/articulice-curcuma-kit-2.jpg",
  "articulice-curcuma-30comp-kit-3-unidades": "/products/articulice-curcuma-kit-3.jpg",
  "condroless-complex-30comp-kit-2-unidades": "/products/condroless-kit-2.jpg",
  "condroless-complex-30comp-kit-3-unidades": "/products/condroless-kit-3.jpg",
  "condroless-complex-curcuma-30-comprimidos": "/products/condroless-curcuma.jpg",
  "enzicoba-vitamina-b12-60-comprimidos": "/products/enzicoba.jpg",
  "enzicoba-vitamina-b12-60comp-kit-2-unidades": "/products/enzicoba-kit-2.jpg",
  "flebogenol-30-comprimidos": "/products/flebogenol.jpg",
  "flebogenol-30comp-kit-2-caixas": "/products/flebogenol-kit-2.jpg",
  "flebogenol-30comp-kit-3-caixas": "/products/flebogenol-kit-3.jpg",
  "flex-a-mim-60-comprimidos": "/products/flex-a-mim.jpg",
  // Laxtrine — Drive download failed, use existing local images
  "laxtrine-geleia-250g": "/products/laxtrine_geleia.png",
  "laxtrine-geleia-250g-kit-2-unidades": "/products/laxtrine_geleia-kit-2.png",
  "laxtrine-geleia-250g-kit-3-unidades": "/products/laxtrine_geleia-kit-3.png",
  // Osteocorp — Drive download failed, use existing local image
  "osteocorp-calcio-500mg-60-comprimidos": "/products/osteocorp_500mg.png",
  // Purofer — Drive download failed, use existing local image
  "purofer-30-comprimidos": "/products/purofer_gotas.png",
}

// Products to explicitly deactivate (not in Drive folder)
const toDeactivate = [
  "carve-active-carvao-vegetal-30-comprimidos",
  "cogniflex-60-capsulas",
  "creatina-monohidratada-mtl-300g",
  "inovitann-biotina-plus-60-capsulas",
  "inovitann-cloreto-de-magnesio-pa-60-capsulas",
  "inovitann-cloreto-magnesio-60caps-kit-3",
  "inovitann-curcuma-plus-60-capsulas",
  "inovitann-nac-600mg-60-capsulas",
  "inovitann-penta-magnesio-60-capsulas",
  "inovitann-trimagnesio-ultra-60-capsulas",
  "muricalm-gotas-30ml",
  "muricalm-gotas-30ml-kit-2-unidades",
  "muricalm-xarope-120ml",
  "muricalm-xarope-120ml-kit-2-unidades",
  "muricalm-xarope-120ml-kit-3-unidades",
  "vi-syneral-folato-30-comprimidos",
  "vi-syneral-folato-30comp-kit-2-unidades",
  "flebogenol-30comp-kit-6-caixas",
  "osteocorp-kit-gestante-calcio-500mg",
]

async function main() {
  console.log("=== Updating product images and visibility ===\n")

  // Update imagemUrl for products with images
  for (const [slug, url] of Object.entries(productImages)) {
    const result = await prisma.produto.updateMany({
      where: { slug },
      data: { imagemUrl: url, ativo: true },
    })
    if (result.count > 0) {
      console.log(`✅ ${slug} → ${url}`)
    } else {
      console.log(`⚠️  Not found: ${slug}`)
    }
  }

  console.log("\n--- Deactivating products without images ---\n")

  // Deactivate products without images
  for (const slug of toDeactivate) {
    const result = await prisma.produto.updateMany({
      where: { slug },
      data: { ativo: false },
    })
    if (result.count > 0) {
      console.log(`🔴 Deactivated: ${slug}`)
    } else {
      console.log(`⚠️  Not found: ${slug}`)
    }
  }

  console.log("\n=== Done ===")
}

main()
  .then(() => prisma.$disconnect())
  .catch(e => { console.error(e.message); prisma.$disconnect(); process.exit(1) })
