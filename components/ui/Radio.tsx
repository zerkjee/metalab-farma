'use client';

import React from 'react';

export interface RadioProps {
  label?: string;
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  name?: string;
}

export function Radio({ label, checked, onChange, disabled = false, name }: RadioProps) {
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
        type="radio"
        name={name}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        style={{ display: 'none' }}
      />
      <span
        style={{
          width: 20,
          height: 20,
          borderRadius: '50%',
          border: `1.5px solid ${checked ? 'var(--brand-solid)' : 'var(--border-default)'}`,
          background: 'var(--surface-card)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'var(--transition-fast)',
          flexShrink: 0,
        }}
      >
        {checked && (
          <span
            style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--brand-solid)' }}
          />
        )}
      </span>
      {label && (
        <span style={{ font: 'var(--text-body-md)', color: 'var(--text-primary)' }}>{label}</span>
      )}
    </label>
  );
}

export default Radio;
