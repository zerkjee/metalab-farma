import React from 'react';

export type BadgeVariant = 'brand' | 'navy' | 'gold' | 'success' | 'neutral';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
}

const variants: Record<BadgeVariant, React.CSSProperties> = {
  brand: { background: 'var(--brand-subtle)', color: 'var(--blue-700)' },
  navy: { background: 'var(--navy-50)', color: 'var(--navy-600)' },
  gold: { background: 'var(--gold-50)', color: 'var(--gold-600)' },
  success: { background: 'var(--success-50)', color: 'var(--success-600)' },
  neutral: { background: 'var(--neutral-100)', color: 'var(--neutral-700)' },
};

export function Badge({ children, variant = 'brand' }: BadgeProps) {
  const v = variants[variant] || variants.brand;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        font: 'var(--text-label-sm)',
        letterSpacing: 'var(--letter-spacing-wide)',
        textTransform: 'uppercase',
        padding: '4px 10px',
        borderRadius: 'var(--radius-full)',
        ...v,
      }}
    >
      {children}
    </span>
  );
}

export default Badge;
