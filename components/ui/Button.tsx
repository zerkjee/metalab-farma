'use client';

import React from 'react';

export type ButtonVariant = 'primary' | 'navy' | 'secondary' | 'ghost' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  children: React.ReactNode;
  /** Visual treatment. Primary = brand blue solid CTA. */
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  style?: React.CSSProperties;
}

const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
  sm: { padding: '8px 16px', font: 'var(--text-label-md)', height: 36 },
  md: { padding: '11px 22px', font: 'var(--text-label-md)', height: 44 },
  lg: { padding: '15px 28px', font: 'var(--text-heading-sm)', height: 52 },
};

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background: 'var(--brand-solid)',
    color: 'var(--text-on-brand)',
    border: '1px solid transparent',
  },
  navy: {
    background: 'var(--navy-solid)',
    color: 'var(--text-on-navy)',
    border: '1px solid transparent',
  },
  secondary: {
    background: 'var(--brand-subtle)',
    color: 'var(--blue-700)',
    border: '1px solid transparent',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-primary)',
    border: '1px solid transparent',
  },
  outline: {
    background: 'transparent',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-default)',
  },
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  type = 'button',
  style,
}: ButtonProps) {
  const v = variantStyles[variant] || variantStyles.primary;
  const s = sizeStyles[size] || sizeStyles.md;
  const [hover, setHover] = React.useState(false);
  const [active, setActive] = React.useState(false);

  let background = v.background;
  if (!disabled && hover) {
    if (variant === 'primary') background = 'var(--brand-solid-hover)';
    else if (variant === 'navy') background = 'var(--navy-solid-hover)';
    else if (variant === 'secondary') background = 'var(--brand-subtle-hover)';
    else if (variant === 'ghost') background = 'var(--neutral-50)';
    else if (variant === 'outline') background = 'var(--neutral-50)';
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false);
        setActive(false);
      }}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderRadius: 'var(--radius-full)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'var(--transition-fast)',
        transform: active && !disabled ? 'scale(0.97)' : 'scale(1)',
        opacity: disabled ? 0.45 : 1,
        whiteSpace: 'nowrap',
        ...s,
        ...v,
        background,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export default Button;
