import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, BookOpenText, ExternalLink, FileText, FlaskConical, ShieldAlert } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import InfoStatusNotice from '@/components/informativos/InfoStatusNotice'
import NutritionTable from '@/components/informativos/NutritionTable'
import ProductFaq from '@/components/informativos/ProductFaq'
import ProductVisualStory from '@/components/informativos/ProductVisualStory'
import ComingSoonStoreButton from '@/components/informativos/ComingSoonStoreButton'
import { getInformativeProduct, informativeProducts } from '@/data/informativos'
import { buildProductFaq, buildProductVisualStory } from '@/data/informativos/product-experience'
import { buildProductTechnicalOverview } from '@/data/informativos/technical-explanations'
import { safeJsonLd } from '@/lib/json-ld'
import ProductImage from '@/components/ProductImage'

const BASE = process.env.NEXT_PUBLIC_URL || 'https://metalab-farma.vercel.app'

interface InformativePageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return informativeProducts.map((product) => ({ slug: product.slug }))
}

export async function generateMetadata({ params }: InformativePageProps): Promise<Metadata> {
  const { slug } = await params
  const product = getInformativeProduct(slug)
  if (!product) return { title: 'Informativo não encontrado' }

  const published = product.status === 'published'
  const description = `Folheto técnico de ${product.nome}: composição, função dos componentes, propósito da fórmula, informação nutricional e fonte documental.`

  return {
    title: `Folheto técnico de ${product.nome}`,
    description,
    alternates: { canonical: `${BASE}/informativos/${product.slug}` },
    robots: published
      ? { index: true, follow: true }
      : { index: false, follow: false, noarchive: true },
    ...(published && product.imagemUrl
      ? {
          openGraph: {
            title: `Folheto técnico de ${product.nome}`,
            description,
            type: 'website',
            url: `${BASE}/informativos/${product.slug}`,
            images: [{ url: product.imagemUrl, alt: product.nome }],
          },
        }
      : {}),
  }
}

export default async function InformativeProductPage({ params }: InformativePageProps) {
  const { slug } = await params
  const product = getInformativeProduct(slug)
  if (!product) notFound()

  const profile = product.profile
  const technicalOverview = profile ? buildProductTechnicalOverview(product.slug, profile) : null
  const visualStory = buildProductVisualStory(product, technicalOverview)
  const faqItems = buildProductFaq(product, technicalOverview)
  const published = product.status === 'published'
  const leafletSections = profile
    ? [
        { id: 'identificacao', label: '1. Identificação do produto' },
        { id: 'composicao', label: '2. Composição' },
        { id: 'funcoes', label: '3. Função dos componentes' },
        { id: 'origem', label: '4. Origem e contexto visual' },
        { id: 'modo-de-uso', label: '5. Modo de uso' },
        { id: 'informacao-nutricional', label: '6. Informação nutricional' },
        { id: 'advertencias', label: '7. Advertências e declarações' },
        { id: 'rastreabilidade', label: '8. Conservação e rastreabilidade' },
        { id: 'perguntas', label: '9. Perguntas e respostas' },
      ]
    : []
  const webPageJsonLd = published
    ? {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `Informações de ${product.nome}`,
        url: `${BASE}/informativos/${product.slug}`,
        about: { '@type': 'Product', name: product.nome, brand: { '@type': 'Brand', name: product.marca } },
      }
    : null
  const declarations = profile?.declarations ?? []
  const conservationDeclarations = declarations.filter((item) => /conserv|armazen|ambiente|umidade|luz|calor/i.test(item))
  const technicalDeclarations = declarations.filter((item) => !conservationDeclarations.includes(item))
  const warnings = profile?.warnings ?? []

  return (
    <>
      {webPageJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(webPageJsonLd) }} />
      )}
      <div className="print:hidden">
        <Header />
      </div>
      <main className="min-h-screen bg-surface-page print:bg-white">
        <section className="border-b border-line bg-surface-card print:hidden">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
            <Link href="/informativos" className="inline-flex items-center gap-2 text-sm font-bold text-brand-700 hover:text-brand-800">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Voltar aos informativos
            </Link>

            <div className="mt-8 grid gap-8 lg:grid-cols-[220px_1fr]">
              <div className="relative flex aspect-[3/4] w-full max-w-[220px] items-center justify-center rounded-lg border border-line bg-surface-sunken p-5 shadow-sm">
                {product.imagemUrl ? (
                  <ProductImage
                    src={product.imagemUrl}
                    alt={product.nome}
                    priority
                    sizes="220px"
                    frameClassName="w-full"
                    imageClassName="drop-shadow-[0_12px_18px_rgba(8,18,38,0.18)]"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-ink-muted"><FileText className="h-16 w-16" /></div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-700">Folheto técnico informativo</p>
                <h1 className="mt-3 font-display text-4xl font-black leading-tight text-navy sm:text-5xl">{product.nome}</h1>
                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-secondary">
                  Documento técnico de consulta baseado em ficha técnica/OCR. Não substitui o rótulo físico vigente, orientação profissional ou validação regulatória final.
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <InfoStatusNotice status={product.status} />
                  <div className="rounded-2xl border border-line bg-surface-sunken p-4 sm:p-5">
                    <div className="flex items-start gap-3">
                      <BookOpenText className="mt-0.5 h-5 w-5 shrink-0 text-brand-700" aria-hidden="true" />
                      <div>
                        <p className="text-sm font-bold text-navy">Formato de folheto técnico</p>
                        <p className="mt-1 text-sm leading-relaxed text-ink-secondary">
                          Estruturado para leitura técnica: identificação, composição, porção, advertências e fonte documental.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <ComingSoonStoreButton productName={product.nome} />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12 print:max-w-none print:px-0 print:py-0">
          {profile ? (
            <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
              <aside className="print:hidden lg:sticky lg:top-24 lg:self-start">
                <nav aria-label="Índice do folheto" className="rounded-lg border border-line bg-surface-card p-5 shadow-sm">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-700">Índice</p>
                  <ol className="mt-4 space-y-3 text-sm font-semibold text-ink-secondary">
                    {leafletSections.map((section) => (
                      <li key={section.id}>
                        <a className="hover:text-navy" href={`#${section.id}`}>{section.label}</a>
                      </li>
                    ))}
                  </ol>
                </nav>
              </aside>

              <article className="overflow-hidden rounded-lg border border-line bg-surface-card shadow-sm print:rounded-none print:border-0 print:shadow-none">
                <header className="border-b border-line bg-navy px-6 py-6 text-on-navy sm:px-8">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-300">{product.marca}</p>
                  <h2 className="mt-2 font-display text-3xl font-black leading-tight">Folheto técnico informativo</h2>
                  <p className="mt-3 text-sm leading-relaxed text-on-navy/80">
                    Produto classificado na ficha como {profile.classification.toLowerCase()}. Conteúdo extraído para conferência técnica.
                  </p>
                </header>

                <div className="divide-y divide-line">
                  <section id="identificacao" className="break-inside-avoid scroll-mt-24 px-6 py-7 sm:px-8 print:px-0 print:py-5">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-700">1. Identificação do produto</p>
                    <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
                      <div>
                        <dt className="font-bold text-navy">Nome comercial</dt>
                        <dd className="mt-1 text-ink-secondary">{product.nome}</dd>
                      </div>
                      <div>
                        <dt className="font-bold text-navy">Apresentação</dt>
                        <dd className="mt-1 text-ink-secondary">{profile.presentation}</dd>
                      </div>
                      <div>
                        <dt className="font-bold text-navy">Classificação documental</dt>
                        <dd className="mt-1 text-ink-secondary">{profile.classification}</dd>
                      </div>
                      {profile.ean && (
                        <div>
                          <dt className="font-bold text-navy">EAN</dt>
                          <dd className="mt-1 font-mono text-ink-secondary">{profile.ean}</dd>
                        </div>
                      )}
                    </dl>
                  </section>

                  <section id="composicao" className="break-inside-avoid scroll-mt-24 px-6 py-7 sm:px-8 print:px-0 print:py-5">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-700">2. Composição</p>
                    <p className="mt-4 text-sm leading-relaxed text-ink-secondary">
                      Componentes declarados na ficha técnica localizada para este SKU:
                    </p>
                    <ol className="mt-4 grid gap-2 text-sm leading-relaxed text-ink-secondary sm:grid-cols-2">
                      {profile.ingredients.map((ingredient, index) => (
                        <li key={ingredient} className="flex gap-3">
                          <span className="font-mono text-xs font-bold text-brand-700">{String(index + 1).padStart(2, '0')}</span>
                          <span>{ingredient}</span>
                        </li>
                      ))}
                    </ol>
                  </section>

                  <section id="funcoes" className="scroll-mt-24 px-6 py-7 sm:px-8 print:px-0 print:py-5">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-700">3. Função dos componentes</p>
                    {technicalOverview?.status === 'blocked' ? (
                      <div className="mt-5 rounded-lg border border-warning/30 bg-warning-subtle p-5">
                        <div className="flex items-start gap-3">
                          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-warning" aria-hidden="true" />
                          <div>
                            <h3 className="font-bold text-navy">Explicação funcional bloqueada</h3>
                            <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{technicalOverview.purpose}</p>
                            <p className="mt-2 text-xs leading-relaxed text-ink-muted">{technicalOverview.note}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="mt-5 rounded-lg bg-navy p-5 text-on-navy sm:p-6">
                          <div className="flex items-center gap-2 text-brand-300">
                            <FlaskConical className="h-4 w-4" aria-hidden="true" />
                            <p className="text-xs font-black uppercase tracking-[0.16em]">Propósito em 15 segundos</p>
                          </div>
                          <p className="mt-3 text-base font-semibold leading-relaxed">{technicalOverview?.purpose}</p>
                          {!!technicalOverview?.focuses.length && (
                            <div className="mt-4 flex flex-wrap gap-2">
                              {technicalOverview.focuses.map((focus) => (
                                <span key={focus} className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold text-on-navy/85">
                                  {focus}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {technicalOverview?.components.length ? (
                          <div className="mt-5 grid gap-3 md:grid-cols-2">
                            {technicalOverview.components.map((component) => (
                              <article key={component.id} className="rounded-lg border border-line bg-surface-sunken p-4">
                                <div className="flex flex-wrap items-start justify-between gap-2">
                                  <h3 className="font-bold text-navy">{component.label}</h3>
                                  <span className="rounded-full border border-line bg-surface-card px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-ink-muted">
                                    {component.evidenceLabel}
                                  </span>
                                </div>
                                <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{component.explanation}</p>
                              </article>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-5 text-sm leading-relaxed text-ink-secondary">
                            Nenhum ativo pôde ser resumido com segurança a partir da ficha processada.
                          </p>
                        )}

                        <div className="mt-5 rounded border border-line px-4 py-3 text-xs leading-relaxed text-ink-muted">
                          <strong className="text-navy">Componentes tecnológicos:</strong> aditivos, veículos, aromas, edulcorantes e agentes de estabilidade permanecem na composição completa acima, mas não são apresentados como ativos fisiológicos. {technicalOverview?.note}
                        </div>

                        {!!technicalOverview?.sources.length && (
                          <details className="mt-4 rounded border border-line bg-surface-card px-4 py-3 text-sm">
                            <summary className="cursor-pointer font-bold text-navy">Ver fontes técnicas consultadas ({technicalOverview.sources.length})</summary>
                            <ul className="mt-3 space-y-2 text-xs leading-relaxed text-ink-secondary">
                              {technicalOverview.sources.map((source) => (
                                <li key={source.id}>
                                  <a className="inline-flex items-start gap-1.5 font-semibold text-brand-700 hover:text-brand-800" href={source.url} target="_blank" rel="noreferrer">
                                    {source.label} <ExternalLink className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </details>
                        )}
                      </>
                    )}
                  </section>

                  <section id="origem" className="scroll-mt-24 px-6 py-7 sm:px-8 print:px-0 print:py-5">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-700">4. Origem e contexto visual</p>
                    <p className="mt-4 text-sm leading-relaxed text-ink-secondary">
                      Uma leitura visual da matéria-prima ou da arquitetura da fórmula, construída apenas com elementos compatíveis com a ficha técnica.
                    </p>
                    {visualStory && <ProductVisualStory story={visualStory} />}
                  </section>

                  <section id="modo-de-uso" className="break-inside-avoid scroll-mt-24 px-6 py-7 sm:px-8 print:px-0 print:py-5">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-700">5. Modo de uso</p>
                    <p className="mt-4 text-sm leading-relaxed text-ink-secondary">
                      O modo de uso não foi identificado de forma inequívoca no OCR estruturado. Não foi gerada instrução automática de consumo.
                    </p>
                    {profile.serving && (
                      <p className="mt-3 rounded border border-line bg-surface-sunken px-4 py-3 text-sm leading-relaxed text-ink-secondary">
                        Porção de referência da tabela nutricional: <strong className="text-navy">{profile.serving}</strong>. Confirmar se essa porção coincide com a orientação de uso do rótulo vigente antes de publicar.
                      </p>
                    )}
                  </section>

                  <section id="informacao-nutricional" className="break-inside-avoid scroll-mt-24 px-6 py-7 sm:px-8 print:px-0 print:py-5">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-700">6. Informação nutricional</p>
                    {profile.nutrition && profile.nutrition.length > 0 ? (
                      <div className="mt-5">
                        <NutritionTable productName={product.nome} serving={profile.serving} rows={profile.nutrition} compact />
                      </div>
                    ) : (
                      <p className="mt-4 text-sm leading-relaxed text-ink-secondary">
                        A ficha processada não retornou tabela nutricional estruturada para exibição. Manter conferência manual antes da liberação.
                      </p>
                    )}
                  </section>

                  <section id="advertencias" className="break-inside-avoid scroll-mt-24 px-6 py-7 sm:px-8 print:px-0 print:py-5">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-700">7. Advertências e declarações</p>
                    <div className="mt-4 grid gap-5 text-sm leading-relaxed text-ink-secondary md:grid-cols-2">
                      <div>
                        <h3 className="font-bold text-navy">Declarações da ficha</h3>
                        {technicalDeclarations.length ? (
                          <ul className="mt-2 space-y-1">{technicalDeclarations.map((item) => <li key={item}>• {item}</li>)}</ul>
                        ) : (
                          <p className="mt-2 text-ink-muted">Não identificadas na extração atual.</p>
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-navy">Advertências da ficha</h3>
                        {warnings.length ? (
                          <ul className="mt-2 space-y-1">{warnings.map((item) => <li key={item}>• {item}</li>)}</ul>
                        ) : (
                          <p className="mt-2 text-ink-muted">Não identificadas na extração atual.</p>
                        )}
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-ink-secondary">
                      Este campo deve reproduzir somente informações confirmadas em ficha técnica, rótulo vigente ou validação regulatória.
                    </p>
                  </section>

                  <section id="rastreabilidade" className="break-inside-avoid scroll-mt-24 px-6 py-7 sm:px-8 print:px-0 print:py-5">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-700">8. Conservação e rastreabilidade</p>
                    <dl className="mt-5 space-y-4 text-sm">
                      <div>
                        <dt className="font-bold text-navy">Fonte documental</dt>
                        <dd className="mt-1 break-words text-ink-secondary">{profile.sourceLabel}: <strong>{profile.sourceFile}</strong>.</dd>
                      </div>
                      <div>
                        <dt className="font-bold text-navy">Conservação</dt>
                        <dd className="mt-1 text-ink-secondary">
                          {conservationDeclarations.length
                            ? conservationDeclarations.join(' ')
                            : 'Não identificada na extração atual. Conferir exclusivamente na embalagem física vigente do lote comercial.'}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-bold text-navy">Lote e validade</dt>
                        <dd className="mt-1 text-ink-secondary">Conferir exclusivamente na embalagem física vigente do lote comercial.</dd>
                      </div>
                    </dl>
                  </section>

                  <section id="perguntas" className="scroll-mt-24 px-6 py-7 sm:px-8 print:px-0 print:py-5">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-700">9. Perguntas e respostas</p>
                    <h2 className="mt-2 font-display text-2xl font-black text-ink">Entenda rápido antes de decidir</h2>
                    <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
                      Respostas curtas sobre composição, origem, porção de referência e disponibilidade da loja.
                    </p>
                    <ProductFaq items={faqItems} />
                  </section>

                  {profile.reviewNotes?.length && (
                    <section className="break-inside-avoid bg-warning-subtle px-6 py-7 sm:px-8 print:px-0 print:py-5">
                      <div className="flex items-center gap-2"><ShieldAlert className="h-5 w-5 text-warning" /><h2 className="font-display text-xl font-black text-navy">Pontos para conciliação antes de publicar</h2></div>
                      <ul className="mt-4 space-y-2 text-sm leading-relaxed text-ink-secondary">
                        {profile.reviewNotes.map((note) => <li key={note}>• {note}</li>)}
                      </ul>
                    </section>
                  )}
                </div>
              </article>
            </div>
          ) : (
            <article className="rounded-lg border border-dashed border-line bg-surface-card px-6 py-14 text-center sm:px-10">
              <FileText className="mx-auto h-12 w-12 text-ink-muted" />
              <h2 className="mt-5 font-display text-2xl font-black text-navy">Folheto técnico em validação</h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-ink-secondary">
                A fórmula do banco não será reutilizada porque ainda não há uma correspondência inequívoca com a ficha técnica e a embalagem atuais deste SKU.
              </p>
              <div className="mx-auto mt-8 max-w-3xl text-left">
                <ProductVisualStory story={visualStory} />
              </div>
              <div className="mx-auto mt-8 max-w-2xl text-left">
                <ProductFaq items={faqItems} />
              </div>
            </article>
          )}

          <div className="mt-10 flex flex-col items-center justify-between gap-5 rounded-lg border border-line bg-surface-card p-6 sm:flex-row sm:p-8">
            <div><p className="font-display text-xl font-black text-navy">Quer conhecer a oferta comercial?</p><p className="mt-1 text-sm text-ink-secondary">A experiência de compra está sendo preparada e será liberada em breve.</p></div>
            <ComingSoonStoreButton productName={product.nome} size="large" />
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
