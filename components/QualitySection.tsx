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
    <section id="qualidade" className="border-t border-gray-100 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] xl:grid-cols-[1fr_480px]">

        {/* Painel de texto */}
        <div className="py-20 px-6 sm:px-10 lg:px-16 xl:px-20 bg-white">
          <div className="max-w-xl">
            <p className="text-xs font-bold text-[#0f2756] uppercase tracking-[0.2em] mb-4">
              Qualidade e Tecnologia
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight leading-tight mb-6">
              Suplementos Desenvolvidos<br className="hidden sm:block" /> com Rigor Técnico
            </h2>
            <p className="text-gray-600 text-base leading-relaxed mb-8">
              Nossos suplementos alimentares são produzidos com formulações exclusivas,
              insumos selecionados e processos que garantem a integridade de cada produto
              desde a fabricação até a entrega. Este produto não é medicamento.
            </p>

            <ul className="space-y-3.5 mb-10">
              {bullets.map((b) => (
                <li key={b} className="flex items-start gap-3 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-[#0f2756] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  className="flex flex-col items-center justify-center p-5 rounded-xl bg-gray-50 border border-gray-200 text-center hover:border-[#0f2756]/30 hover:shadow-sm transition-all duration-300"
                >
                  <span className="text-2xl font-bold text-[#0f2756] mb-1.5 tracking-tight">{value}</span>
                  <span className="text-xs text-gray-500 font-medium leading-tight">{label}</span>
                </div>
              ))}
            </div>

            {/* Aviso regulatório */}
            <div className="p-5 rounded-xl bg-gray-900 text-white border border-gray-800">
              <div className="flex items-start gap-3">
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-white">Aviso regulatório</p>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">
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
          <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-transparent pointer-events-none" />
        </div>

      </div>
    </section>
  );
}
