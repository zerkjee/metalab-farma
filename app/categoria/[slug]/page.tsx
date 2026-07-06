import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ProductSection from '@/components/ProductSection'
import { Product } from '@/types/product'
import { prisma } from '@/lib/prisma'
import { publicStock } from '@/lib/publicProduct'

export const revalidate = 60

const BASE = process.env.NEXT_PUBLIC_URL ?? 'https://metalab-farma.vercel.app'

interface PageProps {
  params: Promise<{ slug: string }>
}

// Pré-gera as categorias que têm produto ativo
export async function generateStaticParams() {
  try {
    const cats = await prisma.categoria.findMany({
      where: { produtos: { some: { ativo: true } } },
      select: { slug: true },
    })
    return cats.map((c) => ({ slug: c.slug }))
  } catch {
    return []
  }
}

async function getCategoria(slug: string) {
  const categoria = await prisma.categoria.findUnique({
    where: { slug },
    select: { id: true, nome: true, slug: true },
  })
  if (!categoria) return null

  const [rows, outras] = await Promise.all([
    prisma.produto.findMany({
      where: { ativo: true, categoriaId: categoria.id },
      orderBy: [{ destaque: 'desc' }, { criadoEm: 'desc' }],
    }),
    prisma.categoria.findMany({
      where: { slug: { not: slug }, produtos: { some: { ativo: true } } },
      orderBy: [{ ordem: 'asc' }, { nome: 'asc' }],
      select: { nome: true, slug: true },
      take: 12,
    }),
  ])

  const produtos: Product[] = rows.map((p) => ({
    id: p.id,
    slug: p.slug,
    nome: p.nome,
    marca: p.marca,
    tipo: p.tipo as 'SIMPLES' | 'KIT',
    preco: Number(p.preco),
    precoOriginal: p.precoOriginal != null ? Number(p.precoOriginal) : null,
    estoque: publicStock(p.estoque),
    descricaoCurta: p.descricaoCurta ?? null,
    imagemUrl: p.imagemUrl ?? null,
    corPrincipal: p.corPrincipal ?? null,
    tags: p.tags,
    ativo: true,
  }))

  return { categoria, produtos, outras }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const data = await getCategoria(slug).catch(() => null)
  if (!data) return { title: 'Categoria não encontrada' }
  const titulo = `${data.categoria.nome} | Metalab Store`
  const description = `Suplementos de ${data.categoria.nome.toLowerCase()} com qualidade e procedência garantida. ${data.produtos.length} produtos disponíveis.`
  return {
    title: titulo,
    description,
    alternates: { canonical: `${BASE}/categoria/${data.categoria.slug}` },
    openGraph: { title: titulo, description, type: 'website', url: `${BASE}/categoria/${data.categoria.slug}` },
  }
}

export default async function CategoriaPage({ params }: PageProps) {
  const { slug } = await params
  const data = await getCategoria(slug).catch(() => null)
  if (!data) notFound()

  const { categoria, produtos, outras } = data

  return (
    <>
      <Header />

      {/* Hero da categoria */}
      <section className="bg-gradient-to-b from-surface-sunken to-surface-card border-b border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <nav className="mb-3 text-xs text-ink-muted">
            <Link href="/" className="hover:text-brand">Início</Link>
            <span className="mx-1.5">/</span>
            <Link href="/produtos" className="hover:text-brand">Produtos</Link>
            <span className="mx-1.5">/</span>
            <span className="text-ink-secondary font-medium">{categoria.nome}</span>
          </nav>
          <h1 className="font-display text-3xl sm:text-4xl font-black text-navy">{categoria.nome}</h1>
          <p className="mt-2 text-ink-secondary">
            {produtos.length} {produtos.length === 1 ? 'produto disponível' : 'produtos disponíveis'} nesta categoria
          </p>
        </div>
      </section>

      {produtos.length > 0 ? (
        <ProductSection
          title={`Produtos · ${categoria.nome}`}
          subtitle="Suplementos alimentares com qualidade e procedência garantida."
          products={produtos}
        />
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <p className="text-ink-muted text-lg">Nenhum produto disponível nesta categoria no momento.</p>
        </div>
      )}

      {/* Cross-sell: outras categorias */}
      {outras.length > 0 && (
        <section className="border-t border-line bg-surface-sunken py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-ink-secondary">Explore outras categorias</h2>
            <div className="flex flex-wrap gap-2.5">
              {outras.map((c) => (
                <Link
                  key={c.slug}
                  href={`/categoria/${c.slug}`}
                  className="rounded-full border border-line bg-surface-card px-4 py-2 text-sm font-semibold text-ink-secondary transition-all hover:border-brand/40 hover:text-brand"
                >
                  {c.nome}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </>
  )
}
