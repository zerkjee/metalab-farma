'use client';

import { useState } from 'react';
import { getReviewsByProduct, getSummaryByProduct } from '@/data/reviews';
import RatingDistribution from './RatingDistribution';
import ReviewCard from './ReviewCard';

interface ProductReviewsProps {
  productId: number;
  color?: string;
}

type FilterRating = 'all' | 5 | 4 | 3 | 2 | 1;
type SortKey = 'recent' | 'helpful' | 'highest' | 'lowest';

export default function ProductReviews({ productId, color = '#6b21a8' }: ProductReviewsProps) {
  const allReviews = getReviewsByProduct(productId);
  const summary = getSummaryByProduct(productId);

  const [filter, setFilter] = useState<FilterRating>('all');
  const [sort, setSort] = useState<SortKey>('recent');
  const [visible, setVisible] = useState(4);

  const filtered = allReviews
    .filter((r) => filter === 'all' || r.rating === filter)
    .sort((a, b) => {
      if (sort === 'recent') return b.date.localeCompare(a.date);
      if (sort === 'helpful') return b.helpfulCount - a.helpfulCount;
      if (sort === 'highest') return b.rating - a.rating;
      return a.rating - b.rating;
    });

  const displayed = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;

  const filterLabels: { value: FilterRating; label: string }[] = [
    { value: 'all', label: 'Todas' },
    { value: 5, label: '5 ★' },
    { value: 4, label: '4 ★' },
    { value: 3, label: '3 ★' },
    { value: 2, label: '2 ★' },
    { value: 1, label: '1 ★' },
  ];

  return (
    <section className="py-16 border-t border-gray-100 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color }}>
            O que dizem nossos clientes
          </p>
          <h2 className="text-3xl font-black text-gray-900">Avaliações do Produto</h2>
        </div>

        {/* Summary */}
        {summary && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 mb-8 shadow-sm">
            <RatingDistribution summary={summary} color={color} />
          </div>
        )}

        {/* Filters + Sort */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
          {/* Rating filter */}
          <div className="flex flex-wrap gap-2">
            {filterLabels.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => { setFilter(value); setVisible(4); }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all duration-200 ${
                  filter === value
                    ? 'text-white border-transparent'
                    : 'text-gray-600 border-gray-200 bg-white hover:border-[#6b21a8] hover:text-[#6b21a8]'
                }`}
                style={filter === value ? { backgroundColor: color, borderColor: color } : {}}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="text-xs font-medium text-gray-600 border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:border-transparent"
            style={{ '--tw-ring-color': color } as React.CSSProperties}
          >
            <option value="recent">Mais recentes</option>
            <option value="helpful">Mais úteis</option>
            <option value="highest">Maior nota</option>
            <option value="lowest">Menor nota</option>
          </select>
        </div>

        {/* Review cards or empty state */}
        {displayed.length > 0 ? (
          <>
            <div className="flex flex-col gap-4">
              {displayed.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>

            {hasMore && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => setVisible((n) => n + 4)}
                  className="px-8 py-3 rounded-xl border-2 font-bold text-sm transition-all duration-200 hover:bg-gray-100"
                  style={{ borderColor: color, color }}
                >
                  Ver mais avaliações
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="font-medium">Nenhuma avaliação para este filtro</p>
          </div>
        )}

        {/* Write review CTA */}
        <div className="mt-10 p-6 bg-white rounded-2xl border border-gray-100 text-center shadow-sm">
          <p className="font-bold text-gray-900 mb-1">Já comprou este produto?</p>
          <p className="text-sm text-gray-500 mb-4">Sua opinião ajuda outros clientes a escolher melhor.</p>
          <button
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:opacity-90 active:scale-95"
            style={{ backgroundColor: color }}
          >
            Escrever avaliação
          </button>
        </div>
      </div>
    </section>
  );
}
