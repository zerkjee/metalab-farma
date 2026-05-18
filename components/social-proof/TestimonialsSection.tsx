'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { getFeaturedReviews } from '@/data/reviews';
import StarRating from '@/components/reviews/StarRating';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
}

export default function TestimonialsSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const featured = getFeaturedReviews();

  function scroll(dir: 'left' | 'right') {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -360 : 360, behavior: 'smooth' });
  }

  return (
    <section className="py-20 bg-[#f5f3ff] border-b border-purple-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-sm font-semibold text-[#6b21a8] uppercase tracking-widest mb-2">Prova Social</p>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900">
              Clientes que amam a Metalab
            </h2>
            <p className="mt-2 text-gray-500">
              Avaliações reais de quem já experimentou nossos suplementos
            </p>
          </div>

          {/* Nav arrows */}
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => scroll('left')}
              className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:text-[#6b21a8] hover:border-[#6b21a8] transition-all duration-200 shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:text-[#6b21a8] hover:border-[#6b21a8] transition-all duration-200 shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable row */}
        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto pb-4 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {featured.map((review) => (
            <div
              key={review.id}
              className="flex-shrink-0 w-80 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 flex flex-col gap-4"
            >
              {/* Stars + verified */}
              <div className="flex items-center justify-between">
                <StarRating rating={review.rating} size="sm" />
                {review.verified && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Verificada
                  </span>
                )}
              </div>

              {/* Quote */}
              <p className="text-gray-700 text-sm leading-relaxed line-clamp-4 flex-1">
                &ldquo;{review.comment}&rdquo;
              </p>

              {/* Product badge */}
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white self-start"
                style={{ backgroundColor: review.productColor }}
              >
                {review.productName}
              </div>

              {/* Customer */}
              <div className="flex items-center gap-3 pt-3 border-t border-gray-50">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ backgroundColor: review.avatarColor }}
                >
                  {review.customerInitials}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{review.customerName}</p>
                  <p className="text-xs text-gray-400">{review.customerCity} · {formatDate(review.date)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Link to full reviews page */}
        <div className="mt-10 text-center">
          <Link
            href="/avaliacoes"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#6b21a8] hover:underline underline-offset-4 transition-all"
          >
            Ver todas as avaliações
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
