import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Badge } from '@/components/ui'

export const metadata: Metadata = {
  title: 'Certificações',
  description: 'Conheça as certificações e conformidades regulatórias dos produtos Metalab Store — ANVISA, BPF e legislação brasileira de suplementos.',
  robots: { index: true, follow: true },
}

const certifications = [
  {
    badge: 'ANVISA',
    title: 'Conformidade ANVISA',
    subtitle: 'Agência Nacional de Vigilância Sanitária',
    desc: 'Todos os nossos suplementos alimentares são desenvolvidos em conformidade com as normas da ANVISA, incluindo as RDC nº 243/2018 e RDC nº 786/2023, que regulamentam os suplementos alimentares no Brasil.',
    items: [
      'Rotulagem com informação nutricional obrigatória',
      'Alegações funcionais dentro dos limites permitidos',
      'Sem substâncias proibidas pela ANVISA',
      'Advertências obrigatórias declaradas no rótulo',
    ],
  },
  {
    badge: 'BPF',
    title: 'Boas Práticas de Fabricação',
    subtitle: 'RDC nº 275/2002 — Anvisa',
    desc: 'A fabricação dos produtos Metalab segue as Boas Práticas de Fabricação (BPF), conjunto de normas que garantem condições higiênico-sanitárias adequadas em todo o processo produtivo.',
    items: [
      'Instalações com controle de temperatura e umidade',
      'Equipamentos higienizados e validados',
      'Controle de pragas e contaminação cruzada',
      'Registros de produção e rastreabilidade por lote',
    ],
  },
  {
    badge: 'CDC',
    title: 'Código de Defesa do Consumidor',
    subtitle: 'Lei nº 8.078/1990',
    desc: 'Operamos em total conformidade com o Código de Defesa do Consumidor, garantindo seus direitos de arrependimento, troca, devolução e informação adequada sobre cada produto.',
    items: [
      'Direito de arrependimento em 7 dias corridos',
      'Informações claras sobre ingredientes e uso',
      'Política de devolução e reembolso explícita',
      'Canais de atendimento ao consumidor ativos',
    ],
  },
  {
    badge: 'LGPD',
    title: 'Lei Geral de Proteção de Dados',
    subtitle: 'Lei nº 13.709/2018',
    desc: 'Tratamos seus dados pessoais com responsabilidade e transparência, em conformidade com a LGPD. Você tem controle total sobre seus dados e pode exercer seus direitos a qualquer momento.',
    items: [
      'Coleta de dados com base legal definida',
      'Consentimento explícito para cookies de analytics',
      'Direitos do titular garantidos (acesso, correção, exclusão)',
      'Dados não são vendidos a terceiros',
    ],
  },
]

const faqs = [
  {
    q: 'Os suplementos Metalab precisam de prescrição médica?',
    a: 'Não. Suplementos alimentares são produtos destinados ao consumo sem prescrição. No entanto, recomendamos consultar um nutricionista ou médico antes de iniciar qualquer suplementação.',
  },
  {
    q: 'Os produtos são registrados na ANVISA?',
    a: 'Suplementos alimentares enquadrados na RDC 243/2018 são isentos de registro, mas devem seguir as normas de composição, rotulagem e boas práticas de fabricação. Nossos produtos estão em conformidade com essa regulamentação.',
  },
  {
    q: 'Como verificar a autenticidade do produto recebido?',
    a: 'Verifique o lacre de segurança da embalagem — ele deve estar intacto. O número do lote e a validade estão impressos na embalagem. Em caso de dúvida, entre em contato conosco com o número do lote.',
  },
  {
    q: 'Os produtos são adequados para atletas de competição?',
    a: 'Nossos produtos não contêm substâncias listadas como dopagem pelo Código Mundial Antidoping (WADA). No entanto, atletas de alto rendimento devem consultar seu médico ou nutricionista esportivo antes de usar qualquer suplemento.',
  },
  {
    q: 'Como reportar um problema com um produto?',
    a: 'Entre em contato pelo e-mail mlmetalab@gmail.com informando o número do lote, data de validade e descrição do problema. Investigamos todos os relatos e adotamos as medidas corretivas necessárias.',
  },
]

export default function Certificacoes() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-surface-page">

        {/* Hero */}
        <section className="bg-navy text-on-navy py-16 sm:py-24">
          <div className="max-w-[1200px] mx-auto px-6 sm:px-8">
            <div className="max-w-3xl">
              <p className="text-xs font-bold text-gold-300 uppercase tracking-wide mb-4">
                Certificações e Conformidade
              </p>
              <h1 className="font-display text-4xl sm:text-5xl leading-tight mb-6">
                Regulamentação e transparência em tudo que fazemos
              </h1>
              <p className="text-lg text-navy-100 leading-relaxed">
                A Metalab opera dentro dos mais rigorosos padrões regulatórios brasileiros.
                Conheça as normas que guiam nossa operação e como elas protegem você como consumidor.
              </p>
            </div>
          </div>
        </section>

        {/* Badges rápidos */}
        <section className="bg-surface-card border-b border-line py-10">
          <div className="max-w-[1200px] mx-auto px-6 sm:px-8">
            <div className="flex flex-wrap justify-center gap-4">
              {certifications.map(({ badge, subtitle }) => (
                <div
                  key={badge}
                  className="flex items-center gap-3 px-5 py-3 rounded-full border border-line bg-surface-sunken"
                >
                  <Badge variant="gold">{badge}</Badge>
                  <span className="text-sm text-ink-secondary font-medium">{subtitle}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Certificações detalhadas */}
        <section className="py-16 sm:py-24 bg-surface-card">
          <div className="max-w-[1200px] mx-auto px-6 sm:px-8">
            <div className="text-center mb-16">
              <p className="text-xs font-bold text-navy uppercase tracking-wide mb-3">Detalhamento</p>
              <h2 className="font-display text-3xl sm:text-4xl text-navy">
                Nossas conformidades regulatórias
              </h2>
              <p className="mt-4 text-ink-muted max-w-xl mx-auto">
                Cada certificação representa um conjunto de obrigações que cumprimos para garantir
                a segurança e a qualidade dos nossos produtos.
              </p>
            </div>

            <div className="space-y-6">
              {certifications.map(({ badge, title, subtitle, desc, items }) => (
                <div
                  key={badge}
                  className="grid grid-cols-1 lg:grid-cols-3 gap-0 rounded-2xl border border-line bg-surface-card overflow-hidden hover:shadow-md transition-shadow duration-300"
                >
                  {/* Badge lateral */}
                  <div className="flex flex-col items-center justify-center p-8 text-on-navy bg-navy gap-2">
                    <span className="font-display text-4xl">{badge}</span>
                    <span className="text-sm text-navy-100 text-center">{subtitle}</span>
                  </div>

                  {/* Descrição */}
                  <div className="p-8 lg:col-span-2 bg-surface-card">
                    <h3 className="font-display text-xl text-navy mb-3">{title}</h3>
                    <p className="text-sm text-ink-secondary leading-relaxed mb-5">{desc}</p>
                    <ul className="space-y-2">
                      {items.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm text-ink-secondary">
                          <svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 sm:py-24 bg-brand-50">
          <div className="max-w-3xl mx-auto px-6 sm:px-8">
            <div className="text-center mb-14">
              <p className="text-xs font-bold text-navy uppercase tracking-wide mb-3">Perguntas Frequentes</p>
              <h2 className="font-display text-3xl sm:text-4xl text-navy">
                Dúvidas sobre regulamentação
              </h2>
            </div>
            <div className="space-y-4">
              {faqs.map(({ q, a }) => (
                <div key={q} className="p-6 rounded-2xl bg-surface-card border border-line">
                  <p className="font-bold text-navy mb-2">{q}</p>
                  <p className="text-sm text-ink-secondary leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="py-14 bg-navy text-on-navy">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <p className="text-sm text-navy-100 leading-relaxed mb-6">
              Os suplementos alimentares Metalab <strong className="text-on-navy">não são medicamentos</strong> e
              não têm indicação para diagnóstico, tratamento, cura ou prevenção de doenças.
              Não substituem uma alimentação equilibrada nem o acompanhamento de um profissional de saúde.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/qualidade"
                className="inline-flex items-center gap-2 px-6 py-3 border border-navy-300 text-navy-100 font-semibold rounded-full hover:border-brand hover:text-brand-300 transition-colors text-sm"
              >
                Ver nossa qualidade
              </Link>
              <Link
                href="/#produtos"
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand text-on-brand font-bold rounded-full hover:bg-brand-hover transition-colors text-sm"
              >
                Ver produtos
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
