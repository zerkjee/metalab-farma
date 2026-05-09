const cards = [
  {
    title: 'Embalagem Moderna',
    desc: 'Produtos lacrados com tecnologia de proteção e rastreabilidade para garantir sua segurança.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    title: 'Novas Tecnologias',
    desc: 'Formulações desenvolvidas com rigor técnico e processos industriais de última geração.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    title: 'Abordagem Única',
    desc: 'Cada produto pensado para complementar sua alimentação com cuidado e responsabilidade.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  {
    title: 'Insumos de Qualidade',
    desc: 'Ingredientes selecionados com procedência comprovada e rastreabilidade da cadeia produtiva.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
  },
];

export default function TrustSection() {
  return (
    <section className="bg-white border-t-4 border-[#6b21a8] py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-[#6b21a8] uppercase tracking-widest mb-3">Nossos Valores</p>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900">
            Nosso Compromisso com Você
          </h2>
          <p className="mt-4 text-gray-500 max-w-xl mx-auto">
            Tecnologia, cuidado e confiança em cada fórmula. Conheça os pilares que guiam cada produto Metalab.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map(({ title, desc, icon }) => (
            <div
              key={title}
              className="group flex flex-col items-start gap-4 p-6 rounded-2xl bg-[#f5f3ff] hover:bg-[#ede9fe] border border-[#ede9fe] hover:border-[#c4b5fd] hover:shadow-lg transition-all duration-300"
            >
              <div className="p-3 rounded-xl bg-white text-[#6b21a8] shadow-sm group-hover:shadow-md transition-shadow">
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
  );
}
