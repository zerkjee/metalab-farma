'use client';

import React from 'react';

export interface SwitchProps {
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  label?: string;
}

export function Switch({ checked, onChange, disabled = false, label }: SwitchProps) {
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
          width: 40,
          height: 24,
          borderRadius: 'var(--radius-full)',
          background: checked ? 'var(--brand-solid)' : 'var(--neutral-300)',
          position: 'relative',
          transition: 'var(--transition-base)',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 3,
            left: checked ? 19 : 3,
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: '#fff',
            boxShadow: 'var(--shadow-sm)',
            transition: 'var(--transition-base)',
          }}
        />
      </span>
      {label && (
        <span style={{ font: 'var(--text-body-md)', color: 'var(--text-primary)' }}>{label}</span>
      )}
    </label>
  );
}

export default Switch;
