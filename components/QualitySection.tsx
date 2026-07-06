const bullets = [
  'Formulações exclusivas desenvolvidas com rigor técnico e controle laboratorial',
  'Matérias-primas com rastreabilidade e procedência comprovada em cada lote',
  'Embalagens lacradas com tecnologia de proteção e código de rastreio',
  'Processo produtivo auditado com inspeção em todas as etapas de fabricação',
  'Produtos em conformidade com a legislação vigente e normas da ANVISA',
  'Suplemento alimentar — não substitui medicamento nem alimentação equilibrada',
];

const metrics = [
  { value: '81+', label: 'Produtos no catálogo' },
  { value: '100%', label: 'Embalagens lacradas' },
  { value: 'BPF', label: 'Boas Práticas de Fabricação' },
  { value: 'RDC', label: 'Em conformidade regulatória' },
];

export default function QualitySection() {
  return (
    <section id="qualidade" className="border-t border-line overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr]">

        {/* Painel de texto */}
        <div className="py-20 px-6 sm:px-10 lg:px-16 xl:px-20 bg-surface-card">
          <div className="max-w-xl lg:max-w-none">
            <p className="text-xs font-bold text-brand uppercase tracking-[0.2em] mb-4">
              Qualidade e Tecnologia
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-navy tracking-tight leading-tight mb-6">
              Suplementos desenvolvidos<br className="hidden sm:block" /> com rigor técnico
            </h2>
            <p className="text-ink-secondary text-base leading-relaxed mb-8">
              Nossos suplementos alimentares são produzidos com formulações exclusivas,
              insumos selecionados e processos que garantem a integridade de cada produto
              desde a fabricação até a entrega. Este produto não é medicamento.
            </p>

            <ul className="space-y-3.5 mb-10">
              {bullets.map((b) => (
                <li key={b} className="flex items-start gap-3 text-sm text-ink-secondary">
                  <svg className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  {b}
                </li>
              ))}
            </ul>

            {/* Métricas */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              {metrics.map(({ value, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center justify-center p-5 rounded-lg bg-surface-sunken border border-line text-center hover:border-brand hover:shadow-sm transition-all duration-300"
                >
                  <span className="font-display text-2xl font-semibold text-navy mb-1.5 tracking-tight">{value}</span>
                  <span className="text-xs text-ink-secondary font-medium leading-tight">{label}</span>
                </div>
              ))}
            </div>

            {/* Aviso regulatório */}
            <div className="p-5 rounded-lg bg-navy text-on-navy border border-navy-600">
              <div className="flex items-start gap-3">
                <svg className="w-4 h-4 text-on-navy/50 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-on-navy">Aviso regulatório</p>
                  <p className="text-xs text-on-navy/60 mt-1 leading-relaxed">
                    Este produto não é medicamento e não possui indicação terapêutica. Não se destina ao diagnóstico, tratamento ou prevenção de doenças. Leia o rótulo com atenção antes de consumir.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Painel fotográfico — cápsulas em blister */}
        <div className="relative hidden lg:block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/backgrounds/capsulas-blister.jpg"
            alt="Cápsulas farmacêuticas em embalagem blister — padrão de qualidade Metalab"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          {/* Gradiente de transição na borda esquerda */}
          <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-surface-card to-transparent pointer-events-none" />
        </div>

      </div>
    </section>
  );
}
