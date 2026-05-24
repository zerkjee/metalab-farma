'use client';

import Image from 'next/image';
import { useRef, useEffect, useState } from 'react';
import { ShoppingCart, Shield, Lock, Truck } from 'lucide-react';
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

  function scrollToDescricao() {
    document.getElementById('descricao')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

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

  const subtitulo = product.descricaoCurta?.trim()
    || 'Suplemento alimentar com qualidade e procedência garantida';

  return (
    <>
    <section className="py-10 md:py-14 bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-start">

          {/* Imagem */}
          <div className="relative flex items-center justify-center rounded-2xl overflow-hidden"
            style={{ background: `linear-gradient(145deg, ${corPrincipal}08, ${corPrincipal}04, #f8f8fb)`, minHeight: 380 }}>
            {product.imagemUrl ? (
              <Image
                src={product.imagemUrl}
                alt={product.nome}
                width={480}
                height={480}
                className="w-full object-contain max-h-[420px] p-8"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="flex flex-col items-center gap-4 py-16">
                <div className="w-24 h-24 rounded-3xl flex items-center justify-center"
                  style={{ backgroundColor: `${corPrincipal}15` }}>
                  <svg className="w-12 h-12" fill="none" stroke={corPrincipal} viewBox="0 0 24 24" strokeOpacity="0.35">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-400">Imagem em breve</span>
              </div>
            )}

            {/* Badge desconto na imagem */}
            {descontoBase > 0 && !selectedKit && (
              <div className="absolute top-4 right-4">
                <span className="inline-flex flex-col items-center px-3 py-1.5 rounded-xl text-white shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${corPrincipal}, ${corPrincipal}cc)` }}>
                  <span className="text-[10px] font-bold uppercase tracking-wide">Poupe</span>
                  <span className="text-xl font-black leading-none">-{descontoBase}%</span>
                </span>
              </div>
            )}
          </div>

          {/* Informações */}
          <div className="flex flex-col gap-5">

            {/* Marca + categoria */}
            <div className="flex items-center gap-2">
              <span
                className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-white"
                style={{ backgroundColor: corPrincipal }}
              >
                {product.marca}
              </span>
              <span className="text-xs text-gray-400 font-medium">Suplemento Alimentar</span>
            </div>

            {/* Nome */}
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight mb-2">
                {product.nome}
              </h1>
              <p className="text-gray-500 text-base leading-relaxed">
                {subtitulo}
              </p>
            </div>

            {/* Preço */}
            <div className="flex items-end gap-3 py-1">
              <div
                data-testid="product-current-price"
                className="text-4xl sm:text-5xl font-black leading-none"
                style={{ color: corPrincipal }}
              >
                {fmtCurrency(precoAtual)}
              </div>
              {precoOriginalAtual && (
                <div className="flex flex-col mb-1">
                  <span className="text-sm text-gray-400 line-through leading-tight">
                    {fmtCurrency(precoOriginalAtual)}
                  </span>
                  <span
                    className="text-xs font-black text-white px-2 py-0.5 rounded-full text-center"
                    style={{ backgroundColor: '#16a34a' }}
                  >
                    -{selectedKit
                      ? Math.round((1 - selectedKit.preco / (selectedKit.precoOriginal ?? selectedKit.preco)) * 100)
                      : descontoBase}% OFF
                  </span>
                </div>
              )}
            </div>

            {/* Estoque */}
            <div className={`flex items-center gap-1.5 text-sm font-semibold ${temEstoqueAtual ? 'text-emerald-600' : 'text-red-600'}`}>
              <span className={`w-2 h-2 rounded-full ${temEstoqueAtual ? 'bg-emerald-500' : 'bg-red-500'}`} />
              {temEstoqueAtual
                ? `Em estoque · ${estoqueAtual} unidade${estoqueAtual !== 1 ? 's' : ''} disponível${estoqueAtual !== 1 ? 'is' : ''}`
                : 'Fora de estoque'}
            </div>

            {/* Kit selector */}
            {temKits && (
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5">
                  Escolha a quantidade
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => setSelectedKit(null)}
                    className={`flex flex-col items-center py-3 px-2 rounded-xl border-2 transition-all duration-200 text-center ${
                      selectedKit === null
                        ? 'border-current bg-opacity-5'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                    style={selectedKit === null ? { borderColor: corPrincipal, color: corPrincipal, backgroundColor: `${corPrincipal}08` } : {}}
                  >
                    <span className="text-xs font-bold leading-tight">1 unidade</span>
                    <span className="text-sm font-black mt-0.5">{fmtCurrency(preco)}</span>
                    {precoOriginal && (
                      <span className="text-[10px] text-gray-400 line-through">{fmtCurrency(precoOriginal)}</span>
                    )}
                  </button>

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
                          isSelected ? '' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                        }`}
                        style={isSelected ? { borderColor: corPrincipal, color: corPrincipal, backgroundColor: `${corPrincipal}08` } : {}}
                      >
                        {pct && (
                          <span
                            className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full text-[9px] font-black text-white whitespace-nowrap"
                            style={{ backgroundColor: '#16a34a' }}
                          >
                            -{pct}%
                          </span>
                        )}
                        <span className="text-xs font-bold leading-tight">Kit {kit.quantidade}</span>
                        <span className="text-sm font-black mt-0.5">{fmtCurrency(kit.preco)}</span>
                        {kit.precoOriginal && (
                          <span className="text-[10px] text-gray-400 line-through">{fmtCurrency(kit.precoOriginal)}</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {selectedKit?.precoOriginal && (
                  <p className="mt-2 text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <span className="text-emerald-500">✓</span>
                    Você economiza {fmtCurrency(selectedKit.precoOriginal - selectedKit.preco)} neste kit
                  </p>
                )}
              </div>
            )}

            {/* Trust seals — ACIMA dos botões */}
            <div className="grid grid-cols-3 gap-2 py-1">
              <div className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-center">
                <Shield className="w-4 h-4 text-emerald-500" strokeWidth={2} />
                <span className="text-[10px] font-bold text-gray-600 leading-tight">Lacrado<br/>de fábrica</span>
              </div>
              <div className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-center">
                <Lock className="w-4 h-4 text-blue-500" strokeWidth={2} />
                <span className="text-[10px] font-bold text-gray-600 leading-tight">Compra<br/>segura</span>
              </div>
              <div className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-center">
                <Truck className="w-4 h-4 text-purple-500" strokeWidth={2} />
                <span className="text-[10px] font-bold text-gray-600 leading-tight">Entrega<br/>garantida</span>
              </div>
            </div>

            {/* Botões */}
            <div ref={botoesRef} className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAddToCart}
                disabled={!temEstoqueAtual}
                className="w-full sm:flex-[2] py-4 px-6 text-base font-black text-white rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg"
                style={{
                  background: temEstoqueAtual
                    ? `linear-gradient(135deg, ${corPrincipal}, ${corPrincipal}dd)`
                    : '#9ca3af',
                  boxShadow: temEstoqueAtual ? `0 8px 24px ${corPrincipal}40` : undefined,
                }}
              >
                <ShoppingCart className="w-5 h-5" strokeWidth={2.5} />
                {temEstoqueAtual ? 'Adicionar ao Carrinho' : 'Indisponível'}
              </button>
              <button
                onClick={scrollToDescricao}
                className="w-full sm:flex-1 py-4 px-4 text-sm font-bold rounded-xl border-2 transition-all duration-200 hover:bg-gray-50"
                style={{ borderColor: corPrincipal, color: corPrincipal }}
              >
                Ver Composição
              </button>
            </div>

            {/* Nota legal */}
            <p className="text-xs text-gray-400 border-t border-gray-100 pt-3">
              Suplemento alimentar. Não é medicamento. Sem indicação terapêutica.
            </p>
          </div>
        </div>
      </div>
    </section>

    {/* Sticky CTA mobile */}
    <div
      aria-hidden={!stickyCta}
      className={`fixed bottom-0 left-0 right-0 z-[60] bg-white/97 backdrop-blur-md border-t border-gray-200 px-4 py-3 flex items-center gap-3 md:hidden transition-transform duration-300 ${stickyCta ? 'translate-y-0' : 'translate-y-full'}`}
      style={{ boxShadow: '0 -4px 20px rgba(0,0,0,0.08)' }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 truncate">{product.marca}</p>
        <p className="text-sm font-black text-gray-900 truncate leading-tight">
          {selectedKit ? selectedKit.nome : product.nome}
        </p>
      </div>
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="text-right">
          <p className="text-[10px] text-gray-400 leading-none">por</p>
          <p className="text-base font-black leading-tight" style={{ color: corPrincipal }}>{fmtCurrency(precoAtual)}</p>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={!temEstoqueAtual}
          className="py-3 px-5 text-sm font-black text-white rounded-xl disabled:opacity-40 active:scale-95 transition-all flex items-center gap-1.5"
          style={{ background: `linear-gradient(135deg, ${corPrincipal}, ${corPrincipal}dd)` }}
        >
          <ShoppingCart className="w-4 h-4" strokeWidth={2.5} />
          {temEstoqueAtual ? 'Comprar' : 'Indisponível'}
        </button>
      </div>
    </div>
    </>
  );
}
