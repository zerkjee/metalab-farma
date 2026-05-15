import { config } from "dotenv"
config({ path: ".env.local" })

import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
}

async function main() {
  console.log("🌱 Iniciando seed...")

  // ── 1. Admin inicial ────────────────────────────────────────────────────────
  const senhaHash = await bcrypt.hash("metalab@2026", 12)

  const admin = await prisma.usuario.upsert({
    where: { email: "admin@metalab.com.br" },
    update: {},
    create: {
      email: "admin@metalab.com.br",
      nome: "Admin Metalab",
      senha: senhaHash,
      papel: "SUPER_ADMIN",
    },
  })
  console.log("✅ Admin criado:", admin.email)

  // ── 2. Categorias ───────────────────────────────────────────────────────────
  const categorias = [
    { nome: "Circulação e Vascular", slug: "circulacao" },
    { nome: "Sono e Relaxamento", slug: "sono" },
    { nome: "Digestão e Intestino", slug: "digestao" },
    { nome: "Ferro e Anemia", slug: "ferro" },
    { nome: "Cálcio e Ossos", slug: "calcio" },
    { nome: "Articulações", slug: "articulacoes" },
    { nome: "Magnésio", slug: "magnesio" },
    { nome: "Vitaminas", slug: "vitaminas" },
    { nome: "Zinco e Imunidade", slug: "zinco" },
    { nome: "Respiratório", slug: "respiratorio" },
    { nome: "Fígado", slug: "figado" },
    { nome: "Saúde Ocular", slug: "ocular" },
    { nome: "Gestantes", slug: "gestantes" },
    { nome: "Proteína Vegetal", slug: "proteina-vegetal" },
    { nome: "Cabelo e Unhas", slug: "cabelo-unhas" },
    { nome: "Antioxidantes", slug: "antioxidantes" },
  ]

  for (const cat of categorias) {
    await prisma.categoria.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    })
  }
  console.log("✅ Categorias criadas:", categorias.length)

  // ── 3. Cupons iniciais ──────────────────────────────────────────────────────
  const cupons = [
    { codigo: "BEMVINDO10", tipo: "PERCENTUAL" as const, valor: 10 },
    { codigo: "FRETEGRATIS", tipo: "FRETE_GRATIS" as const, valor: 0 },
    { codigo: "VIP20", tipo: "PERCENTUAL" as const, valor: 20 },
    { codigo: "METALAB15", tipo: "PERCENTUAL" as const, valor: 15 },
    { codigo: "PROMO30", tipo: "PERCENTUAL" as const, valor: 30, usoMaximo: 100 },
  ]

  for (const cupom of cupons) {
    await prisma.cupom.upsert({
      where: { codigo: cupom.codigo },
      update: {},
      create: cupom,
    })
  }
  console.log("✅ Cupons criados:", cupons.length)

  // ── 4. Produtos base (primeiros 10 para teste) ──────────────────────────────
  // Os demais são importados via script separado ou pelo admin
  const produtosSeed = [
    {
      nome: "Flebogenol 30 Comprimidos",
      preco: 69.9,
      estoque: 50,
      imagemUrl: "/products/flebogenol.png",
      descricaoCurta: "Pinus Pinaster 50mg para circulação sanguínea e saúde vascular",
      descricaoHtml: "<p>Flebogenol com Pinus Pinaster 50mg apoia a saúde vascular e a circulação sanguínea.</p>",
      corPrincipal: "#1e40af",
    },
    {
      nome: "Laxtrine Geleia 250g",
      preco: 59.9,
      estoque: 40,
      imagemUrl: "/products/laxtrine-geleia.png",
      descricaoCurta: "Fibras prebióticas para funcionamento intestinal saudável",
      descricaoHtml: "<p>Laxtrine Geleia com inulina, FOS e ameixa para combater a constipação intestinal.</p>",
      corPrincipal: "#15803d",
    },
    {
      nome: "Muricalm Xarope 120ml",
      preco: 49.9,
      estoque: 60,
      imagemUrl: "/products/muricalm-xarope.png",
      descricaoCurta: "Melatonina + Triptofano + B6 para sono de qualidade",
      descricaoHtml: "<p>Muricalm Xarope combina melatonina, L-triptofano e vitamina B6 para melhorar o sono.</p>",
      corPrincipal: "#5b21b6",
    },
    {
      nome: "Purofer 30 Comprimidos",
      preco: 39.9,
      estoque: 45,
      imagemUrl: "/products/purofer.png",
      descricaoCurta: "Bisglicinato Ferroso 30mg — ferro de alta absorção",
      descricaoHtml: "<p>Purofer com Bisglicinato Ferroso para tratamento de anemia ferropriva.</p>",
      corPrincipal: "#b91c1c",
    },
    {
      nome: "Flex-A-Mim 70 Comprimidos",
      preco: 79.9,
      estoque: 30,
      imagemUrl: "/products/flex-a-mim.png",
      descricaoCurta: "Glucosamina 500mg + Condroitina 400mg para articulações",
      descricaoHtml: "<p>Flex-A-Mim com glucosamina e condroitina para saúde articular e mobilidade.</p>",
      corPrincipal: "#0f766e",
    },
  ]

  for (const prod of produtosSeed) {
    const slug = slugify(prod.nome)
    const sku = `MTL-${slug.toUpperCase().replace(/-/g, "").slice(0, 10)}`

    await prisma.produto.upsert({
      where: { slug },
      update: {},
      create: {
        ...prod,
        slug,
        sku,
        marca: "Metalab",
        destaque: true,
      },
    })
  }
  console.log("✅ Produtos seed criados:", produtosSeed.length)

  // ── 5. Banner inicial ───────────────────────────────────────────────────────
  await prisma.banner.upsert({
    where: { id: "banner-inicial" },
    update: {},
    create: {
      id: "banner-inicial",
      titulo: "Suplementos de Alta Qualidade",
      subtitulo: "Desenvolvidos com rigor científico para sua saúde",
      imagemUrl: "/banners/hero-banner.jpg",
      linkUrl: "/produtos",
      ordem: 1,
      ativo: true,
    },
  })
  console.log("✅ Banner criado")

  console.log("\n🎉 Seed concluído!")
  console.log("📧 Admin: admin@metalab.com.br")
  console.log("🔑 Senha: metalab@2026")
  console.log("⚠️  TROQUE A SENHA EM PRODUÇÃO!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
