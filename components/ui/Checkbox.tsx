'use client';

import React from 'react';

export interface CheckboxProps {
  label?: string;
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

export function Checkbox({ label, checked, onChange, disabled = false }: CheckboxProps) {
  return (
    <label
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        fontFamily: 'var(--font-body)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        style={{ display: 'none' }}
      />
      <span
        style={{
          width: 20,
          height: 20,
          borderRadius: 'var(--radius-sm)',
          border: `1.5px solid ${checked ? 'var(--brand-solid)' : 'var(--border-default)'}`,
          background: checked ? 'var(--brand-solid)' : 'var(--surface-card)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'var(--transition-fast)',
          flexShrink: 0,
        }}
      >
        {checked && (
          <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
            <path
              d="M1 5l3.5 3.5L11 1"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      {label && (
        <span style={{ font: 'var(--text-body-md)', color: 'var(--text-primary)' }}>{label}</span>
      )}
    </label>
  );
}

export default Checkbox;
