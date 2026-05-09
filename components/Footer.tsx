export default function Footer() {
  const nav = {
    Produtos: ['Suplementos', 'Vitaminas', 'Minerais', 'Fitoterápicos'],
    Institucional: ['Sobre a Metalab', 'Qualidade', 'Certificações', 'Contato'],
    Atendimento: ['FAQ', 'Política de Privacidade', 'Trocas e Devoluções', 'Fale Conosco'],
  };

  return (
    <footer className="bg-gray-950 text-white">
      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Logo + tagline */}
          <div className="lg:col-span-1">
            <div className="flex items-baseline gap-1 mb-3">
              <span className="text-2xl font-black text-white">METALAB</span>
              <span className="text-lg font-semibold text-[#c084fc]">Store</span>
            </div>
            <p className="text-sm text-gray-400 italic mb-4">Compromisso com a vida</p>
            <p className="text-xs text-gray-500 leading-relaxed">
              Suplementos alimentares com qualidade e procedência.
              Este produto não é medicamento. Não tem indicação terapêutica.
            </p>
          </div>

          {/* Links */}
          {Object.entries(nav).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wide">{section}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-gray-400 hover:text-[#c084fc] transition-colors duration-200">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer legal */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-xs text-gray-500 text-center leading-relaxed">
            ⚠️ Este site vende exclusivamente suplementos alimentares. Este produto não é medicamento e não pode ser indicado para diagnóstico, tratamento, cura ou prevenção de doenças.
            Sem indicação terapêutica. Leia o rótulo com atenção e consulte um profissional de saúde antes de consumir qualquer suplemento alimentar.
          </p>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-900 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-xs text-gray-600">© 2026 Metalab Store. Todos os direitos reservados.</p>
          <p className="text-xs text-gray-600">Produto lacrado de procedência garantida.</p>
        </div>
      </div>
    </footer>
  );
}
