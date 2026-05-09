'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

const slides = [
  {
    id: 1,
    badge: 'Suplementos com Procedência',
    title: 'Qualidade e Tecnologia\npara sua Rotina',
    subtitle: 'Formulações exclusivas, insumos selecionados e embalagem lacrada. Complemente sua alimentação com confiança.',
    cta: { label: 'Ver Produtos', href: '#produtos' },
    ctaSecondary: { label: 'Conheça a Metalab', href: '#qualidade' },
    bg: 'linear-gradient(135deg, #1a0533 0%, #2d1654 50%, #1e3a5f 100%)',
    accent: '#c084fc',
    dot: '#a855f7',
    badges: ['✓ Embalagem Lacrada', '✓ Formulação Exclusiva', '✓ Sem Indicação Terapêutica'],
    decoration: { circle1: '#a855f7', circle2: '#3b82f6' },
  },
  {
    id: 2,
    badge: 'Maior Economia',
    title: 'Kits com até 30%\nde Desconto',
    subtitle: 'Compre o Kit 2 ou Kit 3 e economize mais. Todos os produtos lacrados, com nota fiscal e procedência garantida.',
    cta: { label: 'Ver Kits', href: '#produtos' },
    ctaSecondary: { label: 'Comparar Preços', href: '#produtos' },
    bg: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e3a5f 100%)',
    accent: '#a5b4fc',
    dot: '#6366f1',
    badges: ['✓ Kit 2 = 10% OFF', '✓ Kit 3 = 30% OFF', '✓ Frete Econômico'],
    decoration: { circle1: '#6366f1', circle2: '#0ea5e9' },
  },
  {
    id: 3,
    badge: '⭐ 4.9 / 5 de Satisfação',
    title: 'Mais de 12.400\nClientes Satisfeitos',
    subtitle: '97% de avaliações positivas. Clientes de todo o Brasil confiam na Metalab para complementar a rotina alimentar.',
    cta: { label: 'Ver Avaliações', href: '/avaliacoes' },
    ctaSecondary: { label: 'Explorar Produtos', href: '#produtos' },
    bg: 'linear-gradient(135deg, #0c1a35 0%, #1e3a5f 50%, #1a2744 100%)',
    accent: '#7dd3fc',
    dot: '#0ea5e9',
    badges: ['⭐ 4.9 / 5 média', '✓ 51.000+ pedidos', '✓ 97% positivas'],
    decoration: { circle1: '#0ea5e9', circle2: '#a855f7' },
  },
  {
    id: 4,
    badge: 'Confiança & Segurança',
    title: 'Produto Lacrado,\nProcedência Garantida',
    subtitle: 'Cada produto sai lacrado de fábrica, com rótulo completo e nota fiscal. Compre com total segurança.',
    cta: { label: 'Ver Catálogo', href: '#produtos' },
    ctaSecondary: { label: 'Saiba Mais', href: '#qualidade' },
    bg: 'linear-gradient(135deg, #1a0533 0%, #4a1272 50%, #2d1654 100%)',
    accent: '#e879f9',
    dot: '#c026d3',
    badges: ['✓ Lacre Original', '✓ BPF Certificado', '✓ Nota Fiscal'],
    decoration: { circle1: '#c026d3', circle2: '#7c3aed' },
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

function RightPanel({ id, accent, transitioning }: { id: number; accent: string; transitioning: boolean }) {
  const style = {
    opacity: transitioning ? 0 : 1,
    transform: transitioning ? 'translateX(24px)' : 'translateX(0)',
    transition: 'opacity 0.5s ease 0.15s, transform 0.5s ease 0.15s',
  };

  if (id === 1) return (
    <div style={style} className="flex flex-col gap-4">
      <Card className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
          <span className="text-2xl">⭐</span>
        </div>
        <div>
          <p className="text-3xl font-black text-white">4.9<span className="text-lg text-white/50">/5</span></p>
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
          <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-bold">MC</div>
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

  // id === 4
  return (
    <div style={style} className="grid grid-cols-2 gap-4">
      {[
        { icon: '🔒', title: 'Lacre Original', desc: 'Embalagem lacrada de fábrica' },
        { icon: '📋', title: 'BPF Certificado', desc: 'Boas Práticas de Fabricação' },
        { icon: '🧾', title: 'Nota Fiscal', desc: 'Compra 100% documentada' },
        { icon: '✅', title: 'Procedência', desc: 'Insumos com rastreabilidade' },
      ].map(({ icon, title, desc }) => (
        <Card key={title} className="flex flex-col gap-2">
          <span className="text-2xl">{icon}</span>
          <p className="text-white font-bold text-sm">{title}</p>
          <p className="text-white/50 text-xs leading-snug">{desc}</p>
        </Card>
      ))}
    </div>
  );
}

export default function BannerCarousel() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((index: number) => {
    if (transitioning) return;
    setTransitioning(true);
    setCurrent(index);
    setTimeout(() => setTransitioning(false), 600);
  }, [transitioning]);

  const prev = useCallback(() => goTo((current - 1 + slides.length) % slides.length), [current, goTo]);
  const next = useCallback(() => goTo((current + 1) % slides.length), [current, goTo]);

  useEffect(() => {
    if (paused) return;
    intervalRef.current = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 5500);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [paused]);

  const slide = slides[current];

  return (
    <section
      className="relative overflow-hidden transition-[background] duration-700"
      style={{ background: slide.bg, height: '88vh', minHeight: '600px' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* Coluna esquerda — texto */}
            <div className="flex flex-col gap-5">

              {/* Badge */}
              <div
                className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 self-start transition-opacity duration-500"
                style={{ opacity: transitioning ? 0 : 1 }}
              >
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: slide.dot }} />
                <span className="text-sm text-white/90 font-medium">{slide.badge}</span>
              </div>

              {/* Título */}
              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight transition-all duration-500"
                style={{ opacity: transitioning ? 0 : 1, transform: transitioning ? 'translateY(12px)' : 'translateY(0)' }}
              >
                {slide.title.split('\n').map((line, i) => (
                  <span key={i}>
                    {i === 1 ? <span style={{ color: slide.accent }}>{line}</span> : line}
                    {i === 0 && <br />}
                  </span>
                ))}
              </h1>

              {/* Subtexto */}
              <p
                className="text-base sm:text-lg text-white/70 leading-relaxed transition-all duration-500 delay-75"
                style={{ opacity: transitioning ? 0 : 1, transform: transitioning ? 'translateY(8px)' : 'translateY(0)' }}
              >
                {slide.subtitle}
              </p>

              {/* CTAs */}
              <div
                className="flex flex-row flex-wrap gap-4 transition-all duration-500 delay-100"
                style={{ opacity: transitioning ? 0 : 1, transform: transitioning ? 'translateY(6px)' : 'translateY(0)' }}
              >
                <a href={slide.cta.href}
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-xl font-bold text-white text-sm transition-all duration-200 hover:scale-105 hover:shadow-2xl whitespace-nowrap"
                  style={{ background: 'linear-gradient(135deg, #6b21a8, #7c3aed)' }}
                >
                  {slide.cta.label}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
                <a href={slide.ctaSecondary.href}
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-xl font-bold text-white text-sm border border-white/30 hover:bg-white/10 transition-all duration-200 whitespace-nowrap"
                >
                  {slide.ctaSecondary.label}
                </a>
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
              <RightPanel id={slide.id} accent={slide.accent} transitioning={transitioning} />
            </div>
          </div>
        </div>
      </div>

      {/* Seta esquerda */}
      <button onClick={prev} aria-label="Slide anterior"
        className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/25 transition-all duration-200 hover:scale-110 z-10"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Seta direita */}
      <button onClick={next} aria-label="Próximo slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/25 transition-all duration-200 hover:scale-110 z-10"
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
          key={`${current}-${paused}`}
          className="h-full rounded-full"
          style={{ backgroundColor: slide.dot, animation: paused ? 'none' : 'progress 5.5s linear forwards' }}
        />
      </div>

      <style>{`@keyframes progress { from { width: 0% } to { width: 100% } }`}</style>
    </section>
  );
}
