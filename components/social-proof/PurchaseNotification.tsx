'use client';

import { useEffect, useRef, useState } from 'react';
import { purchaseNotifications } from '@/data/reviews';
import { PurchaseNotif } from '@/types/review';
import ProductImage from '@/components/ProductImage';

export default function PurchaseNotification() {
  const [notif, setNotif] = useState<PurchaseNotif | null>(null);
  const [visible, setVisible] = useState(false);
  const indexRef = useRef(0);

  // useRef evita stale closure: show nunca precisa de deps de estado
  const show = useRef(() => {
    const next = purchaseNotifications[indexRef.current % purchaseNotifications.length];
    indexRef.current++;
    setNotif(next);
    setVisible(true);
    return setTimeout(() => setVisible(false), 5000);
  });

  useEffect(() => {
    const firstTimer = setTimeout(() => {
      const hideTimer = show.current();
      return () => clearTimeout(hideTimer);
    }, 4000);
    return () => clearTimeout(firstTimer);
  }, []);

  useEffect(() => {
    if (!visible && notif) {
      const nextTimer = setTimeout(() => {
        const hideTimer = show.current();
        return () => clearTimeout(hideTimer);
      }, 8000);
      return () => clearTimeout(nextTimer);
    }
  }, [visible, notif]);

  if (!notif) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-6 left-4 z-[55] transition-all duration-300"
      style={{
        transform: visible ? 'translateX(0) translateY(0)' : 'translateX(-110%)',
        opacity: visible ? 1 : 0,
      }}
    >
      <div className="flex items-center gap-3 bg-surface-card rounded-lg shadow-lg border border-line p-4 max-w-xs w-full">
        {/* Product image or color dot */}
        <div
          className="w-12 h-12 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center bg-surface-sunken p-1"
          style={{ border: `2px solid ${notif.productColor}20` }}
        >
          {notif.productImage ? (
            <ProductImage src={notif.productImage} alt={notif.productName} sizes="48px" frameClassName="h-full w-full" />
          ) : (
            <div className="w-8 h-8 rounded-md" style={{ backgroundColor: notif.productColor }} />
          )}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-0.5">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse flex-shrink-0" />
            <span className="text-[10px] font-semibold text-success uppercase tracking-wide">Compra recente</span>
          </div>
          <p className="text-xs font-bold text-navy truncate">
            Alguém de <span style={{ color: notif.productColor }}>{notif.customerCity}</span>
          </p>
          <p className="text-xs text-ink-secondary truncate">
            comprou <span className="font-semibold text-ink">{notif.productName}</span>
          </p>
          <p className="text-[10px] text-ink-muted mt-0.5">{notif.timeAgo}</p>
        </div>

        {/* Close */}
        <button
          onClick={() => setVisible(false)}
          aria-label="Fechar notificação"
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-ink-muted hover:text-ink-secondary transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
