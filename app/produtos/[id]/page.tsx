import Image from 'next/image';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductDetailHero from '@/components/ProductDetailHero';
import ProductSection from '@/components/ProductSection';
import ProductReviews from '@/components/reviews/ProductReviews';
import PurchaseNotification from '@/components/social-proof/PurchaseNotification';
import TrackViewItem from '@/components/analytics/TrackViewItem';
import { products as localProducts } from '@/data/products';
import { getProductDetail } from '@/utils/productDetails';
import type { Ingrediente } from '@/utils/productDetails';
import { Product } from '@/types/product';
import { prisma } from '@/lib/prisma';
import { publicStock } from '@/lib/publicProduct';
import { getInovitannTheme } from '@/lib/inovitann-themes';
import InovitannProductPage from '@/components/inovitann/InovitannProductPage';
import DermatroxProductPage from '@/components/maxma/DermatroxProductPage';
import MelasunProductPage from '@/components/maxma/MelasunProductPage';
import IngredientResearchCards from '@/components/IngredientResearchCards';
import { matchResearch } from '@/lib/ingredient-research';

// Converte o texto de composição do banco em Ingrediente[] para o ComposicaoSection
function composicaoFromText(text: string): Ingrediente[] {
  const delimiter = text.includes(';') ? ';' : ','
  return text
    .split(delimiter)
    .map((s) => s.trim())
    .filter((s) => s.length > 1)
    .map((nome) => ({ nome, descricao: '', icone: 'Sparkles' }))
}

export const revalidate = 60

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

// Pré-gera páginas para todos os produtos ativos em build time (ISR: revalida a cada 60s)
export async function generateStaticParams() {
  try {
    const products = await prisma.produto.findMany({
      where: { ativo: true },
      select: { slug: true },
    })
    return products.map((p) => ({ id: p.slug }))
  } catch {
    return []
  }
}

async function getProduto(idParam: string): Promise<Product | null> {
  try {
    const p = await prisma.produto.findFirst({
      where: { OR: [{ slug: idParam }, { id: idParam }] },
    })
    if (p) {
      return {
        id: p.id,
        slug: p.slug,
        sku: p.sku ?? undefined,
        nome: p.nome,
        marca: p.marca,
        tipo: p.tipo as 'SIMPLES' | 'KIT',
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
        composicao: p.composicao ?? null,
        modoDeUso: p.modoDeUso ?? null,
        criadoEm: p.criadoEm.toISOString(),
      }
    }
  } catch {
    // fallback para dados locais
  }

  return localProducts.find((p) => p.id === idParam || p.slug === idParam) ?? null
}

// Cross-sell: produtos ativos da mesma categoria (exceto o atual)
async function getRelacionados(categoriaId: string | null | undefined, excluirId: string): Promise<Product[]> {
  if (!categoriaId) return []
  try {
    const rows = await prisma.produto.findMany({
      where: { ativo: true, categoriaId, id: { not: excluirId } },
      orderBy: [{ destaque: 'desc' }, { criadoEm: 'desc' }],
      take: 4,
    })
    return rows.map((p) => ({
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
  } catch {
    return []
  }
}

const BASE = process.env.NEXT_PUBLIC_URL || 'https://metalab-farma.vercel.app'

export async function generateMetadata({ params }: ProductPageProps) {
  const { id: idParam } = await params
  const produto = await getProduto(idParam)

  if (!produto) return { title: 'Produto não encontrado' }

  const description = produto.descricaoCurta ?? `${produto.nome} — Suplemento alimentar de qualidade e procedência garantida.`

  return {
    title: produto.nome,
    description,
    alternates: {
      canonical: `${BASE}/produtos/${produto.slug}`,
    },
    openGraph: {
      title: produto.nome,
      description,
      type: 'website' as const,
      url: `${BASE}/produtos/${produto.slug}`,
      ...(produto.imagemUrl ? { images: [{ url: produto.imagemUrl, alt: produto.nome }] } : {}),
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: produto.nome,
      description,
      ...(produto.imagemUrl ? { images: [produto.imagemUrl] } : {}),
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id: idParam } = await params
  const produto = await getProduto(idParam)

  if (!produto) notFound()

  const relacionados = await getRelacionados(produto.categoriaId, produto.id)

  const numericId = parseInt(produto.id.replace('local-', '')) || 0
  const detail = getProductDetail(numericId)
  const corPrincipal = produto.corPrincipal ?? detail?.cor_principal ?? '#323C64'

  // Inovitann: tema exclusivo por produto
  const inovitannTheme = getInovitannTheme(produto.slug)

  // Composição: preferir dado do banco, fallback para dado estático legado
  const composicaoIngredientes: Ingrediente[] | null =
    produto.composicao
      ? composicaoFromText(produto.composicao)
      : detail?.composicao ?? null

  // Modo de uso: preferir dado do banco, fallback para dado estático legado
  const modoDeUsoText =
    produto.modoDeUso ??
    detail?.modo_uso ??
    'Conforme orientação do fabricante ou de um profissional habilitado. Não auto-medicar.'

  const researchCards = matchResearch(
    (composicaoIngredientes ?? []).filter(i => i.nome.length <= 80).map(i => i.nome),
    6,
  )

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: produto.nome,
    description: produto.descricaoCurta ?? produto.nome,
    brand: { '@type': 'Brand', name: produto.marca },
    ...(produto.imagemUrl ? { image: produto.imagemUrl } : {}),
    offers: {
      '@type': 'Offer',
      priceCurrency: 'BRL',
      price: produto.preco.toFixed(2),
      availability: produto.estoque > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: `${BASE}/produtos/${produto.slug}`,
    },
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE },
      { '@type': 'ListItem', position: 2, name: produto.nome },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <TrackViewItem id={produto.id} name={produto.nome} price={produto.preco} />
      <Header />

      <ProductDetailHero product={produto} corPrincipal={corPrincipal} />

      {produto.slug === 'dermatrox' ? (
        <DermatroxProductPage imagemUrl={produto.imagemUrl} />
      ) : produto.slug === 'melasun' ? (
        <MelasunProductPage imagemUrl={produto.imagemUrl} />
      ) : inovitannTheme ? (
        <InovitannProductPage
          theme={inovitannTheme}
          productName={produto.nome}
          imagemUrl={produto.imagemUrl}
        />
      ) : (
        <>
          {/* ── SPLIT: descrição + ingredientes | imagem ─── */}
          <section id="descricao" className="py-14 bg-surface-card border-b border-line">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

                {/* Esquerda: texto + chips */}
                <div>
                  <p
                    className="text-xs font-black uppercase tracking-[0.2em] mb-2"
                    style={{ color: corPrincipal }}
                  >
                    {produto.marca}
                  </p>
                  <h2 className="font-display text-2xl sm:text-3xl font-black text-navy mb-5 leading-tight">
                    {produto.nome}
                  </h2>
                  <p className="text-ink-secondary text-base sm:text-lg leading-relaxed mb-5">
                    {(() => {
                      const raw = produto.descricaoCurta ?? ''
                      const isTableData = /tabela nutricional|vd não|porção \d|mg =|ins \d/i.test(raw)
                      return !isTableData && raw.length > 20
                        ? raw
                        : `${produto.nome} é um suplemento alimentar desenvolvido para complementar sua rotina nutricional com qualidade, segurança e procedência garantidas.`
                    })()}
                  </p>

                  {/* Benefícios / descrição rica em HTML */}
                  {produto.descricaoHtml && (() => {
                    const isTableData = /tabela nutricional|vd não|porção \d|mg =|ins \d/i.test(produto.descricaoHtml!)
                    if (isTableData) return null
                    return (
                      <div
                        className="mb-7 text-sm text-ink-secondary leading-relaxed
                          [&_ul]:pl-4 [&_ul]:space-y-2
                          [&_li]:list-none [&_li]:flex [&_li]:items-start [&_li]:gap-2
                          [&_li]:before:content-['▸'] [&_li]:before:shrink-0 [&_li]:before:mt-0.5 [&_li]:before:font-bold
                          [&_p]:mb-2 [&_strong]:text-navy [&_strong]:font-semibold"
                        style={{ '--li-color': corPrincipal } as React.CSSProperties}
                        dangerouslySetInnerHTML={{ __html: produto.descricaoHtml }}
                      />
                    )
                  })()}

                  {/* Chips de ingredientes — só os limpos (nome curto) */}
                  {(() => {
                    const chips = (composicaoIngredientes ?? []).filter(i => i.nome.length <= 80)
                    if (chips.length === 0) return null
                    return (
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-widest text-ink-muted mb-3">
                          Ingredientes
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {chips.map(ing => (
                            <span
                              key={ing.nome}
                              className="px-3 py-1.5 rounded-full text-xs font-semibold border"
                              style={{
                                backgroundColor: `${corPrincipal}08`,
                                color: corPrincipal,
                                borderColor: `${corPrincipal}30`,
                              }}
                            >
                              {ing.nome}
                            </span>
                          ))}
                        </div>
                      </div>
                    )
                  })()}
                </div>

                {/* Direita: imagem flutuante */}
                {produto.imagemUrl && (
                  <div className="flex items-center justify-center">
                    <div className="relative w-72 h-72 sm:w-96 sm:h-96">
                      <Image
                        src={produto.imagemUrl}
                        alt={produto.nome}
                        fill
                        sizes="(max-width: 640px) 288px, 384px"
                        className="object-contain"
                        style={{ filter: `drop-shadow(0 16px 48px ${corPrincipal}35)` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ── CARDS DE PESQUISA CIENTÍFICA ─── */}
          <IngredientResearchCards cards={researchCards} />

          {/* ── COMO USAR + AVISO LEGAL ─── */}
          <section className="py-12 bg-surface-sunken border-b border-line">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <p
                  className="text-[11px] font-black uppercase tracking-widest mb-3"
                  style={{ color: corPrincipal }}
                >
                  Como tomar
                </p>
                <p className="text-ink-secondary text-sm leading-relaxed">{modoDeUsoText}</p>
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-ink-muted mb-3">
                  Informações importantes
                </p>
                <ul className="space-y-1.5 text-sm text-ink-secondary">
                  <li>Não é medicamento. Sem indicação terapêutica.</li>
                  <li>Leia o rótulo antes de consumir.</li>
                  <li>Manter fora do alcance de crianças.</li>
                  <li>Consulte um profissional de saúde se necessário.</li>
                </ul>
              </div>
            </div>
          </section>
        </>
      )}

      {relacionados.length > 0 && (
        <ProductSection
          title="Da mesma categoria"
          subtitle="Clientes que viram este produto também levaram estes — aproveite e combine."
          products={relacionados}
          color={corPrincipal}
        />
      )}

      <ProductReviews productId={produto.id} color={corPrincipal} />

      <section className="py-16 bg-surface-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-black text-navy mb-4">
            Pronto para adicionar este produto à sua rotina?
          </h2>
          <p className="text-ink-secondary mb-8 text-lg">Complemente sua alimentação com qualidade e segurança</p>
          <p className="text-xs text-ink-muted mt-8">
            Suplemento alimentar. Este produto não é medicamento. Sem indicação terapêutica. Leia o rótulo.
          </p>
        </div>
      </section>

      <Footer />
      <PurchaseNotification />
    </>
  )
}
