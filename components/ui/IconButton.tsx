'use client';

import React from 'react';

export type IconButtonSize = 'sm' | 'md' | 'lg';
export type IconButtonVariant = 'ghost' | 'subtle' | 'solid';

export interface IconButtonProps {
  children: React.ReactNode;
  size?: IconButtonSize;
  variant?: IconButtonVariant;
  disabled?: boolean;
  onClick?: () => void;
  'aria-label': string;
}

const sizes: Record<IconButtonSize, number> = { sm: 32, md: 40, lg: 48 };

export function IconButton({
  children,
  size = 'md',
  variant = 'ghost',
  disabled = false,
  onClick,
  'aria-label': ariaLabel,
}: IconButtonProps) {
  const [hover, setHover] = React.useState(false);
  const dim = sizes[size] || sizes.md;
  const bgIdle =
    variant === 'solid'
      ? 'var(--brand-solid)'
      : variant === 'subtle'
        ? 'var(--brand-subtle)'
        : 'transparent';
  const bgHover =
    variant === 'solid'
      ? 'var(--brand-solid-hover)'
      : variant === 'subtle'
        ? 'var(--brand-subtle-hover)'
        : 'var(--neutral-50)';
  const color = variant === 'solid' ? 'var(--text-on-brand)' : 'var(--text-primary)';
  return (
    <button
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: dim,
        height: dim,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'var(--radius-full)',
        border: 'none',
        background: hover && !disabled ? bgHover : bgIdle,
        color,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        transition: 'var(--transition-fast)',
      }}
    >
      {children}
    </button>
  );
}

export default IconButton;
