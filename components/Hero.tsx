export default function Hero() {
  return (
    <section
      className="relative min-h-[88vh] flex items-center overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #1a0533 0%, #2d1654 45%, #1e3a5f 100%)' }}
    >
      {/* Padrão decorativo de fundo */}
      <div className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Círculos decorativos */}
      <div className="absolute top-20 right-20 w-96 h-96 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #a855f7, transparent)' }} />
      <div className="absolute bottom-10 left-10 w-72 h-72 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
        <div className="max-w-3xl">

          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-8">
            <span className="w-2 h-2 rounded-full bg-[#a855f7] animate-pulse" />
            <span className="text-sm text-white/90 font-medium">Suplementos Alimentares com Procedência Garantida</span>
          </div>

          {/* Título */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-tight mb-6">
            Qualidade e{' '}
            <span style={{ color: '#c084fc' }}>Tecnologia</span>
            <br />
            para sua Rotina
          </h1>

          {/* Subtexto */}
          <p className="text-lg sm:text-xl text-white/75 mb-10 leading-relaxed max-w-2xl">
            Suplementos alimentares desenvolvidos com formulações exclusivas,
            insumos selecionados e tecnologia de ponta. Cada produto para
            complementar sua alimentação com confiança e procedência.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <a
              href="#produtos"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-white text-base transition-all duration-200 hover:scale-105 hover:shadow-2xl"
              style={{ background: 'linear-gradient(135deg, #6b21a8, #7c3aed)' }}
            >
              Ver Todos os Produtos
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
            <a
              href="#qualidade"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-white text-base border border-white/30 hover:bg-white/10 transition-all duration-200"
            >
              Conheça a Metalab
            </a>
          </div>

          {/* Micro-badges */}
          <div className="flex flex-wrap gap-4">
            {[
              { icon: '✓', label: 'Embalagem Lacrada' },
              { icon: '✓', label: 'Formulação Exclusiva' },
              { icon: '✓', label: 'Sem Indicação Terapêutica' },
              { icon: '✓', label: 'Produto Não é Medicamento' },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-white/80 text-sm">
                <span className="text-[#c084fc] font-bold">{icon}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
