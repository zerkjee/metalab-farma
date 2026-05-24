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
    <section id="qualidade" className="py-24 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* Texto */}
          <div>
            <p className="text-xs font-bold text-[#6b21a8] uppercase tracking-[0.2em] mb-4">
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

            <ul className="space-y-3.5">
              {bullets.map((b) => (
                <li key={b} className="flex items-start gap-3 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-[#6b21a8] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  {b}
                </li>
              ))}
            </ul>
          </div>

          {/* Métricas */}
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              {metrics.map(({ value, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center justify-center p-7 rounded-xl bg-gray-50 border border-gray-200 text-center hover:border-[#6b21a8]/30 hover:shadow-sm transition-all duration-300"
                >
                  <span className="text-3xl font-bold text-[#6b21a8] mb-2 tracking-tight">{value}</span>
                  <span className="text-xs text-gray-500 font-medium leading-tight">{label}</span>
                </div>
              ))}
            </div>

            {/* Aviso regulatório — sem emoji, estilo formal */}
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
      </div>
    </section>
  );
}
