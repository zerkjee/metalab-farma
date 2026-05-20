import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Sobre a Metalab',
  description: 'Conheça a Metalab Store — nossa missão, história e compromisso com suplementos alimentares de qualidade e procedência.',
  robots: { index: true, follow: true },
}

const values = [
  {
    title: 'Compromisso com a Vida',
    desc: 'Cada produto é desenvolvido pensando na saúde e bem-estar de quem consome. Qualidade não é diferencial — é obrigação.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  {
    title: 'Transparência Total',
    desc: 'Ingredientes declarados, procedência comprovada e rastreabilidade completa de cada lote fabricado.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
  },
  {
    title: 'Inovação Constante',
    desc: 'Formulações desenvolvidas com rigor técnico e atualização contínua frente às pesquisas científicas em nutrição esportiva.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    title: 'Responsabilidade',
    desc: 'Respeitamos a legislação vigente, as boas práticas de fabricação e o Código de Defesa do Consumidor em cada etapa.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
      </svg>
    ),
  },
]

const stats = [
  { value: '81+', label: 'Produtos no catálogo' },
  { value: '100%', label: 'Embalagens lacradas' },
  { value: 'BPF', label: 'Boas Práticas de Fabricação' },
  { value: 'ANVISA', label: 'Em conformidade regulatória' },
]

const milestones = [
  {
    year: 'Origem',
    title: 'Nasce a Metalab',
    desc: 'A Metalab surge com uma missão clara: levar suplementos alimentares de qualidade comprovada ao consumidor brasileiro, com transparência e procedência.',
  },
  {
    year: 'Portfólio',
    title: 'Expansão do Catálogo',
    desc: 'Desenvolvimento das primeiras linhas exclusivas: proteínas, aminoácidos e vitaminas formulados com insumos de origem controlada.',
  },
  {
    year: 'Qualidade',
    title: 'Certificação BPF',
    desc: 'Adoção das Boas Práticas de Fabricação em toda a cadeia produtiva, assegurando controle rigoroso de qualidade em cada lote.',
  },
  {
    year: 'Hoje',
    title: 'Metalab Store Online',
    desc: 'Plataforma digital própria com checkout seguro, frete calculado em tempo real e experiência de compra pensada para o consumidor.',
  },
]

export default function Sobre() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#fafafa]">

        {/* Hero */}
        <section className="bg-gray-950 text-white py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold text-[#c084fc] uppercase tracking-widest mb-4">
                Sobre a Metalab
              </p>
              <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-6">
                Compromisso com a vida em cada fórmula
              </h1>
              <p className="text-lg text-gray-400 leading-relaxed mb-8">
                A Metalab é uma empresa especializada em suplementos alimentares desenvolvidos com rigor técnico,
                insumos de procedência comprovada e respeito à legislação brasileira. Nosso propósito é simples:
                entregar qualidade real, sem promessas que a ciência não sustenta.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/#produtos"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#c084fc] text-gray-950 font-bold rounded-xl hover:bg-purple-300 transition-colors"
                >
                  Ver produtos
                </Link>
                <Link
                  href="/qualidade"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-gray-700 text-white font-semibold rounded-xl hover:border-[#c084fc] hover:text-[#c084fc] transition-colors"
                >
                  Nossa qualidade
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-white border-b border-gray-100 py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map(({ value, label }) => (
                <div key={label} className="flex flex-col items-center text-center p-6 rounded-2xl bg-[#f5f3ff] border border-[#ede9fe]">
                  <span className="text-3xl font-black text-[#6b21a8] mb-1">{value}</span>
                  <span className="text-sm text-gray-500 font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Missão */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <p className="text-sm font-semibold text-[#6b21a8] uppercase tracking-widest mb-4">Nossa Missão</p>
                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight mb-6">
                  Suplementação honesta, sem promessas vazias
                </h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                  O mercado de suplementos alimentares é repleto de alegações exageradas e produtos sem
                  comprovação. A Metalab nasceu para ser diferente: cada produto que comercializamos tem
                  procedência declarada, fórmula transparente e embalagem lacrada com rastreabilidade.
                </p>
                <p className="text-gray-600 leading-relaxed mb-8">
                  Não vendemos medicamentos, não fazemos promessas terapêuticas e não comprometemos sua
                  saúde por resultados rápidos. Acreditamos que suplementar bem começa pela escolha certa.
                </p>
                <div className="p-5 rounded-2xl bg-[#f5f3ff] border border-[#ede9fe]">
                  <p className="text-sm text-[#6b21a8] font-semibold mb-1">⚠️ Aviso importante</p>
                  <p className="text-sm text-gray-600">
                    Nossos produtos são suplementos alimentares. Não são medicamentos e não têm indicação
                    terapêutica. Consulte sempre um profissional de saúde antes de suplementar.
                  </p>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-6">
                {milestones.map(({ year, title, desc }, i) => (
                  <div key={i} className="flex gap-5">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-[#6b21a8] text-white flex items-center justify-center text-xs font-bold shrink-0">
                        {i + 1}
                      </div>
                      {i < milestones.length - 1 && (
                        <div className="w-px flex-1 bg-[#ede9fe] mt-2" />
                      )}
                    </div>
                    <div className="pb-6">
                      <span className="text-xs font-bold text-[#6b21a8] uppercase tracking-wider">{year}</span>
                      <h3 className="text-base font-bold text-gray-900 mt-1 mb-2">{title}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Valores */}
        <section className="py-24 bg-[#f5f3ff]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <p className="text-sm font-semibold text-[#6b21a8] uppercase tracking-widest mb-3">Nossos Valores</p>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900">
                O que nos guia todos os dias
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map(({ title, desc, icon }) => (
                <div
                  key={title}
                  className="group flex flex-col items-start gap-4 p-6 rounded-2xl bg-white hover:bg-[#ede9fe] border border-[#ede9fe] hover:border-[#c4b5fd] hover:shadow-lg transition-all duration-300"
                >
                  <div className="p-3 rounded-xl bg-[#f5f3ff] text-[#6b21a8] group-hover:bg-white shadow-sm transition-colors">
                    {icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base mb-1">{title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gray-950 text-white">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-black mb-4">Pronto para começar?</h2>
            <p className="text-gray-400 mb-8">
              Explore nosso catálogo de suplementos alimentares com qualidade e procedência garantidas.
            </p>
            <Link
              href="/#produtos"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#c084fc] text-gray-950 font-bold rounded-xl hover:bg-purple-300 transition-colors text-base"
            >
              Ver todos os produtos
            </Link>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
