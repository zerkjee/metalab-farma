import { FlaskConical, Quote } from 'lucide-react';
import type { IngredientResearch } from '@/lib/ingredient-research';

interface IngredientResearchCardsProps {
  cards: IngredientResearch[];
}

export default function IngredientResearchCards({ cards }: IngredientResearchCardsProps) {
  if (cards.length === 0) return null;

  return (
    <section className="py-14 bg-[#0a1e45] border-b border-[#0f2756]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-10">
          <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/10 shrink-0">
            <FlaskConical size={18} className="text-white/80" />
          </span>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40 mb-0.5">
              Evidências científicas
            </p>
            <h2 className="text-lg sm:text-xl font-black text-white leading-tight">
              O que a ciência diz sobre cada ingrediente
            </h2>
          </div>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card, i) => (
            <div
              key={i}
              className="relative flex flex-col gap-3 rounded-2xl p-5 overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #0f2756 0%, #132e66 100%)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              {/* Subtle large quote icon watermark */}
              <Quote
                size={56}
                className="absolute -top-1 -right-2 text-white/[0.04]"
                aria-hidden
              />

              {/* Ingredient name */}
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/40 leading-none">
                {card.chaves[0].replace(/\b\w/g, c => c.toUpperCase())}
              </p>

              {/* Research fact */}
              <p className="text-sm text-white/85 leading-relaxed flex-1">
                {card.fato}
              </p>

              {/* Source */}
              <p className="text-[10px] text-white/35 font-semibold leading-tight border-t border-white/[0.08] pt-3">
                {card.fonte}
              </p>
            </div>
          ))}
        </div>

        <p className="text-[10px] text-white/25 mt-8 text-center">
          Informações de caráter científico e educativo. Suplemento alimentar não é medicamento e não possui indicação terapêutica.
        </p>
      </div>
    </section>
  );
}
