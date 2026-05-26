import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Certificações',
  description: 'Conheça as certificações e conformidades regulatórias dos produtos Metalab Store — ANVISA, BPF e legislação brasileira de suplementos.',
  robots: { index: true, follow: true },
}

const certifications = [
  {
    badge: 'ANVISA',
    color: '#0f2756',
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
    color: '#1d4ed8',
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
    color: '#059669',
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
    color: '#d97706',
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
      <main className="min-h-screen bg-[#fafafa]">

        {/* Hero */}
        <section className="bg-gray-950 text-white py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold text-[#60a5fa] uppercase tracking-widest mb-4">
                Certificações e Conformidade
              </p>
              <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-6">
                Regulamentação e transparência em tudo que fazemos
              </h1>
              <p className="text-lg text-gray-400 leading-relaxed">
                A Metalab opera dentro dos mais rigorosos padrões regulatórios brasileiros.
                Conheça as normas que guiam nossa operação e como elas protegem você como consumidor.
              </p>
            </div>
          </div>
        </section>

        {/* Badges rápidos */}
        <section className="bg-white border-b border-gray-100 py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-center gap-4">
              {certifications.map(({ badge, color, subtitle }) => (
                <div
                  key={badge}
                  className="flex items-center gap-3 px-5 py-3 rounded-full border border-gray-200 bg-gray-50"
                >
                  <span
                    className="text-sm font-black px-2 py-0.5 rounded text-white"
                    style={{ backgroundColor: color }}
                  >
                    {badge}
                  </span>
                  <span className="text-sm text-gray-600 font-medium">{subtitle}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Certificações detalhadas */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-[#0f2756] uppercase tracking-widest mb-3">Detalhamento</p>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900">
                Nossas conformidades regulatórias
              </h2>
              <p className="mt-4 text-gray-500 max-w-xl mx-auto">
                Cada certificação representa um conjunto de obrigações que cumprimos para garantir
                a segurança e a qualidade dos nossos produtos.
              </p>
            </div>

            <div className="space-y-6">
              {certifications.map(({ badge, color, title, subtitle, desc, items }) => (
                <div
                  key={badge}
                  className="grid grid-cols-1 lg:grid-cols-3 gap-0 rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  {/* Badge lateral */}
                  <div
                    className="flex flex-col items-center justify-center p-8 text-white"
                    style={{ backgroundColor: color }}
                  >
                    <span className="text-5xl font-black mb-2">{badge}</span>
                    <span className="text-sm text-white/75 text-center">{subtitle}</span>
                  </div>

                  {/* Descrição */}
                  <div className="p-8 lg:col-span-2 bg-white">
                    <h3 className="text-xl font-black text-gray-900 mb-3">{title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed mb-5">{desc}</p>
                    <ul className="space-y-2">
                      {items.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                          <svg className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <section className="py-24 bg-[#eff6ff]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <p className="text-sm font-semibold text-[#0f2756] uppercase tracking-widest mb-3">Perguntas Frequentes</p>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900">
                Dúvidas sobre regulamentação
              </h2>
            </div>
            <div className="space-y-4">
              {faqs.map(({ q, a }) => (
                <div key={q} className="p-6 rounded-2xl bg-white border border-[#dbeafe]">
                  <p className="font-bold text-gray-900 mb-2">{q}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="py-14 bg-gray-950 text-white">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              ⚠️ Os suplementos alimentares Metalab <strong className="text-white">não são medicamentos</strong> e
              não têm indicação para diagnóstico, tratamento, cura ou prevenção de doenças.
              Não substituem uma alimentação equilibrada nem o acompanhamento de um profissional de saúde.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/qualidade"
                className="inline-flex items-center gap-2 px-6 py-3 border border-gray-700 text-gray-300 font-semibold rounded-xl hover:border-[#60a5fa] hover:text-[#60a5fa] transition-colors text-sm"
              >
                Ver nossa qualidade
              </Link>
              <Link
                href="/#produtos"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#60a5fa] text-gray-950 font-bold rounded-xl hover:bg-blue-300 transition-colors text-sm"
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
