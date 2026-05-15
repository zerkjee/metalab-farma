'use client';

import { Product } from '@/types/product';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const preco = typeof product.preco === 'number' ? product.preco : parseFloat(String(product.preco));

  const precoFormatado = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(preco);

  const temEstoque = product.estoque > 0;

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-gray-200">
      {/* Imagem do Produto */}
      <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
        {product.imagemUrl ? (
          <img
            src={product.imagemUrl!}
            alt={product.nome}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center">
            <div className="text-5xl text-blue-300">📦</div>
            <p className="text-gray-400 text-sm mt-2">Sem imagem</p>
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="p-4">
        {/* Marca */}
        <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold">
          {product.marca}
        </p>

        {/* Nome */}
        <h3 className="text-lg font-bold text-gray-900 mt-2 line-clamp-2 h-14">
          {product.nome}
        </h3>

        {/* Descrição */}
        {product.descricaoCurta && (
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
            {product.descricaoCurta}
          </p>
        )}

        {/* Preço e Estoque */}
        <div className="mt-4 flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold text-blue-600">
              {precoFormatado}
            </p>
            <p className={`text-xs mt-1 ${temEstoque ? 'text-green-600' : 'text-red-600'}`}>
              {temEstoque ? `${product.estoque} em estoque` : 'Fora de estoque'}
            </p>
          </div>
        </div>

        {/* Botão */}
        <button
          disabled={!temEstoque}
          className={`w-full mt-4 py-2 rounded-lg font-semibold transition-colors ${
            temEstoque
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {temEstoque ? 'Ver Produto' : 'Indisponível'}
        </button>
      </div>
    </div>
  );
}
