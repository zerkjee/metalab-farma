import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
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
import { getInovitannDesignImage } from '@/lib/inovitann-design';
import { safeJsonLd } from '@/lib/json-ld';
import InovitannProductPage from '@/components/inovitann/InovitannProductPage';
import DermatroxProductPage from '@/components/maxma/DermatroxProductPage';
import MelasunProductPage from '@/components/maxma/MelasunProductPage';
import IngredientResearchCards from '@/components/IngredientResearchCards';
import ProductFaq from '@/components/informativos/ProductFaq';
import ProductVisualStory from '@/components/informativos/ProductVisualStory';
import ComingSoonStoreButton from '@/components/informativos/ComingSoonStoreButton';
import { matchResearch } from '@/lib/ingredient-research';
import { getInformativeProduct } from '@/data/informativos';
import { buildProductFaq, buildProductVisualStory } from '@/data/informativos/product-experience';
import { buildProductTechnicalOverview } from '@/data/informativos/technical-explanations';
import ProductImage from '@/components/ProductImage';

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

function absoluteImageUrl(image: string | null | undefined) {
  if (!image) return null
  if (/^https?:\/\//i.test(image)) return image
  return `${BASE}${image.startsWith('/') ? image : `/${image}`}`
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { id: idParam } = await params
  const produto = await getProduto(idParam)

  if (!produto) return { title: 'Produto não encontrado' }

  const description = produto.descricaoCurta ?? `${produto.nome} — Suplemento alimentar de qualidade e procedência garantida.`
  const inovitannTheme = getInovitannTheme(produto.slug)
  const image = inovitannTheme
    ? getInovitannDesignImage(inovitannTheme.slug) ?? produto.imagemUrl
    : produto.imagemUrl

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
      ...(image ? { images: [{ url: image, alt: produto.nome }] } : {}),
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: produto.nome,
      description,
      ...(image ? { images: [image] } : {}),
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

  // Conteúdo comercial deve ceder lugar à ficha técnica quando há fonte rastreável.
  // Isso impede que descrições antigas do banco contradigam o SKU e o rótulo atual.
  const informativeProduct = getInformativeProduct(produto.slug)
  const informativeOverview = informativeProduct?.profile
    ? buildProductTechnicalOverview(informativeProduct.slug, informativeProduct.profile)
    : null
  const safeTechnicalDescription = informativeProduct
    ? informativeProduct.profile && informativeOverview?.status === 'available'
      ? informativeOverview.purpose
      : 'A composição técnica deste SKU está em validação documental. Consulte o folheto e o rótulo físico vigente antes de consumir.'
    : null
  const displayProduct: Product = safeTechnicalDescription
    ? {
        ...produto,
        descricaoCurta: safeTechnicalDescription,
        descricaoHtml: null,
        composicao: informativeProduct?.profile?.ingredients.join('; ') ?? null,
        modoDeUso: null,
      }
    : produto

  // Composição: ficha técnica/OCR conciliada > banco > dado estático legado.
  const composicaoIngredientes: Ingrediente[] | null =
    informativeProduct?.profile
      ? informativeProduct.profile.ingredients.map((nome) => ({ nome, descricao: '', icone: 'Sparkles' }))
      : informativeProduct
      ? null
      : produto.composicao
      ? composicaoFromText(produto.composicao)
      : detail?.composicao ?? null

  // Porção nutricional não vira posologia automática.
  const modoDeUsoText =
    informativeProduct
      ? informativeProduct.profile?.serving
        ? `A ficha informa a porção nutricional de referência ${informativeProduct.profile.serving}. Confirme o modo de uso exclusivamente no rótulo físico vigente.`
        : informativeProduct.profile
        ? 'O modo de uso não foi identificado de forma inequívoca na ficha processada. Confirme exclusivamente no rótulo físico vigente.'
        : 'A ficha deste SKU ainda está em validação. Não reutilizamos o modo de uso do banco comercial; confira exclusivamente o rótulo físico vigente.'
      : produto.modoDeUso ??
        detail?.modo_uso ??
        'Conforme orientação do fabricante ou de um profissional habilitado. Não auto-medicar.'

  const researchCards = informativeProduct
    ? []
    : matchResearch(
        (composicaoIngredientes ?? []).filter(i => i.nome.length <= 80).map(i => i.nome),
        6,
      )

  const informativeFaq = informativeProduct ? buildProductFaq(informativeProduct, informativeOverview) : []
  const informativeVisual = informativeProduct
    ? buildProductVisualStory(informativeProduct, informativeOverview)
    : null
  const selectedProductImage = inovitannTheme
    ? getInovitannDesignImage(inovitannTheme.slug) ?? produto.imagemUrl
    : produto.imagemUrl
  const productJsonLdImage = absoluteImageUrl(selectedProductImage)

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: produto.nome,
    description: displayProduct.descricaoCurta ?? produto.nome,
    brand: { '@type': 'Brand', name: produto.marca },
    ...(productJsonLdImage ? { image: productJsonLdImage } : {}),
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(productJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }} />
      <TrackViewItem id={produto.id} name={produto.nome} price={produto.preco} />
      <Header />

      {inovitannTheme && !informativeProduct ? (
        <InovitannProductPage
          theme={inovitannTheme}
          product={displayProduct}
        />
      ) : (
        <>
          <ProductDetailHero product={displayProduct} corPrincipal={corPrincipal} />

          {produto.slug === 'dermatrox' && !informativeProduct ? (
            <DermatroxProductPage imagemUrl={produto.imagemUrl} />
          ) : produto.slug === 'melasun' && !informativeProduct ? (
            <MelasunProductPage imagemUrl={produto.imagemUrl} />
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
                      const raw = displayProduct.descricaoCurta ?? ''
                      const isTableData = /tabela nutricional|vd não|porção \d|mg =|ins \d/i.test(raw)
                      return !isTableData && raw.length > 20
                        ? raw
                        : `${produto.nome} é um suplemento alimentar desenvolvido para complementar sua rotina nutricional com qualidade, segurança e procedência garantidas.`
                    })()}
                  </p>

                  {/* Benefícios / descrição rica em HTML */}
                  {displayProduct.descricaoHtml && (() => {
                    const isTableData = /tabela nutricional|vd não|porção \d|mg =|ins \d/i.test(displayProduct.descricaoHtml!)
                    if (isTableData) return null
                    return (
                      <div
                        className="mb-7 text-sm text-ink-secondary leading-relaxed
                          [&_ul]:pl-4 [&_ul]:space-y-2
                          [&_li]:list-none [&_li]:flex [&_li]:items-start [&_li]:gap-2
                          [&_li]:before:content-['▸'] [&_li]:before:shrink-0 [&_li]:before:mt-0.5 [&_li]:before:font-bold
                          [&_p]:mb-2 [&_strong]:text-navy [&_strong]:font-semibold"
                        style={{ '--li-color': corPrincipal } as React.CSSProperties}
                        dangerouslySetInnerHTML={{ __html: displayProduct.descricaoHtml }}
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
                    <div className="h-72 w-72 sm:h-96 sm:w-96">
                      <ProductImage
                        src={produto.imagemUrl}
                        alt={produto.nome}
                        sizes="(max-width: 640px) 288px, 384px"
                        frameClassName="h-full w-full"
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
        </>
      )}

      {informativeProduct && (
        <section id="perguntas-frequentes" className="border-b border-line bg-surface-page py-14 sm:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-brand-700">Entenda antes de escolher</p>
              <h2 className="mt-3 font-display text-3xl font-black text-ink sm:text-4xl">Origem, fórmula e respostas rápidas</h2>
              <p className="mt-4 text-base leading-relaxed text-ink-secondary">
                Informações técnicas curtas, ligadas ao folheto documental deste produto e separadas da oferta comercial.
              </p>
            </div>

            {informativeVisual && <ProductVisualStory story={informativeVisual} />}

            <div className="mt-8 rounded-lg border border-line bg-surface-card p-5 shadow-sm sm:p-7">
              <h3 className="font-display text-2xl font-black text-ink">Perguntas frequentes</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-secondary">Composição, porção de referência, origem e conferência do rótulo em respostas diretas.</p>
              <ProductFaq items={informativeFaq} />
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/informativos/${informativeProduct.slug}`}
                className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-black text-on-brand transition hover:bg-brand-hover"
              >
                Abrir folheto técnico <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <ComingSoonStoreButton productName={informativeProduct.nome} />
            </div>
          </div>
        </section>
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
