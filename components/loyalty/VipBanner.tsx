import { levels } from '@/data/loyalty';

export default function VipBanner() {
  return (
    <section className="py-16 sm:py-20 bg-navy border-b border-navy-700 overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Texto */}
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-2 mb-6">
              <span className="w-2 h-2 rounded-full bg-gold-400" />
              <span className="text-sm text-on-navy/90 font-medium">Programa de Fidelidade</span>
            </div>

            <h2 className="font-display text-4xl sm:text-5xl text-on-navy leading-tight mb-4">
              Ganhe <span className="text-gold-400">cashback</span> em{' '}
              cada compra
            </h2>

            <p className="text-navy-100 text-lg leading-relaxed mb-8 max-w-lg">
              Acumule pontos, suba de nível e desbloqueie benefícios exclusivos como frete grátis,
              cupons e acesso antecipado a lançamentos.
            </p>

            {/* Mini benefícios */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              {[
                { text: 'Até 8% cashback' },
                { text: 'Frete grátis' },
                { text: 'Acesso antecipado' },
                { text: 'Cupons exclusivos' },
              ].map(({ text }) => (
                <div key={text} className="flex items-center gap-2.5 text-navy-100 text-sm">
                  <svg className="w-4 h-4 text-gold-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{text}</span>
                </div>
              ))}
            </div>

            <a
              href="/vip"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold bg-brand text-on-brand transition-all duration-200 hover:bg-brand-hover text-base"
            >
              Acessar área VIP
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>

          {/* Cards de nível */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-4">
            {levels.map((lvl, i) => (
              <div
                key={lvl.id}
                className="relative flex items-center gap-4 rounded-2xl p-5 border flex-1"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  borderColor: lvl.color + '40',
                }}
              >
                {/* Badge */}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 shadow-lg"
                  style={{ background: lvl.gradient }}
                >
                  {lvl.emoji}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-base uppercase tracking-widest" style={{ color: lvl.color }}>
                      {lvl.name}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/10 text-navy-100">
                      {lvl.cashbackPct}% cashback
                    </span>
                  </div>
                  <p className="text-navy-200 text-xs">
                    {lvl.maxPoints
                      ? `${lvl.minPoints.toLocaleString('pt-BR')} – ${lvl.maxPoints.toLocaleString('pt-BR')} pontos`
                      : `${lvl.minPoints.toLocaleString('pt-BR')}+ pontos`}
                  </p>
                  <p className="text-navy-100 text-xs mt-1">{lvl.benefits[0].text}</p>
                </div>

                {i < levels.length - 1 && (
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-white/20 text-xs z-10">▼</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
