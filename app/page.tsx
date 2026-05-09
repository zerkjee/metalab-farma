import Header from "@/components/Header";
import BannerCarousel from "@/components/BannerCarousel";
import TrustSection from "@/components/TrustSection";
import QualitySection from "@/components/QualitySection";
import WhyMetalab from "@/components/WhyMetalab";
import ProductSection from "@/components/ProductSection";
import Footer from "@/components/Footer";
import StatsSection from "@/components/social-proof/StatsSection";
import TestimonialsSection from "@/components/social-proof/TestimonialsSection";
import PurchaseNotification from "@/components/social-proof/PurchaseNotification";
import VipBanner from "@/components/loyalty/VipBanner";
import { Product } from "@/types/product";
import { products as localProducts } from "@/data/products";
import { categorizeProducts } from "@/utils/categorizeProducts";

async function getProducts(): Promise<Product[]> {
  return localProducts;
}

export default async function Home() {
  const produtos = await getProducts();
  const categorized = categorizeProducts(produtos);

  return (
    <>
      <Header />
      <BannerCarousel />
      <TrustSection />
      <QualitySection />
      <WhyMetalab />
      <StatsSection />
      <TestimonialsSection />
      <VipBanner />

      {/* Seção de Produtos por Categoria */}
      <section id="produtos" className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <p className="text-sm font-semibold text-[#6b21a8] uppercase tracking-widest mb-2">Catálogo Completo</p>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900">
                Nossos Produtos
              </h2>
              <p className="mt-2 text-gray-500">
                {produtos.length} suplementos alimentares com qualidade e procedência garantida
              </p>
            </div>
            <p className="text-xs text-gray-400 max-w-xs text-right hidden sm:block">
              Suplementos alimentares. Este produto não é medicamento.
              Sem indicação terapêutica. Leia o rótulo.
            </p>
          </div>
        </div>

        {produtos.length > 0 ? (
          <ProductSection
            title="Todos os Produtos"
            subtitle="Nosso catálogo completo de suplementos de qualidade"
            products={produtos}
            color="#6b21a8"
          />
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center">
              <p className="text-gray-400 text-lg">Nenhum produto disponível no momento</p>
            </div>
          </div>
        )}
      </section>

      <Footer />
      <PurchaseNotification />
    </>
  );
}
