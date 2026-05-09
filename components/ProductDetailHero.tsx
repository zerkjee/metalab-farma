'use client';

import { Product } from '@/types/product';

interface ProductDetailHeroProps {
  product: Product;
  corPrincipal: string;
}

export default function ProductDetailHero({
  product,
  corPrincipal,
}: ProductDetailHeroProps) {
  const preco = typeof product.preco === 'string'
    ? parseFloat(product.preco)
    : product.preco;

  const precoFormatado = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(preco);

  const temEstoque = product.estoque > 0;

  return (
    <section className="py-12 bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Imagem */}
          <div className="flex items-center justify-center bg-gray-50 rounded-2xl p-8 h-full min-h-96">
            {product.imagem_url ? (
              <img
                src={product.imagem_url}
                alt={product.nome}
                className="w-full h-full object-contain max-h-96"
              />
            ) : (
              <div className="flex flex-col items-center gap-4 text-gray-400">
                <svg
                  className="w-24 h-24"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
                <span className="text-sm">Sem imagem disponível</span>
              </div>
            )}
          </div>

          {/* Informações */}
          <div className="flex flex-col justify-center gap-6">
            {/* Marca */}
            <div>
              <span
                className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide text-white"
                style={{ backgroundColor: corPrincipal }}
              >
                {product.marca}
              </span>
            </div>

            {/* Nome e Subtítulo */}
            <div>
              <h1 className="text-4xl font-black text-gray-900 mb-2">
                {product.nome}
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed">
                Suplemento alimentar de qualidade e procedência garantida
              </p>
            </div>

            {/* Preço */}
            <div
              className="text-4xl font-black"
              style={{ color: corPrincipal }}
            >
              {precoFormatado}
            </div>

            {/* Estoque */}
            <div
              className={`text-sm font-semibold ${
                temEstoque ? 'text-emerald-600' : 'text-red-600'
              }`}
            >
              {temEstoque ? (
                <span>● Em estoque ({product.estoque} unidades disponíveis)</span>
              ) : (
                <span>● Fora de estoque</span>
              )}
            </div>

            {/* Selos */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg
                  className="w-5 h-5 text-emerald-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-semibold">Produto lacrado</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg
                  className="w-5 h-5 text-blue-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-semibold">Sem indicação terapêutica</span>
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-3 pt-4">
              <button
                disabled={!temEstoque}
                className="flex-1 py-3 px-6 text-sm font-bold rounded-xl border-2 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                style={{
                  borderColor: corPrincipal,
                  color: corPrincipal,
                }}
              >
                Mais Informações
              </button>
              <button
                disabled={!temEstoque}
                className="flex-1 py-3 px-6 text-sm font-bold text-white rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 active:scale-95"
                style={{
                  backgroundColor: corPrincipal,
                }}
              >
                {temEstoque ? 'Adicionar ao Carrinho' : 'Indisponível'}
              </button>
            </div>

            {/* Nota legal */}
            <p className="text-xs text-gray-400 pt-4 border-t border-gray-200">
              Suplemento alimentar. Este produto não é medicamento.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
