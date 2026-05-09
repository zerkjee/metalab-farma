'use client';

import { useEffect, useRef, useState } from 'react';

interface Stat {
  value: number;
  suffix: string;
  prefix?: string;
  label: string;
  icon: React.ReactNode;
  color: string;
}

function CountUp({ target, suffix, prefix = '' }: { target: number; suffix: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1800;
          const steps = 60;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current = Math.min(current + increment, target);
            setCount(Math.floor(current));
            if (current >= target) clearInterval(timer);
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
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
    color: '#6b21a8',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    value: 51000,
    suffix: '+',
    label: 'Pedidos enviados',
    color: '#1d4ed8',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
    ),
  },
  {
    value: 97,
    suffix: '%',
    label: 'Avaliações positivas',
    color: '#059669',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  {
    value: 9,
    suffix: '/5',
    prefix: '4.',
    label: 'Satisfação média',
    color: '#f59e0b',
    icon: (
      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
];

export default function StatsSection() {
  return (
    <section className="py-20 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-[#6b21a8] uppercase tracking-widest mb-2">Nossos Números</p>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900">
            Confiança comprovada em dados
          </h2>
          <p className="mt-3 text-gray-500 max-w-xl mx-auto">
            Mais de uma década fornecendo suplementos alimentares com qualidade e procedência para clientes em todo o Brasil.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="relative p-8 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col items-center text-center gap-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 group"
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform duration-300"
                style={{ backgroundColor: stat.color }}
              >
                {stat.icon}
              </div>
              <div>
                <p className="text-4xl font-black text-gray-900 leading-none">
                  {stat.suffix === '/5' ? (
                    <span>
                      {stat.prefix}<CountUp target={stat.value} suffix="" />
                      <span className="text-2xl text-gray-400 font-semibold">/5</span>
                    </span>
                  ) : (
                    <CountUp target={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
                  )}
                </p>
                <p className="text-sm text-gray-500 font-medium mt-1">{stat.label}</p>
              </div>
              <div
                className="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ backgroundColor: stat.color }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
