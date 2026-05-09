'use client';

import ComposicaoCard from './ComposicaoCard';
import { Ingrediente } from '@/utils/productDetails';

interface ComposicaoSectionProps {
  composicao: Ingrediente[];
  corPrincipal: string;
}

export default function ComposicaoSection({
  composicao,
  corPrincipal,
}: ComposicaoSectionProps) {
  if (!composicao || composicao.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gray-50 border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Título */}
        <div className="mb-12 text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">
            Composição do Produto
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Cada ingrediente foi selecionado para complementar sua rotina alimentar
          </p>
          <div
            className="flex justify-center gap-2 mt-6"
          >
            <div
              className="w-1 h-8 rounded-full"
              style={{ backgroundColor: corPrincipal }}
            />
          </div>
        </div>

        {/* Grid de Ingredientes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {composicao.map((ingrediente, index) => (
            <ComposicaoCard
              key={index}
              ingrediente={ingrediente}
              corPrincipal={corPrincipal}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
