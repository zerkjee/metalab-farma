const reasons = [
  {
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Confiança',
    desc: 'Marcas desenvolvidas com compromisso e responsabilidade. Cada produto entregue com procedência e rastreabilidade completa.',
  },
  {
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Procedência',
    desc: 'Insumos selecionados com critérios rigorosos de qualidade e origem controlada, desde a matéria-prima até a embalagem final.',
  },
  {
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Inovação',
    desc: 'Formulações únicas, embalagens modernas e processos industriais atualizados para oferecer o que há de melhor em suplementação alimentar.',
  },
];

export default function WhyMetalab() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-[#6b21a8] uppercase tracking-widest mb-3">Nosso Diferencial</p>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900">
            Por que Escolher a Metalab?
          </h2>
          <p className="mt-4 text-gray-500 max-w-xl mx-auto text-base">
            Mais de uma geração de experiência no desenvolvimento de suplementos alimentares
            com marcas exclusivas e compromisso com a vida.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reasons.map(({ icon, title, desc }) => (
            <div
              key={title}
              className="group flex flex-col items-center text-center p-8 rounded-2xl border border-gray-100 hover:border-[#c4b5fd] hover:shadow-xl transition-all duration-300"
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
  );
}
