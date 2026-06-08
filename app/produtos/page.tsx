import type { Metadata } from "next"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { CatalogClient } from "./CatalogClient"
import { Product } from "@/types/product"
import { prisma } from "@/lib/prisma"
import { publicStock } from "@/lib/publicProduct"
import { products as localProducts } from "@/data/products"

export const revalidate = 60

const BASE_URL = process.env.NEXT_PUBLIC_URL ?? "https://metalab-farma.vercel.app"

export const metadata: Metadata = {
  title: "Produtos | Metalab Store",
  description:
    "Explore o catálogo completo de suplementos alimentares Metalab. Articulações, vitaminas, ferro, digestão, circulação e muito mais. Qualidade com procedência garantida.",
  alternates: { canonical: `${BASE_URL}/produtos` },
  openGraph: {
    title: "Produtos Metalab Store | Suplementos Alimentares",
    description:
      "Catálogo completo de suplementos alimentares Metalab. Formulações de qualidade laboratorial para complementar sua rotina alimentar.",
    type: "website",
    url: `${BASE_URL}/produtos`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Produtos Metalab Store",
    description: "Catálogo completo de suplementos alimentares com qualidade e procedência.",
  },
}

interface Categoria {
  id: string
  nome: string
  slug: string
  ordem: number
}

async function getData(): Promise<{ produtos: Product[]; categorias: Categoria[] }> {
  try {
    const [rows, cats] = await Promise.all([
      prisma.produto.findMany({
        where: { ativo: true },
        include: { categoria: { select: { id: true, nome: true, slug: true, ordem: true } } },
        orderBy: [{ destaque: "desc" }, { criadoEm: "desc" }],
      }),
      prisma.categoria.findMany({ orderBy: { nome: "asc" } }),
    ])

    const produtos: Product[] = rows.map((p) => ({
      id: p.id,
      slug: p.slug,
      sku: p.sku ?? undefined,
      nome: p.nome,
      marca: p.marca,
      tipo: p.tipo as "SIMPLES" | "KIT",
      preco: Number(p.preco),
      precoOriginal: p.precoOriginal != null ? Number(p.precoOriginal) : null,
      estoque: publicStock(p.estoque),
      descricaoCurta: p.descricaoCurta ?? null,
      descricaoHtml: p.descricaoHtml ?? null,
      imagemUrl: p.imagemUrl ?? null,
      tags: p.tags,
      ativo: p.ativo,
      destaque: p.destaque,
      corPrincipal: p.corPrincipal ?? null,
      categoriaId: p.categoriaId ?? null,
      categoria: p.categoria
        ? { id: p.categoria.id, nome: p.categoria.nome, slug: p.categoria.slug }
        : null,
      criadoEm: p.criadoEm.toISOString(),
    }))

    return { produtos, categorias: cats }
  } catch {
    return { produtos: localProducts, categorias: [] }
  }
}

export default async function ProdutosPage() {
  const { produtos, categorias } = await getData()

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Produtos Metalab Store",
    description:
      "Catálogo completo de suplementos alimentares Metalab. Articulações, vitaminas, ferro, digestão, circulação e mais.",
    url: `${BASE_URL}/produtos`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: produtos.length,
      itemListElement: produtos.slice(0, 20).map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Product",
          name: p.nome,
          url: `${BASE_URL}/produtos/${p.slug}`,
          image: p.imagemUrl ?? undefined,
          offers: {
            "@type": "Offer",
            price: p.preco,
            priceCurrency: "BRL",
            availability:
              p.estoque > 0
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
          },
        },
      })),
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main className="min-h-screen bg-[#fafafa]">
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <p className="text-sm font-semibold text-[#0f2756] uppercase tracking-widest mb-2">
              Catálogo Completo
            </p>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">
              Produtos Metalab
            </h1>
            <p className="text-gray-500 text-base max-w-2xl">
              Suplementos alimentares com tecnologia, cuidado e confiança em cada fórmula.
              Sem indicação terapêutica.
            </p>
          </div>
        </div>

        <CatalogClient produtos={produtos} categorias={categorias} />
      </main>
      <Footer />
    </>
  )
}
