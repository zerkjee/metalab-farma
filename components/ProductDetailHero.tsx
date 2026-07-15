'use client';

import Image from 'next/image';
import { useRef, useEffect, useState } from 'react';
import { ShoppingCart, Shield, Lock, Truck } from 'lucide-react';
import { Product } from '@/types/product';
import { useCart } from '@/context/CartContext';
import { fmtCurrency } from '@/utils/formatters';
import { calculateVolumePrice } from '@/lib/volume-pricing';

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

  const [selectedQty, setSelectedQty] = useState<1 | 2 | 3>(1);

  const selectedPrice = calculateVolumePrice(preco, selectedQty);
  const descPct = selectedPrice.discountPercent;
  const precoAtual = selectedPrice.unitPrice;
  const precoOriginalAtual = descPct > 0 ? preco : precoOriginal;
  const temEstoqueAtual = product.estoque > 0;

  function handleAddToCart() {
    addItem(product, selectedQty);
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
    <section className="py-10 md:py-14 bg-surface-card border-b border-line">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-start">

          {/* Imagem */}
          <div className="relative flex items-center justify-center" style={{ minHeight: 380 }}>
            {product.imagemUrl ? (
              <Image
                src={product.imagemUrl}
                alt={product.nome}
                width={480}
                height={480}
                className="w-full object-contain max-h-[420px] p-6"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
                placeholder="blur"
                blurDataURL={`data:image/svg+xml;base64,${btoa(
                  `<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'><rect width='8' height='8' fill='${corPrincipal}' opacity='0.15'/></svg>`
                )}`}
                style={{ filter: `drop-shadow(0 12px 36px ${corPrincipal}30)` }}
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
                <span className="text-sm font-medium text-ink-muted">Imagem em breve</span>
              </div>
            )}

            {/* Badge desconto na imagem */}
            {descontoBase > 0 && descPct === 0 && (
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
              <span className="text-xs text-ink-muted font-medium">Suplemento Alimentar</span>
            </div>

            {/* Nome */}
            <div>
              <h1 className="font-display text-3xl sm:text-4xl font-black text-navy leading-tight mb-2">
                {product.nome}
              </h1>
              <p className="text-ink-secondary text-base leading-relaxed">
                {subtitulo}
              </p>
            </div>

            {/* Preço */}
            <div className="flex items-end gap-3 py-1">
              <div
                data-testid="product-current-price"
                className="font-display text-4xl sm:text-5xl font-black leading-none"
                style={{ color: corPrincipal }}
              >
                {fmtCurrency(precoAtual)}
              </div>
              {precoOriginalAtual && (
                <div className="flex flex-col mb-1">
                  <span className="text-sm text-ink-muted line-through leading-tight">
                    {fmtCurrency(precoOriginalAtual)}
                  </span>
                  <span
                    className="text-xs font-black text-white px-2 py-0.5 rounded-full text-center"
                    style={{ backgroundColor: 'var(--success-500)' }}
                  >
                    -{descPct > 0 ? descPct : descontoBase}% OFF
                  </span>
                </div>
              )}
            </div>

            {/* Estoque — sem expor a quantidade ao cliente (info só do admin) */}
            <div className={`flex items-center gap-1.5 text-sm font-semibold ${temEstoqueAtual ? 'text-success' : 'text-danger'}`}>
              <span className={`w-2 h-2 rounded-full ${temEstoqueAtual ? 'bg-success' : 'bg-danger'}`} />
              {temEstoqueAtual ? 'Em estoque · pronta entrega' : 'Fora de estoque'}
            </div>

            {/* ── Seletor de quantidade ── */}
            <div>
              <p className="text-xs font-bold text-ink-secondary uppercase tracking-wider mb-2.5">
                Quantidade
              </p>
              <div className="grid grid-cols-3 gap-2">
                {([1, 2, 3] as const).map((qty) => {
                  const price = calculateVolumePrice(preco, qty);
                  const pct = price.discountPercent;
                  const isSelected = selectedQty === qty;
                  return (
                    <button
                      key={qty}
                      onClick={() => setSelectedQty(qty)}
                      className={`relative flex flex-col items-center py-3 px-2 rounded-xl border-2 transition-all duration-200 text-center ${
                        isSelected ? '' : 'border-line text-ink-secondary hover:border-line-default'
                      }`}
                      style={
                        isSelected
                          ? { borderColor: corPrincipal, color: corPrincipal, backgroundColor: `${corPrincipal}08` }
                          : {}
                      }
                    >
                      {pct > 0 && (
                        <span
                          className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full text-[9px] font-black text-white whitespace-nowrap"
                          style={{ backgroundColor: 'var(--success-500)' }}
                        >
                          -{pct}% OFF
                        </span>
                      )}
                      <span className="text-xs font-bold leading-tight">
                        {qty === 1 ? '1 unidade' : `${qty} unidades`}
                      </span>
                      <span className="text-sm font-black mt-0.5">{fmtCurrency(price.unitPrice)}</span>
                      <span className="text-[10px] text-ink-muted leading-none">/un</span>
                    </button>
                  );
                })}
              </div>

              {descPct > 0 && (
                <p className="mt-2 text-xs font-bold text-success flex items-center gap-1">
                  <span className="text-success">✓</span>
                  Você economiza{' '}
                  {fmtCurrency(selectedPrice.discountTotal)} levando{' '}
                  {selectedQty} unidades
                </p>
              )}
            </div>

            {/* Trust seals — ACIMA dos botões */}
            <div className="grid grid-cols-3 gap-2 py-1">
              <div className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-surface-sunken border border-line text-center">
                <Shield className="w-4 h-4 text-success" strokeWidth={2} />
                <span className="text-[10px] font-bold text-ink-secondary leading-tight">Lacrado<br/>de fábrica</span>
              </div>
              <div className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-surface-sunken border border-line text-center">
                <Lock className="w-4 h-4 text-brand" strokeWidth={2} />
                <span className="text-[10px] font-bold text-ink-secondary leading-tight">Compra<br/>segura</span>
              </div>
              <div className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-surface-sunken border border-line text-center">
                <Truck className="w-4 h-4 text-navy" strokeWidth={2} />
                <span className="text-[10px] font-bold text-ink-secondary leading-tight">Entrega<br/>garantida</span>
              </div>
            </div>

            {/* Botões */}
            <div ref={botoesRef} className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAddToCart}
                disabled={!temEstoqueAtual}
                className="w-full sm:flex-[2] py-4 px-6 text-base font-black text-white rounded-full transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.97] flex items-center justify-center gap-2"
                style={{
                  background: temEstoqueAtual ? corPrincipal : 'var(--neutral-400)',
                  boxShadow: temEstoqueAtual ? `0 8px 24px ${corPrincipal}40` : undefined,
                }}
              >
                <ShoppingCart className="w-5 h-5" strokeWidth={2.5} />
                {temEstoqueAtual ? 'Adicionar ao Carrinho' : 'Indisponível'}
              </button>
              <button
                onClick={scrollToDescricao}
                className="w-full sm:flex-1 py-4 px-4 text-sm font-bold rounded-full border-2 transition-all duration-200 hover:bg-surface-sunken"
                style={{ borderColor: corPrincipal, color: corPrincipal }}
              >
                Ver Composição
              </button>
            </div>

            {/* Nota legal */}
            <p className="text-xs text-ink-muted border-t border-line pt-3">
              Suplemento alimentar. Não é medicamento. Sem indicação terapêutica.
            </p>
          </div>
        </div>
      </div>
    </section>

    {/* Sticky CTA mobile */}
    <div
      aria-hidden={!stickyCta}
      className={`fixed bottom-0 left-0 right-0 z-[60] bg-surface-card/95 backdrop-blur-md border-t border-line px-4 py-3 flex items-center gap-3 md:hidden transition-transform duration-300 ${stickyCta ? 'translate-y-0' : 'translate-y-full'}`}
      style={{ boxShadow: 'var(--shadow-lg)' }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wide text-ink-muted truncate">{product.marca}</p>
        <p className="text-sm font-black text-navy truncate leading-tight">
          {product.nome}
        </p>
      </div>
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="text-right">
          <p className="text-[10px] text-ink-muted leading-none">por</p>
          <p className="text-base font-black leading-tight" style={{ color: corPrincipal }}>{fmtCurrency(precoAtual)}</p>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={!temEstoqueAtual}
          className="py-3 px-5 text-sm font-black text-white rounded-full disabled:opacity-40 active:scale-95 transition-all flex items-center gap-1.5"
          style={{ background: corPrincipal }}
        >
          <ShoppingCart className="w-4 h-4" strokeWidth={2.5} />
          {temEstoqueAtual ? 'Comprar' : 'Indisponível'}
        </button>
      </div>
    </div>
    </>
  );
}
