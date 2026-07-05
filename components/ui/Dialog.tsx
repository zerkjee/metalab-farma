'use client';

import React from 'react';

export interface DialogProps {
  open: boolean;
  onClose?: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Dialog({ open, onClose, title, children, footer }: DialogProps) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--surface-overlay)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--surface-card)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-lg)',
          padding: 'var(--space-8)',
          width: 400,
          maxWidth: '90vw',
          fontFamily: 'var(--font-body)',
          boxSizing: 'border-box',
        }}
      >
        {title && (
          <div
            style={{
              font: 'var(--text-heading-lg)',
              color: 'var(--text-primary)',
              marginBottom: 12,
            }}
          >
            {title}
          </div>
        )}
        <div style={{ font: 'var(--text-body-md)', color: 'var(--text-secondary)' }}>{children}</div>
        {footer && (
          <div style={{ marginTop: 24, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dialog;
