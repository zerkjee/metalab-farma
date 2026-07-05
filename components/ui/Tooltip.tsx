'use client';

import React from 'react';

export type TooltipPosition = 'top' | 'bottom';

export interface TooltipProps {
  children: React.ReactNode;
  label: string;
  position?: TooltipPosition;
}

export function Tooltip({ children, label, position = 'top' }: TooltipProps) {
  const [show, setShow] = React.useState(false);
  const posStyle: React.CSSProperties =
    {
      top: { bottom: '120%', left: '50%', transform: 'translateX(-50%)' },
      bottom: { top: '120%', left: '50%', transform: 'translateX(-50%)' },
    }[position] || {};
  return (
    <span
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <span
          style={{
            position: 'absolute',
            ...posStyle,
            background: 'var(--navy-500)',
            color: '#fff',
            font: 'var(--text-caption)',
            padding: '6px 10px',
            borderRadius: 'var(--radius-sm)',
            whiteSpace: 'nowrap',
            boxShadow: 'var(--shadow-sm)',
            zIndex: 10,
          }}
        >
          {label}
        </span>
      )}
    </span>
  );
}

export default Tooltip;
