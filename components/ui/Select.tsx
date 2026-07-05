'use client';

import React from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  label?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options?: SelectOption[];
  disabled?: boolean;
}

export function Select({ label, value, onChange, options = [], disabled = false }: SelectProps) {
  const [focus, setFocus] = React.useState(false);
  return (
    <label
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        fontFamily: 'var(--font-body)',
        width: '100%',
      }}
    >
      {label && (
        <span style={{ font: 'var(--text-label-md)', color: 'var(--text-primary)' }}>{label}</span>
      )}
      <select
        value={value}
        disabled={disabled}
        onChange={onChange}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          font: 'var(--text-body-md)',
          color: 'var(--text-primary)',
          background: disabled ? 'var(--neutral-50)' : 'var(--surface-card)',
          border: `1px solid ${focus ? 'var(--border-brand)' : 'var(--border-default)'}`,
          borderRadius: 'var(--radius-md)',
          padding: '11px 14px',
          outline: 'none',
          boxShadow: focus ? 'var(--shadow-focus)' : 'none',
          transition: 'var(--transition-fast)',
          boxSizing: 'border-box',
          appearance: 'none',
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23323C64' stroke-width='1.6' fill='none' stroke-linecap='round'/%3E%3C/svg%3E\")",
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 14px center',
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default Select;
