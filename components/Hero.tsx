export default function Hero() {
  return (
    <section
      className="relative min-h-[88vh] flex items-center overflow-hidden bg-navy"
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
        style={{ background: 'radial-gradient(circle, var(--blue-400), transparent)' }} />
      <div className="absolute bottom-10 left-10 w-72 h-72 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, var(--blue-400), transparent)' }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
        <div className="max-w-3xl">

          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 bg-on-navy/10 border border-on-navy/20 rounded-full px-4 py-2 mb-8">
            <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
            <span className="text-sm text-on-navy/90 font-medium">Suplementos alimentares com procedência garantida</span>
          </div>

          {/* Título */}
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-semibold text-on-navy leading-tight mb-6">
            Qualidade e{' '}
            <span className="text-brand">tecnologia</span>
            <br />
            para sua rotina
          </h1>

          {/* Subtexto */}
          <p className="text-lg sm:text-xl text-on-navy/75 mb-10 leading-relaxed max-w-2xl">
            Suplementos alimentares desenvolvidos com formulações exclusivas,
            insumos selecionados e tecnologia de ponta. Cada produto para
            complementar sua alimentação com confiança e procedência.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <a
              href="#produtos"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-on-brand bg-brand text-base transition-all duration-200 hover:bg-brand-hover hover:scale-105"
            >
              Ver todos os produtos
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
            <a
              href="#qualidade"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-on-navy text-base border border-on-navy/30 hover:bg-on-navy/10 transition-all duration-200"
            >
              Conheça a Metalab
            </a>
          </div>

          {/* Micro-badges */}
          <div className="flex flex-wrap gap-4">
            {[
              'Embalagem lacrada',
              'Formulação exclusiva',
              'Sem indicação terapêutica',
              'Produto não é medicamento',
            ].map((label) => (
              <div key={label} className="flex items-center gap-2 text-on-navy/80 text-sm">
                <svg className="w-4 h-4 text-brand flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
