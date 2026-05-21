'use client';

import Image from 'next/image';
import { useRef, useEffect, useState } from 'react';
import { Product } from '@/types/product';
import { useCart } from '@/context/CartContext';
import { fmtCurrency } from '@/utils/formatters';

type KitOpcao = NonNullable<Product['kitsDisponiveis']>[number];

interface ProductDetailHeroProps {
  product: Product;
  corPrincipal: string;
}

export default function ProductDetailHero({
  product,
  corPrincipal,
}: ProductDetailHeroProps) {
  const { addItem } = useCart();

  const preco = typeof product.preco === 'number' ? product.preco : parseFloat(String(product.preco));
  const precoOriginal = product.precoOriginal ? Number(product.precoOriginal) : null;
  const descontoBase = precoOriginal ? Math.round((1 - preco / precoOriginal) * 100) : 0;

  const temEstoque = product.estoque > 0;
  const kits = product.kitsDisponiveis ?? [];
  const temKits = product.tipo === 'SIMPLES' && kits.length > 0;

  // Kit selecionado: null = produto base (1 unidade)
  const [selectedKit, setSelectedKit] = useState<KitOpcao | null>(null);

  const precoAtual = selectedKit ? selectedKit.preco : preco;
  const precoOriginalAtual = selectedKit ? selectedKit.precoOriginal : precoOriginal;
  const estoqueAtual = selectedKit ? selectedKit.estoque : product.estoque;
  const temEstoqueAtual = estoqueAtual > 0;

  function handleAddToCart() {
    if (selectedKit) {
      addItem({
        id:           selectedKit.id,
        nome:         selectedKit.nome,
        slug:         selectedKit.slug,
        marca:        product.marca,
        tipo:         'KIT',
        preco:        selectedKit.preco,
        precoOriginal: selectedKit.precoOriginal,
        estoque:      selectedKit.estoque,
        imagemUrl:    product.imagemUrl ?? null,
        corPrincipal: product.corPrincipal ?? null,
        tags:         [],
        ativo:        true,
      });
    } else {
      addItem(product);
    }
  }

  // Sticky CTA — aparece em mobile quando os botões originais saem da tela
  const botoesRef = useRef<HTMLDivElement>(null);
  const [stickyCta, setStickyCta] = useState(false);

  useEffect(() => {
    const el = botoesRef.current;
    if (!el || typeof window === 'undefined') return;
    const obs = new IntersectionObserver(
      ([entry]) => setStickyCta(!entry.isIntersecting),
      { rootMargin: '0px 0px -60px 0px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <>
    <section className="py-12 bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Imagem */}
          <div className="flex items-center justify-center bg-gray-50 rounded-2xl p-8 h-full min-h-96">
            {product.imagemUrl ? (
              <Image
                src={product.imagemUrl}
                alt={product.nome}
                width={480}
                height={480}
                className="w-full h-full object-contain max-h-96"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
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

            {/* Nome */}
            <div>
              <h1 className="text-2xl sm:text-4xl font-black text-gray-900 mb-2">
                {product.nome}
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed">
                Suplemento alimentar de qualidade e procedência garantida
              </p>
            </div>

            {/* Preço */}
            <div className="flex items-end gap-3">
              <div
                data-testid="product-current-price"
                className="text-3xl sm:text-4xl font-black"
                style={{ color: corPrincipal }}
              >
                {fmtCurrency(precoAtual)}
              </div>
              {precoOriginalAtual && (
                <>
                  <span className="text-lg text-gray-400 line-through mb-0.5">
                    {fmtCurrency(precoOriginalAtual)}
                  </span>
                  <span
                    className="mb-1 px-2 py-0.5 rounded-full text-xs font-black text-white"
                    style={{ backgroundColor: corPrincipal }}
                  >
                    -{selectedKit
                      ? Math.round((1 - selectedKit.preco / (selectedKit.precoOriginal ?? selectedKit.preco)) * 100)
                      : descontoBase}%
                  </span>
                </>
              )}
            </div>

            {/* Kit selector */}
            {temKits && (
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                  Escolha a quantidade
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {/* Opção 1 unidade */}
                  <button
                    onClick={() => setSelectedKit(null)}
                    className={`flex flex-col items-center py-3 px-2 rounded-xl border-2 transition-all duration-200 text-center ${
                      selectedKit === null
                        ? 'border-current text-current bg-purple-50'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                    style={selectedKit === null ? { borderColor: corPrincipal, color: corPrincipal } : {}}
                  >
                    <span className="text-xs font-bold leading-tight">1 unidade</span>
                    <span className="text-sm font-black mt-0.5">{fmtCurrency(preco)}</span>
                    {precoOriginal && (
                      <span className="text-[10px] text-gray-400 line-through">{fmtCurrency(precoOriginal)}</span>
                    )}
                  </button>

                  {/* Opções de kit */}
                  {kits.map((kit) => {
                    const isSelected = selectedKit?.id === kit.id;
                    const pct = kit.precoOriginal
                      ? Math.round((1 - kit.preco / kit.precoOriginal) * 100)
                      : null;
                    return (
                      <button
                        key={kit.id}
                        onClick={() => setSelectedKit(kit)}
                        className={`relative flex flex-col items-center py-3 px-2 rounded-xl border-2 transition-all duration-200 text-center ${
                          isSelected
                            ? 'border-current'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                        style={isSelected ? { borderColor: corPrincipal, color: corPrincipal, backgroundColor: `${corPrincipal}0d` } : {}}
                      >
                        {pct && (
                          <span
                            className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full text-[9px] font-black text-white whitespace-nowrap"
                            style={{ backgroundColor: corPrincipal }}
                          >
                            -{pct}%
                          </span>
                        )}
                        <span className="text-xs font-bold leading-tight">
                          Kit {kit.quantidade}
                        </span>
                        <span className="text-sm font-black mt-0.5">{fmtCurrency(kit.preco)}</span>
                        {kit.precoOriginal && (
                          <span className="text-[10px] text-gray-400 line-through">{fmtCurrency(kit.precoOriginal)}</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Economia exibida */}
                {selectedKit?.precoOriginal && (
                  <p className="mt-2 text-xs font-semibold text-emerald-600">
                    Você economiza {fmtCurrency(selectedKit.precoOriginal - selectedKit.preco)} neste kit
                  </p>
                )}
              </div>
            )}

            {/* Estoque */}
            <div
              className={`text-sm font-semibold ${
                temEstoqueAtual ? 'text-emerald-600' : 'text-red-600'
              }`}
            >
              {temEstoqueAtual ? (
                <span>● Em estoque ({estoqueAtual} unidades disponíveis)</span>
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
            <div ref={botoesRef} className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                disabled={!temEstoqueAtual}
                className="w-full sm:flex-1 py-3.5 px-6 text-sm font-bold rounded-xl border-2 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                style={{
                  borderColor: corPrincipal,
                  color: corPrincipal,
                }}
              >
                Mais Informações
              </button>
              <button
                onClick={handleAddToCart}
                disabled={!temEstoqueAtual}
                className="w-full sm:flex-1 py-3.5 px-6 text-sm font-bold text-white rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 active:scale-95"
                style={{
                  backgroundColor: corPrincipal,
                }}
              >
                {temEstoqueAtual ? 'Adicionar ao Carrinho' : 'Indisponível'}
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

    {/* Sticky CTA mobile — visível apenas quando os botões originais saíram da tela */}
    <div
      aria-hidden={!stickyCta}
      className={`fixed bottom-0 left-0 right-0 z-[60] bg-white/95 backdrop-blur-sm border-t border-gray-100 px-4 py-3 flex items-center gap-3 md:hidden transition-transform duration-300 ${stickyCta ? 'translate-y-0' : 'translate-y-full'}`}
    >
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-500 truncate">{product.marca}</p>
        <p className="text-sm font-black text-gray-900 truncate">
          {selectedKit ? selectedKit.nome : product.nome}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-sm font-black" style={{ color: corPrincipal }}>{fmtCurrency(precoAtual)}</span>
        <button
          onClick={handleAddToCart}
          disabled={!temEstoqueAtual}
          className="py-2.5 px-4 text-sm font-bold text-white rounded-xl disabled:opacity-40 active:scale-95 transition-all"
          style={{ backgroundColor: corPrincipal }}
        >
          {temEstoqueAtual ? 'Comprar' : 'Indisponível'}
        </button>
      </div>
    </div>
    </>
  );
}
