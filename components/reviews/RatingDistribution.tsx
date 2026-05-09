'use client';

import { RatingSummary } from '@/types/review';
import StarRating from './StarRating';

interface RatingDistributionProps {
  summary: RatingSummary;
  color?: string;
}

export default function RatingDistribution({ summary, color = '#6b21a8' }: RatingDistributionProps) {
  const total = summary.totalReviews;

  const bars = ([5, 4, 3, 2, 1] as const).map((star) => ({
    star,
    count: summary.distribution[star],
    pct: total > 0 ? Math.round((summary.distribution[star] / total) * 100) : 0,
  }));

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8">
      {/* Big number */}
      <div className="flex flex-col items-center gap-1 flex-shrink-0">
        <span className="text-6xl font-black text-gray-900 leading-none">
          {summary.averageRating.toFixed(1)}
        </span>
        <StarRating rating={summary.averageRating} size="md" />
        <span className="text-sm text-gray-500 mt-1">{total.toLocaleString('pt-BR')} avaliações</span>
      </div>

      {/* Bars */}
      <div className="flex flex-col gap-1.5 w-full max-w-xs">
        {bars.map(({ star, count, pct }) => (
          <div key={star} className="flex items-center gap-2.5">
            <span className="text-xs font-medium text-gray-500 w-4 text-right">{star}</span>
            <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="#f59e0b">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                stroke="#f59e0b" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, backgroundColor: color }}
              />
            </div>
            <span className="text-xs text-gray-400 w-8 text-right">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
