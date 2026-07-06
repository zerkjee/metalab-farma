import type { Metadata } from "next";
import Header from "@/components/Header";
import PromoBanner from "@/components/PromoBanner";
import EstiloDeVidaBanner from "@/components/EstiloDeVidaBanner";
import TrustSection from "@/components/TrustSection";
import QualitySection from "@/components/QualitySection";
import WhyMetalab from "@/components/WhyMetalab";
import ProductSection from "@/components/ProductSection";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";
import StatsSection from "@/components/social-proof/StatsSection";
import TestimonialsSection from "@/components/social-proof/TestimonialsSection";
import PurchaseNotification from "@/components/social-proof/PurchaseNotification";
import VipBanner from "@/components/loyalty/VipBanner";
import { Product } from "@/types/product";
import { products as localProducts } from "@/data/products";
import { prisma } from "@/lib/prisma";
import { publicStock } from "@/lib/publicProduct";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Metalab Store | Suplementos Alimentares com Qualidade e Procedência",
  description:
    "Suplementos alimentares com tecnologia, cuidado e confiança em cada fórmula. Produtos para complementar sua rotina alimentar. Sem indicação terapêutica.",
  openGraph: {
    title: "Metalab Store | Suplementos Alimentares",
    description: "Suplementos alimentares com qualidade e procedência garantida.",
    type: "website",
  },
};

async function getProducts(): Promise<Product[]> {
  try {
    const rows = await prisma.produto.findMany({
      where: { ativo: true },
      orderBy: [{ destaque: "desc" }, { criadoEm: "desc" }],
      take: 200,
    })
    if (rows.length > 0) {
      return rows.map((p) => ({
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
        criadoEm: p.criadoEm.toISOString(),
      }))
    }
  } catch {
    // fallback to local data
  }
  return localProducts
}

export default async function Home() {
  const produtos = await getProducts();
  const inovitannProdutos = produtos.filter((p) => p.slug.startsWith("inovitann-"));
  const outrosProdutos = produtos.filter((p) => !p.slug.startsWith("inovitann-"));

  return (
    <>
      <Header />
      <PromoBanner />

      {/* ── LINHA INOVITANN ── */}
      {inovitannProdutos.length > 0 && (
        <section id="inovitann" className="py-20 bg-brand-subtle border-t border-line">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-start gap-5 mb-12">
              <div className="w-1.5 h-16 rounded-full flex-shrink-0 bg-brand" />
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-brand mb-1">
                  Linha Exclusiva
                </p>
                <h2 className="font-display text-3xl sm:text-4xl font-semibold text-navy">Linha Inovitann</h2>
                <p className="text-ink-secondary mt-2 max-w-xl">
                  Formulações de alta concentração com ingredientes premium — máxima eficácia e biodisponibilidade.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {inovitannProdutos.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CATÁLOGO GERAL ── */}
      {outrosProdutos.length > 0 ? (
        <ProductSection
          title="Nossos Produtos"
          subtitle={`${outrosProdutos.length} suplementos com qualidade e procedência garantida`}
          products={outrosProdutos}
          color="var(--navy-500)"
        />
      ) : (
        <section className="py-20 border-t border-line">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-ink-muted text-lg">Nenhum produto disponível no momento</p>
          </div>
        </section>
      )}

      <EstiloDeVidaBanner />
      <TrustSection />
      <QualitySection />
      <WhyMetalab />
      <StatsSection />
      <TestimonialsSection />
      <VipBanner />

      <Footer />
      <PurchaseNotification />
    </>
  );
}
