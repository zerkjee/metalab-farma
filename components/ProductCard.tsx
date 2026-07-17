'use client';

import Link from 'next/link';
import { memo, useCallback } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Product } from '@/types/product';
import { useCart } from '@/context/CartContext';
import { fmtCurrency } from '@/utils/formatters';
import ProductImage from '@/components/ProductImage';

interface ProductCardProps {
  product: Product;
}

function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const preco = typeof product.preco === 'number' ? product.preco : parseFloat(String(product.preco));
  const precoOriginal = product.precoOriginal ? Number(product.precoOriginal) : null;
  const desconto = precoOriginal ? Math.round((1 - preco / precoOriginal) * 100) : 0;
  const temEstoque = product.estoque > 0;
  const cor = product.corPrincipal ?? 'var(--navy-500)';
  const handleAdd = useCallback(() => addItem(product), [addItem, product]);

  return (
    <div
      className="group relative flex flex-col bg-surface-card rounded-lg border border-line shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
    >
      {/* Imagem */}
      <Link href={`/produtos/${product.slug}`} className="relative flex aspect-square w-full items-center justify-center overflow-hidden bg-surface-card p-5">
        {product.imagemUrl ? (
          <ProductImage
            src={product.imagemUrl}
            alt={product.nome}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            frameClassName="h-full max-w-full"
            imageClassName="drop-shadow-[0_12px_18px_rgba(8,18,38,0.18)] transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3">
            <div className="w-16 h-16 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${cor}15` }}>
              <svg className="w-8 h-8" fill="none" stroke={cor} viewBox="0 0 24 24" strokeOpacity="0.4">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <span className="text-[11px] font-medium text-ink-muted">Imagem em breve</span>
          </div>
        )}

        {/* Badge desconto */}
        {desconto > 0 && (
          <div className="absolute top-2 right-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black text-on-brand shadow-sm"
              style={{ backgroundColor: cor }}>
              -{desconto}%
            </span>
          </div>
        )}

        {/* Fora de estoque overlay */}
        {!temEstoque && (
          <div className="absolute inset-0 bg-surface-card/70 flex items-center justify-center">
            <span className="px-3 py-1 rounded-full text-xs font-bold text-ink-secondary bg-neutral-100 border border-line">
              Indisponível
            </span>
          </div>
        )}
      </Link>

      {/* Conteúdo */}
      <div className="flex flex-col flex-1 p-4 gap-2.5">
        <div className="flex items-center justify-between gap-2">
          <span
            className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-on-brand"
            style={{ background: cor }}
          >
            {product.marca}
          </span>
          {temEstoque && (
            <span className="text-[10px] text-success font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />
              Em estoque
            </span>
          )}
        </div>

        <h3 className="font-display text-sm font-medium text-ink line-clamp-2 leading-snug flex-1 min-h-[2.5rem]">
          {product.nome}
        </h3>

        <div className="flex items-end gap-2">
          <p className="font-display text-xl font-semibold leading-none" style={{ color: cor }}>
            {fmtCurrency(preco)}
          </p>
          {precoOriginal && (
            <p className="text-xs text-ink-muted line-through leading-none mb-0.5">
              {fmtCurrency(precoOriginal)}
            </p>
          )}
        </div>

        {/* Trust strip */}
        <div className="flex items-center gap-1.5 py-1.5 px-2 rounded-md bg-surface-sunken border border-line">
          <svg className="w-3.5 h-3.5 text-success flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-[10px] font-semibold text-ink-secondary">Lacrado · Procedência garantida</span>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-2 mt-auto pt-1">
          <button
            onClick={handleAdd}
            disabled={!temEstoque}
            className="w-full py-3 text-sm font-bold rounded-full text-on-brand transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 active:scale-95 flex items-center justify-center gap-2"
            style={{ background: temEstoque ? cor : 'var(--neutral-400)' }}
          >
            <ShoppingCart className="w-4 h-4" strokeWidth={2} />
            {temEstoque ? 'Adicionar ao carrinho' : 'Indisponível'}
          </button>
          <Link
            href={`/produtos/${product.slug}`}
            className="w-full py-2 text-xs font-semibold rounded-full border transition-all duration-200 hover:bg-surface-sunken flex items-center justify-center text-ink-secondary border-line hover:border-line-strong"
          >
            Ver detalhes
          </Link>
        </div>
      </div>
    </div>
  );
}

export default memo(ProductCard, (prev, next) =>
  prev.product.id === next.product.id &&
  prev.product.preco === next.product.preco &&
  prev.product.estoque === next.product.estoque
);
