'use client';

import Link from 'next/link';
import { Product } from '@/types/product';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const preco = typeof product.preco === 'number' ? product.preco : parseFloat(String(product.preco));

  const precoFormatado = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(preco);

  const temEstoque = product.estoque > 0;
  const cor = product.corPrincipal ?? product.cor_principal ?? '#6b21a8';

  return (
    <div
      className="group relative flex flex-col bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
      style={{
        boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
        borderTop: `4px solid ${cor}`,
        border: '1px solid #f3f4f6',
        borderTopColor: cor,
      }}
    >
      {/* Imagem */}
      <div className="relative w-full h-52 bg-gray-50 flex items-center justify-center overflow-hidden">
        {(product.imagemUrl ?? product.imagem_url) ? (
          <img
            src={(product.imagemUrl ?? product.imagem_url)!}
            alt={product.nome}
            className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center gap-2">
            <svg className="w-16 h-16 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span className="text-xs text-gray-300">Sem imagem</span>
          </div>
        )}

        {/* Selos */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white shadow-sm">
            ✓ Lacrado
          </span>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="flex flex-col flex-1 p-4 gap-3">

        {/* Marca + Selo terapêutico */}
        <div className="flex items-center justify-between gap-2">
          <span
            className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide text-white"
            style={{ background: cor }}
          >
            {product.marca}
          </span>
          <span className="text-[9px] text-gray-400 text-right leading-tight">
            Sem indicação<br />terapêutica
          </span>
        </div>

        {/* Nome */}
        <h3 className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug flex-1 min-h-[2.5rem]">
          {product.nome}
        </h3>

        {/* Preço */}
        <div>
          <p
            className="text-2xl font-black leading-none"
            style={{ color: cor }}
          >
            {precoFormatado}
          </p>
          <p className={`text-xs mt-1 font-medium ${temEstoque ? 'text-emerald-600' : 'text-red-500'}`}>
            {temEstoque ? `● Em estoque` : '● Fora de estoque'}
          </p>
        </div>

        {/* Botões */}
        <div className="flex gap-2 mt-auto">
          <Link
            href={`/produtos/${product.id}`}
            className="flex-1 py-2 text-xs font-bold rounded-xl border transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 flex items-center justify-center"
            style={{ borderColor: cor, color: cor }}
          >
            Ver Produto
          </Link>
          <button
            onClick={() => addItem(product)}
            disabled={!temEstoque}
            className="flex-1 py-2 text-xs font-bold rounded-xl text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 active:scale-95"
            style={{ background: cor }}
          >
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
}
