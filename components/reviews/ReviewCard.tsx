'use client';

import { useState } from 'react';
import { Review } from '@/types/review';
import StarRating from './StarRating';

interface ReviewCardProps {
  review: Review;
  compact?: boolean;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

export default function ReviewCard({ review, compact = false }: ReviewCardProps) {
  const [helpful, setHelpful] = useState(review.helpfulCount);
  const [voted, setVoted] = useState(false);

  function handleHelpful() {
    if (!voted) {
      setHelpful((n) => n + 1);
      setVoted(true);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col gap-4 hover:shadow-md transition-shadow duration-300">
      {/* Header: avatar + info */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm"
            style={{ backgroundColor: review.avatarColor }}
          >
            {review.customerInitials}
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">{review.customerName}</p>
            <p className="text-xs text-gray-400">{review.customerCity}, {review.customerState}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <StarRating rating={review.rating} size="sm" />
          <span className="text-xs text-gray-400">{formatDate(review.date)}</span>
        </div>
      </div>

      {/* Verified badge */}
      {review.verified && (
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Compra verificada
          </span>
        </div>
      )}

      {/* Title */}
      <div>
        <h4 className="font-bold text-gray-900 text-sm mb-1">{review.title}</h4>
        <p className={`text-gray-600 text-sm leading-relaxed ${compact ? 'line-clamp-3' : ''}`}>
          {review.comment}
        </p>
      </div>

      {/* Photos (optional) */}
      {review.photos && review.photos.length > 0 && (
        <div className="flex gap-2">
          {review.photos.map((photo, i) => (
            <div key={i} className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden">
              <img src={photo} alt="Foto da avaliação" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}

      {/* Footer: helpful */}
      <div className="flex items-center gap-3 pt-2 border-t border-gray-50">
        <span className="text-xs text-gray-400">Útil para você?</span>
        <button
          onClick={handleHelpful}
          disabled={voted}
          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-all duration-200 ${
            voted
              ? 'bg-[#6b21a8] border-[#6b21a8] text-white'
              : 'border-gray-200 text-gray-600 hover:border-[#6b21a8] hover:text-[#6b21a8]'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill={voted ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
          </svg>
          Sim ({helpful})
        </button>
        <span className="text-xs text-gray-300">{review.totalVotes} votos</span>
      </div>
    </div>
  );
}
