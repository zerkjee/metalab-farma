'use client';

interface StarRatingProps {
  rating: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showValue?: boolean;
  color?: string;
}

const sizes = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-7 h-7',
};

export default function StarRating({ rating, size = 'sm', showValue = false, color = '#f59e0b' }: StarRatingProps) {
  const stars = Array.from({ length: 5 }, (_, i) => {
    const filled = rating >= i + 1;
    const half = !filled && rating >= i + 0.5;
    return { filled, half };
  });

  return (
    <span className="inline-flex items-center gap-0.5">
      {stars.map((s, i) => (
        <svg key={i} className={sizes[size]} viewBox="0 0 24 24" fill="none">
          {s.filled ? (
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              fill={color} stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
          ) : s.half ? (
            <>
              <defs>
                <linearGradient id={`half-${i}`} x1="0" x2="100%" y1="0" y2="0">
                  <stop offset="50%" stopColor={color} />
                  <stop offset="50%" stopColor="transparent" />
                </linearGradient>
              </defs>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                fill={`url(#half-${i})`} stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
            </>
          ) : (
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              fill="transparent" stroke="#d1d5db" strokeWidth="1.5" strokeLinejoin="round" />
          )}
        </svg>
      ))}
      {showValue && (
        <span className="ml-1 text-sm font-bold text-gray-700">{rating.toFixed(1)}</span>
      )}
    </span>
  );
}
