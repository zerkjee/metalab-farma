'use client';

import React from 'react';

export interface TabItem {
  value: string;
  label: string;
}

export interface TabsProps {
  tabs: TabItem[];
  value: string;
  onChange?: (value: string) => void;
}

export function Tabs({ tabs = [], value, onChange }: TabsProps) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 4,
        borderBottom: '1px solid var(--border-subtle)',
        fontFamily: 'var(--font-body)',
      }}
    >
      {tabs.map((t) => {
        const active = t.value === value;
        return (
          <button
            key={t.value}
            onClick={() => onChange && onChange(t.value)}
            style={{
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              padding: '10px 4px',
              marginRight: 20,
              font: active ? 'var(--text-heading-sm)' : 'var(--text-body-md)',
              color: active ? 'var(--text-primary)' : 'var(--text-muted)',
              borderBottom: `2px solid ${active ? 'var(--brand-solid)' : 'transparent'}`,
              transition: 'var(--transition-fast)',
            }}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;
