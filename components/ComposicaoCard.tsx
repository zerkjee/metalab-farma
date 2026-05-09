'use client';

import { Ingrediente } from '@/utils/productDetails';

interface ComposicaoCardProps {
  ingrediente: Ingrediente;
  corPrincipal: string;
}

const iconSymbols: Record<string, string> = {
  Hexagon: "◆",
  Droplets: "💧",
  Leaf: "🌿",
  Zap: "⚡",
  Apple: "🍎",
  Pill: "💊",
  Wheat: "🌾",
  Pine: "🌲",
  Moon: "🌙",
  Heart: "❤️",
  Shield: "🛡️",
  Sparkles: "✨",
};

export default function ComposicaoCard({
  ingrediente,
  corPrincipal,
}: ComposicaoCardProps) {
  const iconSymbol = iconSymbols[ingrediente.icone as keyof typeof iconSymbols] || "✨";

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-200">
      {/* Ícone */}
      <div className="mb-4 flex items-center justify-center">
        <div
          className="p-3 rounded-lg text-4xl"
          style={{
            backgroundColor: corPrincipal + '20',
          }}
        >
          {iconSymbol}
        </div>
      </div>

      {/* Nome do Ingrediente */}
      <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">
        {ingrediente.nome}
      </h3>

      {/* Descrição */}
      <p className="text-sm text-gray-600 text-center leading-relaxed">
        {ingrediente.descricao}
      </p>
    </div>
  );
}
