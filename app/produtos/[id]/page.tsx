import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import ProductDetailHero from '@/components/ProductDetailHero';
import ComposicaoSection from '@/components/ComposicaoSection';
import ProductReviews from '@/components/reviews/ProductReviews';
import PurchaseNotification from '@/components/social-proof/PurchaseNotification';
import { products as localProducts } from '@/data/products';
import { getProductDetail } from '@/utils/productDetails';

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: ProductPageProps) {
  const resolvedParams = await params;
  const productId = parseInt(resolvedParams.id);
  const produto = localProducts.find((p) => p.id === productId);

  if (!produto) {
    return {
      title: 'Produto não encontrado',
    };
  }

  return {
    title: `${produto.nome} | Metalab Store`,
    description: `${produto.nome} - Suplemento alimentar de qualidade e procedência garantida. Compre agora!`,
    openGraph: {
      title: `${produto.nome}`,
      description: `Suplemento alimentar de qualidade e procedência garantida.`,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = await params;
  const productId = parseInt(resolvedParams.id);
  const produto = localProducts.find((p) => p.id === productId);

  if (!produto) {
    notFound();
  }

  const detail = getProductDetail(productId);
  const corPrincipal = produto.cor_principal || detail?.cor_principal || '#6b21a8';
  const corSecundaria =
    produto.cor_secundaria || detail?.cor_secundaria || '#f3f4f6';

  return (
    <>
      <ScrollToTop />
      <Header />

      {/* Hero */}
      <ProductDetailHero product={produto} corPrincipal={corPrincipal} />

      {/* Por que escolher */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">
              Por que escolher este produto?
            </h2>
            <p className="text-gray-600">
              Qualidade, segurança e confiança em cada detalhe
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="p-6 bg-gray-50 rounded-xl">
              <div className="mb-4">
                <svg
                  className="w-8 h-8"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  style={{ color: corPrincipal }}
                >
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path
                    fillRule="evenodd"
                    d="M4 5a2 2 0 012-2 1 1 0 000 2v1h1V5a2 2 0 012-2 1 1 0 000 2v1h1V5a2 2 0 012-2 1 1 0 000 2v1h1V5a2 2 0 012-2v2a1 1 0 100 2V7h1a1 1 0 100-2h-1V5a1 1 0 000-2 2 2 0 00-2 2v1h-1V5a2 2 0 00-2-2v2a1 1 0 100 2v1h-1V5a2 2 0 00-2-2v2a1 1 0 100 2v1H5a1 1 0 100-2H4v1a2 2 0 00-2 2v2a2 2 0 002 2v-1a1 1 0 100-2 1 1 0 000-2h1v1a1 1 0 100 2 1 1 0 000 2h-1v1a2 2 0 002 2 1 1 0 100-2v-1h1a1 1 0 100-2 2 2 0 002-2v-1h1a1 1 0 100-2 1 1 0 000-2h1v-1a2 2 0 00-2-2 1 1 0 100-2v1H6a2 2 0 00-2-2v1a1 1 0 100 2v1H4a1 1 0 100-2H3v1a2 2 0 002 2 1 1 0 000 2v1h1a1 1 0 100 2 2 2 0 002-2v-1h1a1 1 0 100-2 1 1 0 000-2h-1v1a1 1 0 100-2h1v1a2 2 0 00-2 2 1 1 0 100-2v-1H7a2 2 0 00-2-2 1 1 0 100-2h1v-1a1 1 0 100-2H5a1 1 0 100 2v1H4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">
                Qualidade Garantida
              </h3>
              <p className="text-sm text-gray-600">
                Produto lacrado com procedência certificada
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 bg-gray-50 rounded-xl">
              <div className="mb-4">
                <svg
                  className="w-8 h-8"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  style={{ color: corPrincipal }}
                >
                  <path
                    fillRule="evenodd"
                    d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">
                Fórmula Pensada
              </h3>
              <p className="text-sm text-gray-600">
                Desenvolvimento técnico rigoroso e cuidadoso
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-6 bg-gray-50 rounded-xl">
              <div className="mb-4">
                <svg
                  className="w-8 h-8"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  style={{ color: corPrincipal }}
                >
                  <path
                    fillRule="evenodd"
                    d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.25l4 6a1 1 0 010 1.5l-4 6A1 1 0 0112 16v-2.071a1 1 0 00-.504-.864l-1.858-1.146a1 1 0 010-1.638l1.858-1.146A1 1 0 0012 8.071V6a1 1 0 01.967-.75z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">
                Produto Lacrado
              </h3>
              <p className="text-sm text-gray-600">
                Segurança e integridade da embalagem garantidas
              </p>
            </div>

            {/* Card 4 */}
            <div className="p-6 bg-gray-50 rounded-xl">
              <div className="mb-4">
                <svg
                  className="w-8 h-8"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  style={{ color: corPrincipal }}
                >
                  <path
                    fillRule="evenodd"
                    d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">
                Compra Segura
              </h3>
              <p className="text-sm text-gray-600">
                Processo de compra protegido e confiável
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Composição */}
      {detail && <ComposicaoSection composicao={detail.composicao} corPrincipal={corPrincipal} />}

      {/* Como incluir na rotina */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">
              Como incluir na rotina
            </h2>
          </div>

          <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              {detail?.modo_uso ||
                'Conforme orientação do fabricante ou de um profissional habilitado. Não auto-medicar.'}
            </p>

            <div className="space-y-4 text-sm text-gray-600">
              <p>
                ✓ Consulte o rótulo do produto para orientações específicas
              </p>
              <p>
                ✓ Se preferir, consulte um profissional de saúde habilitado
              </p>
              <p>
                ✓ Mantenha consistência no uso conforme recomendado
              </p>
              <p>
                ✓ Este produto não é medicamento e não trata doenças
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Informações Importantes */}
      <section className="py-16 bg-gray-50 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">
              Informações Importantes
            </h2>
          </div>

          <div className="bg-white rounded-xl p-8 border border-gray-200 space-y-4">
            <div className="flex gap-4">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold"
                style={{ backgroundColor: corPrincipal }}
              >
                ⓘ
              </div>
              <p className="text-gray-700">
                <strong>Este produto não é medicamento.</strong> Não possui indicação terapêutica.
                Leia o rótulo antes de consumir.
              </p>
            </div>

            <div className="flex gap-4">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold"
                style={{ backgroundColor: corPrincipal }}
              >
                ⓘ
              </div>
              <p className="text-gray-700">
                <strong>Sem indicação terapêutica.</strong> Suplemento alimentar para complementar
                a rotina alimentar.
              </p>
            </div>

            <div className="flex gap-4">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold"
                style={{ backgroundColor: corPrincipal }}
              >
                ⓘ
              </div>
              <p className="text-gray-700">
                <strong>Consulte um profissional habilitado</strong> em caso de dúvidas sobre
                o uso deste produto.
              </p>
            </div>

            <div className="flex gap-4">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold"
                style={{ backgroundColor: corPrincipal }}
              >
                ⓘ
              </div>
              <p className="text-gray-700">
                <strong>Manter fora do alcance de crianças.</strong> Armazenar em local fresco e
                seco.
              </p>
            </div>

            <div className="flex gap-4">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold"
                style={{ backgroundColor: corPrincipal }}
              >
                ⓘ
              </div>
              <p className="text-gray-700">
                <strong>Verificar embalagem antes do consumo.</strong> Não consumir se a
                embalagem estiver danificada.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Avaliações */}
      <ProductReviews productId={productId} color={corPrincipal} />

      {/* CTA Final */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
            Pronto para adicionar este produto à sua rotina?
          </h2>
          <p className="text-gray-600 mb-8 text-lg">
            Complemente sua alimentação com qualidade e segurança
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              disabled={produto.estoque <= 0}
              className="px-8 py-4 text-lg font-bold text-white rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 active:scale-95"
              style={{
                backgroundColor: corPrincipal,
              }}
            >
              {produto.estoque > 0 ? 'Adicionar ao Carrinho' : 'Indisponível'}
            </button>
            <button
              className="px-8 py-4 text-lg font-bold rounded-xl border-2 transition-all duration-200 hover:bg-gray-50"
              style={{
                borderColor: corPrincipal,
                color: corPrincipal,
              }}
            >
              Continuar Comprando
            </button>
          </div>

          <p className="text-xs text-gray-400 mt-8">
            Suplemento alimentar. Este produto não é medicamento. Sem indicação terapêutica.
            Leia o rótulo.
          </p>
        </div>
      </section>

      <Footer />
      <PurchaseNotification />
    </>
  );
}
