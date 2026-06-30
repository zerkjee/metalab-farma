'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { nextIndex, prevIndex } from '@/lib/carousel';

const slides = [
  {
    id: 1,
    badge: 'Referência em Suplementação Alimentar',
    title: 'Excelência em Controle\nde Qualidade',
    subtitle: 'Formulações desenvolvidas com rigor técnico, insumos de procedência controlada e embalagem lacrada de fábrica. Confiança em cada etapa.',
    cta: { label: 'Ver Produtos', href: '#produtos' },
    ctaSecondary: { label: 'Conheça a Metalab', href: '#qualidade' },
    bg: 'linear-gradient(135deg, #040d1e 0%, #0f2756 50%, #1a3a72 100%)',
    bgImage: undefined as string | undefined,
    accent: '#60a5fa',
    dot: '#3b82f6',
    badges: ['✓ Embalagem Lacrada', '✓ Formulação Exclusiva', '✓ Sem Indicação Terapêutica'],
    decoration: { circle1: '#3b82f6', circle2: '#0ea5e9' },
  },
  {
    id: 2,
    badge: 'Maior Economia por Kit',
    title: 'Kits com até 30%\nde Desconto',
    subtitle: 'Adquira o Kit 2 ou Kit 3 e maximize o custo-benefício. Todos os produtos lacrados, com nota fiscal e procedência garantida.',
    cta: { label: 'Ver Kits', href: '#produtos' },
    ctaSecondary: { label: 'Comparar Preços', href: '#produtos' },
    bg: 'linear-gradient(135deg, #050c1b 0%, #0d1f45 50%, #0f2756 100%)',
    bgImage: undefined as string | undefined,
    accent: '#93c5fd',
    dot: '#60a5fa',
    badges: ['✓ Kit 2 = 10% OFF', '✓ Kit 3 = 30% OFF', '✓ Frete Econômico'],
    decoration: { circle1: '#60a5fa', circle2: '#0ea5e9' },
  },
  {
    id: 3,
    badge: '4.9 / 5 — Satisfação dos Clientes',
    title: 'Mais de 12.400\nClientes Satisfeitos',
    subtitle: '97% de avaliações positivas. Clientes em todo o Brasil confiam na Metalab para complementar sua rotina alimentar com qualidade.',
    cta: { label: 'Ver Avaliações', href: '/avaliacoes' },
    ctaSecondary: { label: 'Explorar Produtos', href: '#produtos' },
    bg: 'linear-gradient(135deg, #0c1a35 0%, #1e3a5f 50%, #1a2744 100%)',
    bgImage: undefined as string | undefined,
    accent: '#7dd3fc',
    dot: '#38bdf8',
    badges: ['✓ 4.9 / 5 média', '✓ 51.000+ pedidos', '✓ 97% positivas'],
    decoration: { circle1: '#38bdf8', circle2: '#60a5fa' },
  },
  {
    id: 4,
    badge: 'Confiança, Precisão, Procedência',
    title: 'Produto Lacrado,\nProcedência Garantida',
    subtitle: 'Cada produto sai lacrado de fábrica com rótulo completo, nota fiscal e cadeia produtiva rastreável. Qualidade verificável.',
    cta: { label: 'Ver Catálogo', href: '#produtos' },
    ctaSecondary: { label: 'Saiba Mais', href: '#qualidade' },
    bg: 'linear-gradient(135deg, #030a17 0%, #0f2756 50%, #1a3a72 100%)',
    bgImage: undefined as string | undefined,
    accent: '#bfdbfe',
    dot: '#60a5fa',
    badges: ['✓ Lacre Original', '✓ BPF Certificado', '✓ Nota Fiscal'],
    decoration: { circle1: '#60a5fa', circle2: '#0ea5e9' },
  },
  {
    id: 5,
    badge: 'Linha Premium — Inovitann Clinical',
    title: 'A Linha Premium\nda Metalab',
    subtitle: '11 formulações exclusivas com alta biodisponibilidade, desenvolvidas para quem não abre mão do melhor em suplementação alimentar.',
    cta: { label: 'Ver Linha Inovitann', href: '#produtos' },
    ctaSecondary: { label: 'Conheça a Metalab', href: '#qualidade' },
    bg: 'linear-gradient(135deg, #08041a 0%, #130826 50%, #0d1a35 100%)',
    bgImage: undefined as string | undefined,
    accent: '#a78bfa',
    dot: '#7c3aed',
    badges: ['✓ 11 Produtos Exclusivos', '✓ Alta Biodisponibilidade', '✓ Sem Indicação Terapêutica'],
    decoration: { circle1: '#7c3aed', circle2: '#db2777' },
  },
];

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 ${className}`}>
      {children}
    </div>
  );
}

function Star({ filled }: { filled: boolean }) {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill={filled ? '#fbbf24' : 'rgba(255,255,255,0.2)'}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function RightPanel({ id, accent }: { id: number; accent: string }) {
  const style: React.CSSProperties | undefined = undefined;

  if (id === 1) return (
    <div style={style} className="flex flex-col gap-4">
      <Card className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>
        <div>
          <p className="text-3xl font-bold text-white tracking-tight">4.9<span className="text-lg text-white/50">/5</span></p>
          <p className="text-white/60 text-xs mt-0.5">Satisfação dos clientes</p>
          <div className="flex gap-0.5 mt-1">{[1,2,3,4,5].map(i => <Star key={i} filled={i <= 5} />)}</div>
        </div>
      </Card>
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <p className="text-2xl font-black text-white">12.4k+</p>
          <p className="text-white/60 text-xs mt-1">Clientes satisfeitos</p>
        </Card>
        <Card>
          <p className="text-2xl font-black text-white">51k+</p>
          <p className="text-white/60 text-xs mt-1">Pedidos enviados</p>
        </Card>
      </div>
      <Card>
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/70 text-xs font-medium">Avaliações positivas</span>
          <span className="font-black text-white">97%</span>
        </div>
        <div className="w-full h-2 bg-white/10 rounded-full">
          <div className="h-full rounded-full" style={{ width: '97%', backgroundColor: accent }} />
        </div>
      </Card>
    </div>
  );

  if (id === 2) return (
    <div style={style} className="flex flex-col gap-3">
      <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-1">Compare e economize</p>
      {[
        { label: 'Produto Avulso', desc: '1 unidade', saving: null, highlight: false },
        { label: 'Kit 2', desc: '2 unidades', saving: '10% OFF', highlight: false },
        { label: 'Kit 3', desc: '3 unidades', saving: '30% OFF', highlight: true },
      ].map(({ label, desc, saving, highlight }) => (
        <div
          key={label}
          className={`flex items-center justify-between rounded-2xl px-5 py-4 border transition-all ${
            highlight
              ? 'border-white/40 bg-white/20'
              : 'border-white/10 bg-white/5'
          }`}
        >
          <div>
            <p className={`font-bold text-sm ${highlight ? 'text-white' : 'text-white/70'}`}>{label}</p>
            <p className="text-white/40 text-xs">{desc}</p>
          </div>
          {saving ? (
            <span
              className="px-3 py-1 rounded-full text-xs font-black"
              style={{ backgroundColor: accent + '30', color: accent }}
            >
              {saving}
            </span>
          ) : (
            <span className="text-white/30 text-xs">—</span>
          )}
        </div>
      ))}
      <p className="text-white/30 text-[10px] text-center mt-1">Todos lacrados · Com nota fiscal</p>
    </div>
  );

  if (id === 3) return (
    <div style={style} className="flex flex-col gap-4">
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-[#0f2756] flex items-center justify-center text-white text-xs font-bold">MC</div>
          <div>
            <p className="text-white text-sm font-bold">Mariana Costa</p>
            <p className="text-white/40 text-xs">São Paulo, SP</p>
          </div>
          <span className="ml-auto text-[10px] font-bold text-emerald-400 flex items-center gap-1">
            ✓ Verificada
          </span>
        </div>
        <div className="flex gap-0.5 mb-2">{[1,2,3,4,5].map(i => <Star key={i} filled={i <= 5} />)}</div>
        <p className="text-white/70 text-xs leading-relaxed line-clamp-3">
          &ldquo;Produto excelente, embalagem impecável. Chegou lacrado dentro do prazo. Estou usando como complemento alimentar há 3 semanas.&rdquo;
        </p>
      </Card>
      <div className="grid grid-cols-3 gap-3">
        {[
          { v: '4.9★', l: 'Média' },
          { v: '97%', l: 'Positivas' },
          { v: '124', l: 'Avaliações' },
        ].map(({ v, l }) => (
          <Card key={l} className="text-center !p-3">
            <p className="text-lg font-black text-white">{v}</p>
            <p className="text-white/50 text-[10px]">{l}</p>
          </Card>
        ))}
      </div>
    </div>
  );

  if (id === 5) {
    const inovProducts = [
      { src: '/products/inovitann/1.png',  color: '#7c3aed' },
      { src: '/products/inovitann/2.png',  color: '#1d6fa8' },
      { src: '/products/inovitann/3.png',  color: '#3d7a38' },
      { src: '/products/inovitann/4.png',  color: '#8c1f2e' },
      { src: '/products/inovitann/5.png',  color: '#9c2779' },
      { src: '/products/inovitann/6.png',  color: '#2d7d6a' },
      { src: '/products/inovitann/7.png',  color: '#1e3a8a' },
      { src: '/products/inovitann/8.png',  color: '#c2540a' },
      { src: '/products/inovitann/9.png',  color: '#db2777' },
      { src: '/products/inovitann/10.png', color: '#16a34a' },
      { src: '/products/inovitann/11.png', color: '#d97706' },
    ];
    return (
      <div className="flex flex-col gap-3">
        <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em]">11 produtos · Inovitann Clinical</p>
        <div className="grid grid-cols-4 gap-2">
          {inovProducts.map((p, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <div
              key={i}
              className="rounded-xl bg-white p-1.5 aspect-square flex items-center justify-center overflow-hidden"
              style={{ boxShadow: `0 0 0 1px ${p.color}50, 0 4px 16px ${p.color}25` }}
            >
              <img src={p.src} alt="" aria-hidden className="w-full h-full object-contain" />
            </div>
          ))}
          <div
            className="rounded-xl aspect-square flex flex-col items-center justify-center gap-1 border"
            style={{ borderColor: `${accent}40`, background: `${accent}12` }}
          >
            <span className="text-lg font-black" style={{ color: accent }}>11</span>
            <span className="text-white/50 text-[9px] font-semibold uppercase tracking-wide leading-tight text-center">produtos<br/>premium</span>
          </div>
        </div>
      </div>
    );
  }

  // id === 4
  const trustItems = [
    {
      svg: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
      title: 'Lacre Original',
      desc: 'Embalagem lacrada de fábrica',
    },
    {
      svg: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
      title: 'BPF Certificado',
      desc: 'Boas Práticas de Fabricação',
    },
    {
      svg: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
      title: 'Nota Fiscal',
      desc: 'Compra 100% documentada',
    },
    {
      svg: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
      title: 'Procedência',
      desc: 'Insumos com rastreabilidade',
    },
  ];
  return (
    <div style={style} className="grid grid-cols-2 gap-4">
      {trustItems.map(({ svg, title, desc }) => (
        <Card key={title} className="flex flex-col gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-white/80">
            {svg}
          </div>
          <p className="text-white font-bold text-sm tracking-tight">{title}</p>
          <p className="text-white/50 text-xs leading-snug">{desc}</p>
        </Card>
      ))}
    </div>
  );
}

export default function BannerCarousel() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  // Sem fade-out manual: o conteudo do slide e remontado por `key={current}`
  // e entra com UMA unica animacao CSS (bannerIn). Assim o slide novo nasce
  // invisivel e aparece de uma vez — nada de "pisca, some e volta".
  const goTo = useCallback((index: number) => setCurrent(index), []);
  const prev = useCallback(() => setCurrent((c) => prevIndex(c, slides.length)), []);
  const next = useCallback(() => setCurrent((c) => nextIndex(c, slides.length)), []);

  // Swipe no mobile: arrastar o dedo troca o slide.
  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) > 40) { if (dx < 0) next(); else prev(); }
  };

  // Autoplay: timer auto-resetavel por slide — toda troca (auto ou manual)
  // reinicia a contagem, entao nunca colide pra avancar duas vezes.
  useEffect(() => {
    if (paused) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = setTimeout(() => setCurrent((c) => nextIndex(c, slides.length)), 5500);
    return () => clearTimeout(timer);
  }, [current, paused]);

  const slide = slides[current];

  return (
    <section
      className="relative overflow-hidden transition-[background] duration-700 h-[62vh] min-h-[380px] sm:h-[75vh] sm:min-h-[500px] lg:h-[88vh] lg:min-h-[600px]"
      style={{ background: slide.bgImage ? '#040d1e' : slide.bg }}
      onPointerEnter={(e) => { if (e.pointerType === 'mouse') setPaused(true); }}
      onPointerLeave={(e) => { if (e.pointerType === 'mouse') setPaused(false); }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Imagem de fundo (apenas em slides com bgImage) */}
      {slide.bgImage && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={slide.bgImage}
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0" style={{ background: slide.bg }} />
        </>
      )}

      {/* Grid decorativo */}
      <div className="absolute inset-0 opacity-[0.06]"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}
      />

      {/* Círculos de fundo */}
      <div className="absolute top-20 right-10 w-96 h-96 rounded-full opacity-10 pointer-events-none transition-all duration-700"
        style={{ background: `radial-gradient(circle, ${slide.decoration.circle1}, transparent)` }} />
      <div className="absolute bottom-10 left-10 w-72 h-72 rounded-full opacity-10 pointer-events-none transition-all duration-700"
        style={{ background: `radial-gradient(circle, ${slide.decoration.circle2}, transparent)` }} />

      {/* Layout principal — 2 colunas */}
      <div className="absolute inset-0 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-10">
          <div key={current} className="banner-slide-in grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* Coluna esquerda — texto */}
            <div className="flex flex-col gap-5">

              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 self-start">
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: slide.dot }} />
                <span className="text-sm text-white/90 font-medium">{slide.badge}</span>
              </div>

              {/* Título */}
              <h1
                className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-white leading-tight"
              >
                {slide.title.split('\n').map((line, i) => (
                  <span key={i}>
                    {i === 1 ? <span style={{ color: slide.accent }}>{line}</span> : line}
                    {i === 0 && <br />}
                  </span>
                ))}
              </h1>

              {/* Subtexto */}
              <p className="text-base sm:text-lg text-white/70 leading-relaxed">
                {slide.subtitle}
              </p>

              {/* CTAs */}
              <div className="flex flex-row flex-wrap gap-4">
                <Link href={slide.cta.href}
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-xl font-bold text-white text-sm transition-all duration-200 hover:scale-105 hover:shadow-2xl whitespace-nowrap"
                  style={{ background: 'linear-gradient(135deg, #0f2756, #1e50a8)' }}
                >
                  {slide.cta.label}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link href={slide.ctaSecondary.href}
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-xl font-bold text-white text-sm border border-white/30 hover:bg-white/10 transition-all duration-200 whitespace-nowrap"
                >
                  {slide.ctaSecondary.label}
                </Link>
              </div>

              {/* Mini badges */}
              <div className="flex flex-wrap gap-4">
                {slide.badges.map((b) => (
                  <div key={b} className="flex items-center gap-1.5 text-white/70 text-xs">
                    <span className="font-bold" style={{ color: slide.accent }}>{b.split(' ')[0]}</span>
                    <span>{b.split(' ').slice(1).join(' ')}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Coluna direita — visual único por slide */}
            <div className="hidden lg:block">
              <RightPanel id={slide.id} accent={slide.accent} />
            </div>
          </div>
        </div>
      </div>

      {/* Seta esquerda — escondida no mobile (la usa-se o swipe) */}
      <button onClick={prev} aria-label="Slide anterior"
        className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 border border-white/20 hidden sm:flex items-center justify-center text-white hover:bg-white/25 transition-all duration-200 hover:scale-110 z-10"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Seta direita — escondida no mobile (la usa-se o swipe) */}
      <button onClick={next} aria-label="Próximo slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 border border-white/20 hidden sm:flex items-center justify-center text-white hover:bg-white/25 transition-all duration-200 hover:scale-110 z-10"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-10">
        {slides.map((s, i) => (
          <button key={s.id} onClick={() => goTo(i)} aria-label={`Ir para slide ${i + 1}`}
            className="rounded-full transition-all duration-300"
            style={{ width: i === current ? '28px' : '8px', height: '8px', backgroundColor: i === current ? slide.dot : 'rgba(255,255,255,0.35)' }}
          />
        ))}
      </div>

      {/* Barra de progresso */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/10">
        <div
          key={current}
          className="h-full rounded-full"
          style={{ backgroundColor: slide.dot, animation: 'progress 5.5s linear forwards', animationPlayState: paused ? 'paused' : 'running' }}
        />
      </div>

      <style>{`
        @keyframes progress { from { width: 0% } to { width: 100% } }
        @keyframes bannerIn { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: translateY(0) } }
        .banner-slide-in { animation: bannerIn 0.45s ease both }
        @media (prefers-reduced-motion: reduce) { .banner-slide-in { animation: none } }
      `}</style>
    </section>
  );
}
