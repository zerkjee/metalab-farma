'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { nextIndex } from '@/lib/carousel';

const slides = [
  {
    src: '/banners/inovitann-clinical-promo-1.jpg',
    alt: 'Linha Inovitann Clinical — fórmulas de qualidade, padrão farmacêutico',
    href: '#inovitann',
    label: 'Ver linha Inovitann Clinical',
  },
  {
    src: '/banners/flebogenol.jpg',
    alt: 'Flebogenol — suplemento alimentar em comprimido, disponível em 30 e 60 comprimidos',
    href: '/produtos/flebogenol-30-comprimidos',
    label: 'Conheça o Flebogenol',
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

  return (
    <section
      className="relative w-full aspect-[1718/916] overflow-hidden bg-white"
      onPointerEnter={(e) => { if (e.pointerType === 'mouse') setPaused(true); }}
      onPointerLeave={(e) => { if (e.pointerType === 'mouse') setPaused(false); }}
    >
      {slides.map((slide, i) => (
        <Link
          key={slide.src}
          href={slide.href}
          aria-label={slide.label}
          className="block absolute inset-0 transition-opacity duration-1000 ease-in-out"
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
        </Link>
      ))}

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
