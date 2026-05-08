export const PRODUCT_ICONS: Record<string, React.ReactNode> = {
  vitaminas: (
    <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
      <rect x="22" y="8" width="36" height="60" rx="8" stroke="currentColor" strokeWidth="2"/>
      <rect x="30" y="4" width="20" height="10" rx="4" fill="currentColor" opacity="0.25"/>
      <line x1="28" y1="34" x2="52" y2="34" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/>
      <line x1="28" y1="42" x2="52" y2="42" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/>
      <line x1="28" y1="50" x2="44" y2="50" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/>
    </svg>
  ),
  omegas: (
    <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
      <ellipse cx="40" cy="44" rx="20" ry="30" stroke="currentColor" strokeWidth="2"/>
      <ellipse cx="40" cy="44" rx="11" ry="22" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
      <circle cx="40" cy="44" r="5" fill="currentColor" opacity="0.25"/>
      <path d="M28 22 Q40 12 52 22" stroke="currentColor" strokeWidth="1.5" opacity="0.4" fill="none"/>
    </svg>
  ),
  minerais: (
    <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
      <rect x="16" y="26" width="48" height="46" rx="8" stroke="currentColor" strokeWidth="2"/>
      <path d="M28 26V18a12 12 0 0124 0v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="40" cy="50" r="10" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/>
      <circle cx="40" cy="50" r="4" fill="currentColor" opacity="0.25"/>
    </svg>
  ),
  proteinas: (
    <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
      <path d="M28 72V38C28 22 52 22 52 38v34" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M20 52h40" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/>
      <path d="M22 62h36" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/>
      <circle cx="40" cy="24" r="12" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),
  complexos: (
    <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
      <rect x="14" y="30" width="52" height="44" rx="8" stroke="currentColor" strokeWidth="2"/>
      <path d="M26 30V22a14 14 0 0128 0v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="26" y1="50" x2="54" y2="50" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/>
      <line x1="26" y1="60" x2="54" y2="60" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/>
      <circle cx="40" cy="42" r="6" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/>
    </svg>
  ),
  adaptogenos: (
    <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
      <path d="M40 10C28 10 18 20 18 32c0 8 4 14 10 18l-4 16h32l-4-16c6-4 10-10 10-18 0-12-10-22-22-22z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      <path d="M32 50c2-4 4-8 8-10 4 2 6 6 8 10" stroke="currentColor" strokeWidth="1.5" opacity="0.5" fill="none"/>
    </svg>
  ),
}
