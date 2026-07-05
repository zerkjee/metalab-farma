import React from 'react';

export interface TagProps {
  children: React.ReactNode;
  onRemove?: () => void;
}

export function Tag({ children, onRemove }: TagProps) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        font: 'var(--text-body-sm)',
        color: 'var(--text-primary)',
        background: 'var(--neutral-100)',
        border: '1px solid var(--border-subtle)',
        padding: '5px 6px 5px 12px',
        borderRadius: 'var(--radius-full)',
      }}
    >
      {children}
      {onRemove && (
        <button
          onClick={onRemove}
          aria-label="Remover"
          style={{
            width: 18,
            height: 18,
            borderRadius: '50%',
            border: 'none',
            background: 'var(--neutral-200)',
            color: 'var(--text-secondary)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            font: '12px/1 var(--font-body)',
            padding: 0,
          }}
        >
          ×
        </button>
      )}
    </span>
  );
}

export default Tag;
