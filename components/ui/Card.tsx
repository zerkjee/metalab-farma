import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  padding?: string;
  style?: React.CSSProperties;
}

export function Card({ children, padding = 'var(--space-6)', style }: CardProps) {
  return (
    <div
      style={{
        background: 'var(--surface-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-sm)',
        padding,
        boxSizing: 'border-box',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export default Card;
