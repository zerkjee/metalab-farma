'use client';

import Image from 'next/image';
import { useEffect, useState, useCallback } from 'react';
import { purchaseNotifications } from '@/data/reviews';
import { PurchaseNotif } from '@/types/review';

export default function PurchaseNotification() {
  const [notif, setNotif] = useState<PurchaseNotif | null>(null);
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(0);

  const show = useCallback(() => {
    const next = purchaseNotifications[index % purchaseNotifications.length];
    setNotif(next);
    setVisible(true);
    setIndex((i) => i + 1);

    const hideTimer = setTimeout(() => setVisible(false), 5000);
    return hideTimer;
  }, [index]);

  useEffect(() => {
    const firstTimer = setTimeout(() => {
      const hideTimer = show();
      return () => clearTimeout(hideTimer);
    }, 4000);

    return () => clearTimeout(firstTimer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!visible && notif) {
      const nextTimer = setTimeout(() => {
        const hideTimer = show();
        return () => clearTimeout(hideTimer);
      }, 8000);
      return () => clearTimeout(nextTimer);
    }
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!notif) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-6 left-6 z-50 transition-all duration-500"
      style={{
        transform: visible ? 'translateX(0) translateY(0)' : 'translateX(-110%)',
        opacity: visible ? 1 : 0,
      }}
    >
      <div className="flex items-center gap-3 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 max-w-xs w-full">
        {/* Product image or color dot */}
        <div
          className="w-12 h-12 rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center bg-gray-50"
          style={{ border: `2px solid ${notif.productColor}20` }}
        >
          {notif.productImage ? (
            <Image src={notif.productImage} alt={notif.productName} width={48} height={48} className="w-full h-full object-contain p-1" />
          ) : (
            <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: notif.productColor }} />
          )}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
            <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wide">Compra recente</span>
          </div>
          <p className="text-xs font-bold text-gray-900 truncate">
            Alguém de <span style={{ color: notif.productColor }}>{notif.customerCity}</span>
          </p>
          <p className="text-xs text-gray-500 truncate">
            comprou <span className="font-semibold text-gray-700">{notif.productName}</span>
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">{notif.timeAgo}</p>
        </div>

        {/* Close */}
        <button
          onClick={() => setVisible(false)}
          aria-label="Fechar notificação"
          className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-gray-300 hover:text-gray-500 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
