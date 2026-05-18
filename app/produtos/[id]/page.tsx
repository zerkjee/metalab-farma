import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import ProductDetailHero from '@/components/ProductDetailHero';
import ComposicaoSection from '@/components/ComposicaoSection';
import ProductReviews from '@/components/reviews/ProductReviews';
import PurchaseNotification from '@/components/social-proof/PurchaseNotification';
import TrackViewItem from '@/components/analytics/TrackViewItem';
import { products as localProducts } from '@/data/products';
import { getProductDetail } from '@/utils/productDetails';
import { Product } from '@/types/product';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

async function getProduto(idParam: string): Promise<Product | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_URL ?? 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/produtos/${idParam}`, {
      next: { revalidate: 60 },
    })
    if (res.ok) {
      const p = await res.json()
      return {
        id: String(p.id),
        slug: String(p.slug),
        sku: p.sku ? String(p.sku) : undefined,
        nome: String(p.nome),
        marca: String(p.marca ?? 'Metalab'),
        preco: Number(p.preco),
        precoOriginal: p.precoOriginal ? Number(p.precoOriginal) : null,
        estoque: Number(p.estoque ?? 0),
        descricaoCurta: p.descricaoCurta ? String(p.descricaoCurta) : null,
        descricaoHtml: p.descricaoHtml ? String(p.descricaoHtml) : null,
        imagemUrl: p.imagemUrl ? String(p.imagemUrl) : null,
        ativo: Boolean(p.ativo),
        destaque: Boolean(p.destaque),
        corPrincipal: p.corPrincipal ? String(p.corPrincipal) : null,
        criadoEm: p.criadoEm ? String(p.criadoEm) : undefined,
      }
    }
  } catch {
    // fallback para dados locais
  }

  return localProducts.find((p) => p.id === idParam || p.slug === idParam) ?? null
}

const BASE = process.env.NEXT_PUBLIC_URL ?? 'https://metalab-farma.vercel.app'

export async function generateMetadata({ params }: ProductPageProps) {
  const { id: idParam } = await params
  const produto = await getProduto(idParam)

  if (!produto) return { title: 'Produto não encontrado' }

  const description = produto.descricaoCurta ?? `${produto.nome} — Suplemento alimentar de qualidade e procedência garantida.`

  return {
    title: produto.nome,
    description,
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

  const numericId = parseInt(produto.id.replace('local-', '')) || 0
  const detail = getProductDetail(numericId)
  const corPrincipal = produto.corPrincipal ?? detail?.cor_principal ?? '#6b21a8'

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
      <ScrollToTop />
      <Header />

      <ProductDetailHero product={produto} corPrincipal={corPrincipal} />

      <section className="py-16 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">
              Por que escolher este produto?
            </h2>
            <p className="text-gray-600">Qualidade, segurança e confiança em cada detalhe</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Qualidade Garantida', desc: 'Produto lacrado com procedência certificada' },
              { title: 'Fórmula Pensada', desc: 'Desenvolvimento técnico rigoroso e cuidadoso' },
              { title: 'Produto Lacrado', desc: 'Segurança e integridade da embalagem garantidas' },
              { title: 'Compra Segura', desc: 'Processo de compra protegido e confiável' },
            ].map((card) => (
              <div key={card.title} className="p-6 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 rounded-full mb-4" style={{ background: corPrincipal }} />
                <h3 className="font-bold text-gray-900 mb-2">{card.title}</h3>
                <p className="text-sm text-gray-600">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {detail && <ComposicaoSection composicao={detail.composicao} corPrincipal={corPrincipal} />}

      <section className="py-16 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">Como incluir na rotina</h2>
          </div>
          <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              {detail?.modo_uso ?? 'Conforme orientação do fabricante ou de um profissional habilitado. Não auto-medicar.'}
            </p>
            <div className="space-y-4 text-sm text-gray-600">
              <p>✓ Consulte o rótulo do produto para orientações específicas</p>
              <p>✓ Se preferir, consulte um profissional de saúde habilitado</p>
              <p>✓ Mantenha consistência no uso conforme recomendado</p>
              <p>✓ Este produto não é medicamento e não trata doenças</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">Informações Importantes</h2>
          </div>
          <div className="bg-white rounded-xl p-8 border border-gray-200 space-y-4">
            {[
              'Este produto não é medicamento. Não possui indicação terapêutica. Leia o rótulo antes de consumir.',
              'Sem indicação terapêutica. Suplemento alimentar para complementar a rotina alimentar.',
              'Consulte um profissional habilitado em caso de dúvidas sobre o uso deste produto.',
              'Manter fora do alcance de crianças. Armazenar em local fresco e seco.',
              'Verificar embalagem antes do consumo. Não consumir se a embalagem estiver danificada.',
            ].map((text, i) => (
              <div key={i} className="flex gap-4">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold"
                  style={{ backgroundColor: corPrincipal }}
                >
                  ⓘ
                </div>
                <p className="text-gray-700">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ProductReviews productId={produto.id} color={corPrincipal} />

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
            Pronto para adicionar este produto à sua rotina?
          </h2>
          <p className="text-gray-600 mb-8 text-lg">Complemente sua alimentação com qualidade e segurança</p>
          <p className="text-xs text-gray-400 mt-8">
            Suplemento alimentar. Este produto não é medicamento. Sem indicação terapêutica. Leia o rótulo.
          </p>
        </div>
      </section>

      <Footer />
      <PurchaseNotification />
    </>
  )
}
