'use client';

import React from 'react';

export type ToastVariant = 'success' | 'danger' | 'info';

export interface ToastProps {
  children: React.ReactNode;
  variant?: ToastVariant;
  onClose?: () => void;
}

const variants: Record<ToastVariant, { bg: string; fg: string }> = {
  success: { bg: 'var(--success-50)', fg: 'var(--success-600)' },
  danger: { bg: 'var(--danger-50)', fg: 'var(--danger-600)' },
  info: { bg: 'var(--blue-50)', fg: 'var(--blue-700)' },
};

export function Toast({ children, variant = 'info', onClose }: ToastProps) {
  const v = variants[variant] || variants.info;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        background: 'var(--surface-card)',
        color: 'var(--text-primary)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border-subtle)',
        padding: '14px 16px',
        font: 'var(--text-body-sm)',
        minWidth: 260,
      }}
    >
      <span
        style={{ width: 8, height: 8, borderRadius: '50%', background: v.fg, flexShrink: 0 }}
      />
      <span style={{ flex: 1 }}>{children}</span>
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Fechar"
          style={{
            border: 'none',
            background: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            font: '16px/1 var(--font-body)',
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}

export default Toast;
