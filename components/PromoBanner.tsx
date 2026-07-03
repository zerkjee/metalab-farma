'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { nextIndex, prevIndex } from '@/lib/carousel';

const slides = [
  {
    src: '/banners/inovitann-clinical-promo-1.jpg',
    alt: 'Linha Inovitann Clinical — fórmulas de qualidade, padrão farmacêutico',
    href: '#inovitann',
    label: 'Ver linha Inovitann Clinical',
    // Imagem tem exatamente o mesmo aspect ratio da section (1718×916), então
    // sempre preenche 100% do banner — mas mantemos a caixa por consistência
    // e pra continuar funcionando caso a imagem seja trocada por outra proporção.
    nativeAspect: '1718/916',
    // Botão de verdade (não faz parte da imagem), ancorado por % no ponto
    // central da faixa branca abaixo dos selinhos "Fórmulas de qualidade" etc.,
    // pra acompanhar a imagem em qualquer tamanho de banner/dispositivo.
    cta: { text: 'Venha conhecer', anchor: { left: '50%', top: '95.5%' } },
    buttonRect: null as { left: string; top: string; width: string; height: string } | null,
  },
  {
    src: '/banners/flebogenol.jpg',
    alt: 'Flebogenol — suplemento alimentar em comprimido, disponível em 30 e 60 comprimidos',
    href: '/produtos/flebogenol-30-comprimidos',
    label: 'Conheça o Flebogenol',
    // A imagem já tem um botão "Conheça o produto" desenhado nela — só essa área
    // fica clicável, não o banner inteiro. Retângulo em % da imagem original
    // (1600×685), pra ficar alinhado em qualquer tamanho de tela.
    nativeAspect: '1600/685',
    cta: null as { text: string; anchor: { left: string; top: string } } | null,
    buttonRect: { left: '3.5%', top: '70%', width: '25%', height: '18%' },
  },
];

export default function PromoBanner() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = setTimeout(() => setCurrent((c) => nextIndex(c, slides.length)), 5000);
    return () => clearTimeout(timer);
  }, [current, paused]);

  const goPrev = () => setCurrent((c) => prevIndex(c, slides.length));
  const goNext = () => setCurrent((c) => nextIndex(c, slides.length));

  return (
    <section
      className="relative w-full aspect-[1718/916] overflow-hidden bg-white"
      onPointerEnter={(e) => { if (e.pointerType === 'mouse') setPaused(true); }}
      onPointerLeave={(e) => { if (e.pointerType === 'mouse') setPaused(false); }}
    >
      {slides.map((slide, i) => (
        <div
          key={slide.src}
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          style={{ opacity: i === current ? 1 : 0, pointerEvents: i === current ? 'auto' : 'none' }}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            priority={i === 0}
            sizes="100vw"
            className="object-contain"
          />
          {/* Caixa invisível do mesmo tamanho/posição que a imagem renderizada
              (equivalente ao object-contain, mas como elemento de verdade) —
              o CTA é posicionado em % dentro dela, então acompanha a imagem
              em qualquer tamanho de banner/dispositivo. */}
          <div
            className="absolute inset-0 m-auto"
            style={{
              aspectRatio: slide.nativeAspect ?? undefined,
              maxWidth: '100%',
              maxHeight: '100%',
            }}
          >
            {slide.cta ? (
              <Link
                href={slide.href}
                aria-label={slide.label}
                className="absolute -translate-x-1/2 -translate-y-1/2 inline-flex items-center whitespace-nowrap rounded-full text-white font-black shadow-lg transition-transform duration-200 hover:scale-105"
                style={{
                  left: slide.cta.anchor.left,
                  top: slide.cta.anchor.top,
                  background: 'linear-gradient(135deg, #0f2756, #1e50a8)',
                  boxShadow: '0 8px 24px rgba(15,39,86,0.35)',
                  // Tamanho em vw/clamp (não em breakpoints fixos) pra manter a mesma
                  // proporção em relação à imagem (que preenche 100% da largura da
                  // viewport) em qualquer tamanho de tela — em telas pequenas um botão
                  // dimensionado só por breakpoint Tailwind ficava alto demais e invadia
                  // a fileira de selos (Padrão Farmacêutico etc.) desenhada na imagem.
                  fontSize: 'clamp(9px, 1.6vw, 24px)',
                  padding: 'clamp(4px, 1vw, 16px) clamp(14px, 2.6vw, 40px)',
                  gap: 'clamp(3px, 0.6vw, 10px)',
                  lineHeight: 1.15,
                }}
              >
                {slide.cta.text}
                <svg
                  style={{ width: 'clamp(10px, 1.5vw, 24px)', height: 'clamp(10px, 1.5vw, 24px)' }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ) : slide.buttonRect ? (
              <Link
                href={slide.href}
                aria-label={slide.label}
                className="absolute"
                style={slide.buttonRect}
              />
            ) : null}
          </div>
        </div>
      ))}

      {slides.length > 1 && (
        <>
          <button
            onClick={goPrev}
            aria-label="Slide anterior"
            className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/80 border border-[#0f2756]/15 shadow-md flex items-center justify-center text-[#0f2756] hover:bg-white hover:scale-110 transition-all duration-200 z-10"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goNext}
            aria-label="Próximo slide"
            className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/80 border border-[#0f2756]/15 shadow-md flex items-center justify-center text-[#0f2756] hover:bg-white hover:scale-110 transition-all duration-200 z-10"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-10">
          {slides.map((s, i) => (
            <button
              key={s.src}
              onClick={() => setCurrent(i)}
              aria-label={`Ir para banner ${i + 1}`}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === current ? '24px' : '8px',
                height: '8px',
                backgroundColor: i === current ? '#0f2756' : 'rgba(15,39,86,0.3)',
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
