const bullets = [
  'Formulações exclusivas desenvolvidas por especialistas',
  'Matérias-primas com rastreabilidade e procedência comprovada',
  'Embalagens lacradas com tecnologia de proteção',
  'Processo produtivo com controle rigoroso de qualidade',
  'Produtos registrados e em conformidade com a legislação vigente',
  'Sem indicação terapêutica — para complementar sua alimentação',
];

const metrics = [
  { value: '81+', label: 'Produtos no catálogo' },
  { value: '100%', label: 'Embalagens lacradas' },
  { value: 'BPF', label: 'Boas Práticas de Fabricação' },
  { value: 'RDC', label: 'Em conformidade regulatória' },
];

export default function QualitySection() {
  return (
    <section id="qualidade" className="py-24 bg-[#f5f3ff]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Texto */}
          <div>
            <p className="text-sm font-semibold text-[#6b21a8] uppercase tracking-widest mb-4">
              Qualidade e Tecnologia
            </p>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight mb-6">
              Suplementos Desenvolvidos com Rigor Técnico
            </h2>
            <p className="text-gray-600 text-base leading-relaxed mb-8">
              Nossos suplementos alimentares são produzidos com formulações exclusivas,
              insumos selecionados e processos que garantem a integridade de cada produto
              desde a fabricação até a sua entrega. Este produto não é medicamento e
              não deve substituir uma alimentação equilibrada.
            </p>

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

          {/* Métricas */}
          <div className="grid grid-cols-2 gap-4">
            {metrics.map(({ value, label }) => (
              <div
                key={label}
                className="flex flex-col items-center justify-center p-8 rounded-2xl bg-white border border-[#ede9fe] shadow-sm text-center"
              >
                <span className="text-4xl font-black text-[#6b21a8] mb-2">{value}</span>
                <span className="text-sm text-gray-500 font-medium">{label}</span>
              </div>
            ))}

            {/* Banner disclaimer */}
            <div className="col-span-2 p-5 rounded-2xl bg-[#6b21a8] text-white text-center">
              <p className="text-sm font-semibold">
                ⚠️ Este produto não é medicamento.
              </p>
              <p className="text-xs text-white/75 mt-1">
                Sem indicação terapêutica. Leia o rótulo com atenção antes de consumir.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
