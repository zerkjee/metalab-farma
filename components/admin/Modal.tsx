'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export default function Modal({ open, onClose, title, children, maxWidth = 'max-w-lg' }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-navy-900/48 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div role="dialog" aria-modal="true" aria-label={title}
        className={`relative w-full ${maxWidth} rounded-2xl border border-line bg-surface-card shadow-md overflow-hidden`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-line">
          <h2 className="text-navy font-display text-base">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-ink-muted hover:text-navy hover:bg-surface-sunken transition-all"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
