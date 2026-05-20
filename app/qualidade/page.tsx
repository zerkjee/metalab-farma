import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Qualidade',
  description: 'Saiba como a Metalab garante a qualidade dos suplementos alimentares: processos, insumos, rastreabilidade e conformidade regulatória.',
  robots: { index: true, follow: true },
}

const steps = [
  {
    number: '01',
    title: 'Seleção de Insumos',
    desc: 'Matérias-primas selecionadas com critérios rigorosos de origem e procedência. Cada insumo passa por análise de especificação antes de entrar na linha de produção.',
  },
  {
    number: '02',
    title: 'Desenvolvimento de Fórmula',
    desc: 'Formulações desenvolvidas com base em evidências técnicas e nutricionais. Cada concentração é definida para complementar a alimentação sem ultrapassar limites seguros.',
  },
  {
    number: '03',
    title: 'Produção Controlada',
    desc: 'Fabricação em ambiente controlado, seguindo as Boas Práticas de Fabricação (BPF). Monitoramento de temperatura, umidade e contaminação cruzada em cada etapa.',
  },
  {
    number: '04',
    title: 'Análise de Lote',
    desc: 'Cada lote produzido passa por análise físico-química antes do envase. Verificação de identidade, pureza e concentração dos ingredientes declarados.',
  },
  {
    number: '05',
    title: 'Envase e Lacre',
    desc: 'Embalagens com lacre de segurança e rastreabilidade por lote. O lacre intacto é garantia de que o produto não foi violado desde a fabricação.',
  },
  {
    number: '06',
    title: 'Armazenamento e Entrega',
    desc: 'Estoque em ambiente com temperatura e umidade controladas. Logística integrada com Melhor Envio para garantir a integridade do produto na entrega.',
  },
]

const pillars = [
  {
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
    title: 'Conformidade Regulatória',
    desc: 'Todos os produtos seguem as normas da ANVISA para suplementos alimentares (RDC nº 243/2018 e RDC nº 786/2023), com rotulagem adequada e sem alegações proibidas.',
  },
  {
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Rastreabilidade',
    desc: 'Cada lote possui número de rastreamento que permite identificar origem dos insumos, data de fabricação, validade e responsável pelo controle de qualidade.',
  },
  {
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    title: 'Embalagem Segura',
    desc: 'Embalagens projetadas para preservar a integridade dos ingredientes. Lacre de segurança visível e resistente para garantia de que o produto chegou intacto.',
  },
]

const bullets = [
  'Insumos com laudo de análise do fornecedor',
  'Fórmulas sem substâncias proibidas pelo esporte (doping)',
  'Rotulagem em conformidade com a legislação de suplementos',
  'Prazo de validade calculado com margem de segurança',
  'Produto não é medicamento — sem indicação terapêutica',
  'Sem alegações de cura, tratamento ou prevenção de doenças',
]

export default function Qualidade() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#fafafa]">

        {/* Hero */}
        <section className="bg-gray-950 text-white py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold text-[#c084fc] uppercase tracking-widest mb-4">
                Qualidade Metalab
              </p>
              <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-6">
                Do insumo à sua porta: controle em cada etapa
              </h1>
              <p className="text-lg text-gray-400 leading-relaxed">
                Qualidade não começa na embalagem. Começa na escolha da matéria-prima,
                passa pelo controle de fabricação e termina na entrega íntegra do produto.
                Veja como garantimos isso em cada passo do processo.
              </p>
            </div>
          </div>
        </section>

        {/* Processo */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-[#6b21a8] uppercase tracking-widest mb-3">Nosso Processo</p>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900">
                6 etapas de controle de qualidade
              </h2>
              <p className="mt-4 text-gray-500 max-w-xl mx-auto">
                Cada produto percorre um processo rigoroso antes de chegar até você.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {steps.map(({ number, title, desc }) => (
                <div
                  key={number}
                  className="group p-7 rounded-2xl border border-gray-100 hover:border-[#c4b5fd] hover:shadow-xl transition-all duration-300"
                >
                  <div className="text-5xl font-black text-[#ede9fe] group-hover:text-[#c4b5fd] transition-colors mb-4 leading-none">
                    {number}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pilares */}
        <section className="py-24 bg-[#f5f3ff]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-[#6b21a8] uppercase tracking-widest mb-3">Nossos Pilares</p>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900">
                O que sustenta nossa qualidade
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {pillars.map(({ icon, title, desc }) => (
                <div
                  key={title}
                  className="group flex flex-col items-center text-center p-8 rounded-2xl bg-white border border-[#ede9fe] hover:border-[#c4b5fd] hover:shadow-xl transition-all duration-300"
                >
                  <div className="p-4 rounded-2xl mb-6 text-[#6b21a8] bg-[#f5f3ff] group-hover:bg-[#ede9fe] transition-colors">
                    {icon}
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-3">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Checklist + disclaimer */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <p className="text-sm font-semibold text-[#6b21a8] uppercase tracking-widest mb-4">Padrão Metalab</p>
                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight mb-6">
                  O que você pode esperar de cada produto
                </h2>
                <ul className="space-y-3">
                  {bullets.map((b) => (
                    <li key={b} className="flex items-start gap-3 text-sm text-gray-700">
                      <svg className="w-5 h-5 text-[#6b21a8] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <div className="p-7 rounded-2xl bg-[#6b21a8] text-white">
                  <p className="text-lg font-bold mb-2">Aviso Legal</p>
                  <p className="text-sm text-white/80 leading-relaxed">
                    Os suplementos alimentares Metalab <strong className="text-white">não são medicamentos</strong> e
                    não têm indicação para diagnóstico, tratamento, cura ou prevenção de doenças.
                    Não substituem uma alimentação equilibrada. Leia o rótulo com atenção e consulte
                    um profissional de saúde antes de consumir.
                  </p>
                </div>
                <div className="p-7 rounded-2xl bg-[#f5f3ff] border border-[#ede9fe]">
                  <p className="text-base font-bold text-gray-900 mb-2">Legislação aplicável</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• RDC nº 243/2018 — Suplementos Alimentares</li>
                    <li>• RDC nº 786/2023 — Atualização regulatória</li>
                    <li>• Portaria SVS/MS nº 32/1998 — Suplementos vitamínicos</li>
                    <li>• RDC nº 275/2002 — Boas Práticas de Fabricação</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gray-950 text-white">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-black mb-4">Qualidade que você pode verificar</h2>
            <p className="text-gray-400 mb-8">
              Dúvidas sobre algum produto? Entre em contato — respondemos sobre ingredientes,
              lotes e procedência de qualquer item do nosso catálogo.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/#produtos"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#c084fc] text-gray-950 font-bold rounded-xl hover:bg-purple-300 transition-colors"
              >
                Ver produtos
              </Link>
              <Link
                href="/certificacoes"
                className="inline-flex items-center gap-2 px-8 py-4 border border-gray-700 text-white font-semibold rounded-xl hover:border-[#c084fc] hover:text-[#c084fc] transition-colors"
              >
                Ver certificações
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
