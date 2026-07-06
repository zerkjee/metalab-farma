'use client';

import { useEffect, useRef, useState } from 'react';

interface Stat {
  value: number;
  suffix: string;
  prefix?: string;
  label: string;
  sublabel?: string;
}

function CountUp({ target, suffix, prefix = '' }: { target: number; suffix: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1800;
          const steps = 60;
          const increment = target / steps;
          let current = 0;
          timer = setInterval(() => {
            current = Math.min(current + increment, target);
            setCount(Math.floor(current));
            if (current >= target && timer) clearInterval(timer);
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => {
      observer.disconnect();
      if (timer) clearInterval(timer);
    };
  }, [target]);

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString('pt-BR')}{suffix}
    </span>
  );
}

const stats: Stat[] = [
  {
    value: 12400,
    suffix: '+',
    label: 'Clientes satisfeitos',
    sublabel: 'em todo o Brasil',
  },
  {
    value: 51000,
    suffix: '+',
    label: 'Pedidos enviados',
    sublabel: 'com rastreio garantido',
  },
  {
    value: 97,
    suffix: '%',
    label: 'Avaliações positivas',
    sublabel: 'média geral dos produtos',
  },
  {
    value: 9,
    suffix: '/5',
    prefix: '4.',
    label: 'Satisfação média',
    sublabel: 'nota dos clientes',
  },
];

export default function StatsSection() {
  return (
    <section className="py-20 bg-navy">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-14">
          <p className="text-xs font-bold text-brand uppercase tracking-[0.2em] mb-4">Nossos Números</p>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-on-navy tracking-tight">
            Confiança comprovada em dados
          </h2>
          <p className="mt-4 text-on-navy/60 max-w-xl mx-auto text-sm leading-relaxed">
            Resultados concretos de quem escolhe qualidade e procedência na suplementação alimentar.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-navy-400 rounded-lg overflow-hidden border border-navy-400">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="flex flex-col items-center justify-center text-center px-6 py-10 bg-navy hover:bg-navy-600 transition-colors duration-300"
            >
              <p className="font-display text-4xl sm:text-5xl font-semibold text-on-navy leading-none mb-2 tracking-tight">
                {stat.suffix === '/5' ? (
                  <span>
                    {stat.prefix}<CountUp target={stat.value} suffix="" />
                    <span className="text-2xl text-on-navy/50 font-semibold">/5</span>
                  </span>
                ) : (
                  <CountUp target={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
                )}
              </p>
              <p className="text-sm font-semibold text-brand mt-1">{stat.label}</p>
              {stat.sublabel && (
                <p className="text-xs text-on-navy/40 mt-0.5">{stat.sublabel}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
