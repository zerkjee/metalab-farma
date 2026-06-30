import { FlaskConical } from 'lucide-react';
import { Ingrediente } from '@/utils/productDetails';

interface ComposicaoSectionProps {
  composicao: Ingrediente[];
  corPrincipal: string;
}

export default function ComposicaoSection({
  composicao,
  corPrincipal,
}: ComposicaoSectionProps) {
  if (!composicao || composicao.length === 0) return null;

  return (
    <section id="descricao" className="py-14 bg-white border-b border-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Cabeçalho */}
        <div className="flex items-center gap-3 mb-8">
          <span
            className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
            style={{ backgroundColor: `${corPrincipal}15` }}
          >
            <FlaskConical size={20} style={{ color: corPrincipal }} />
          </span>
          <div>
            <p
              className="text-xs font-black uppercase tracking-[0.2em]"
              style={{ color: corPrincipal }}
            >
              Ingredientes
            </p>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">
              Composição do produto
            </h2>
          </div>
        </div>

        {/* Chips */}
        <div className="flex flex-wrap gap-2.5">
          {composicao.map((ing) => (
            <span
              key={ing.nome}
              className="px-4 py-2 rounded-full text-sm font-semibold border"
              style={{
                backgroundColor: `${corPrincipal}08`,
                color: corPrincipal,
                borderColor: `${corPrincipal}30`,
              }}
            >
              {ing.nome}
            </span>
          ))}
        </div>

        <p className="text-xs text-gray-400 mt-6">
          Suplemento alimentar. Não é medicamento. Não possui indicação terapêutica. Leia o rótulo antes de consumir.
        </p>
      </div>
    </section>
  );
}
