const cards = [
  {
    title: 'Controle de Qualidade',
    desc: 'Processos de fabricação com inspeção rigorosa em cada etapa, garantindo integridade e rastreabilidade completa.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
  },
  {
    title: 'Formulações Precisas',
    desc: 'Insumos selecionados com rigor técnico, procedência controlada e análise laboratorial de cada lote produzido.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    title: 'Embalagem Lacrada',
    desc: 'Produtos lacrados de fábrica com tecnologia de proteção e rótulo completo. Entregue como saiu da linha de produção.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    title: 'Conformidade Regulatória',
    desc: 'Produtos em conformidade com a legislação vigente, seguindo as Boas Práticas de Fabricação exigidas pela ANVISA.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
];

export default function TrustSection() {
  return (
    <section className="bg-gray-50 py-20 border-y border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-14">
          <p className="text-xs font-bold text-[#0f2756] uppercase tracking-[0.2em] mb-4">Nossos Valores</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            Análises Confiáveis e Precisas
          </h2>
          <p className="mt-4 text-gray-500 max-w-xl mx-auto text-sm leading-relaxed">
            Cada produto Metalab é desenvolvido com rigor técnico, insumos controlados e processos
            que garantem qualidade em cada etapa — da formulação à entrega.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {cards.map(({ title, desc, icon }) => (
            <div
              key={title}
              className="group flex flex-col gap-4 p-6 bg-white rounded-xl border border-gray-200 hover:border-[#0f2756]/30 hover:shadow-md transition-all duration-300"
            >
              <div className="w-11 h-11 rounded-lg flex items-center justify-center text-[#0f2756] bg-gray-50 border border-gray-100 group-hover:bg-[#0f2756]/5 transition-colors">
                {icon}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm mb-1.5 tracking-tight">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
