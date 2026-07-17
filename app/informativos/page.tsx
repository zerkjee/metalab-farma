import type { Metadata } from 'next'
import { FileCheck2, SearchCheck, ShieldCheck } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import InformativosFilter from '@/components/informativos/InformativosFilter'
import { informativeProducts } from '@/data/informativos'

export const metadata: Metadata = {
  title: 'Folhetos Técnicos de Produtos | Metalab',
  description: 'Central de folhetos técnicos com composição, função dos componentes, propósito da fórmula, informação nutricional e fonte documental dos produtos Metalab.',
  robots: { index: false, follow: false, noarchive: true },
}

export default function InformativosPage() {
  const withSource = informativeProducts.filter((product) => product.status !== 'pending').length

  return (
    <>
      <Header />
      <main className="min-h-screen bg-surface-page">
        <section className="overflow-hidden border-b border-line bg-navy text-on-navy">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-brand-300">Central de folhetos técnicos</p>
              <h1 className="mt-4 font-display text-4xl font-black leading-tight sm:text-5xl">
                Folhetos por produto, com fonte e status de revisão
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-on-navy/80 sm:text-lg">
                Leia em poucos minutos: propósito da fórmula, origem dos componentes, como eles se complementam, perguntas rápidas, tabela nutricional e opções de compra.
              </p>
            </div>

            <div className="mt-10 grid max-w-4xl gap-4 sm:grid-cols-3">
              {[
                { icon: SearchCheck, value: informativeProducts.length, label: 'folhetos criados para produtos ativos' },
                { icon: FileCheck2, value: withSource, label: 'folhetos com ficha/OCR localizado' },
                { icon: ShieldCheck, value: informativeProducts.length - withSource, label: 'itens bloqueados até conciliação' },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                  <Icon className="h-5 w-5 text-brand-300" aria-hidden="true" />
                  <p className="mt-3 font-display text-3xl font-black">{value}</p>
                  <p className="mt-1 text-sm text-on-navy/75">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <InformativosFilter products={informativeProducts} />
        </section>
      </main>
      <Footer />
    </>
  )
}
