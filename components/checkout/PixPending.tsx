'use client';

import { CheckCircle2, Clock, Copy, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { RealOrder } from '@/types/checkout';
import { fmtCurrency } from '@/utils/formatters';

const PIX_EXPIRY_SECONDS = 30 * 60;

interface PixPendingProps {
  order: RealOrder;
  onConfirmed: () => void;
}

export default function PixPending({ order, onConfirmed }: PixPendingProps) {
  const [copied, setCopied] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(PIX_EXPIRY_SECONDS);
  const [expired, setExpired] = useState(false);
  const [checkingManual, setCheckingManual] = useState(false);
  const [manualResult, setManualResult] = useState<'not_paid' | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const confirmedRef = useRef(false);

  const checkStatus = useCallback(async () => {
    if (confirmedRef.current) return false;
    try {
      const res = await fetch(`/api/pagamento/status/${order.id}`);
      if (!res.ok) return false;
      const data: { pago: boolean } = await res.json();
      if (data.pago && !confirmedRef.current) {
        confirmedRef.current = true;
        clearInterval(pollingRef.current!);
        clearInterval(timerRef.current!);
        onConfirmed();
        return true;
      }
    } catch {
      // ignore network errors — keep polling
    }
    return false;
  }, [order.id, onConfirmed]);

  // Automatic polling every 5s
  useEffect(() => {
    pollingRef.current = setInterval(() => { void checkStatus(); }, 5000);
    return () => clearInterval(pollingRef.current!);
  }, [checkStatus]);

  // Countdown timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current!);
          setExpired(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, []);

  async function handleCheckNow() {
    if (checkingManual || confirmedRef.current) return;
    setCheckingManual(true);
    setManualResult(null);
    const paid = await checkStatus();
    if (!paid) setManualResult('not_paid');
    setCheckingManual(false);
  }

  function copyPix() {
    if (!order.pixQrCode) return;
    navigator.clipboard.writeText(order.pixQrCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }).catch(() => {});
  }

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const urgente = secondsLeft < 300 && !expired;

  return (
    <div className="mx-auto max-w-2xl space-y-4">

      {/* Status header — NUNCA mostra "compra finalizada" */}
      <div className="rounded-3xl border border-warning/25 bg-warning-subtle p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-card text-warning shadow-sm">
          <Clock className="h-8 w-8" strokeWidth={1.8} />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-warning">
          Pedido {order.numero}
        </p>
        <h1 className="mt-2 font-display text-2xl font-semibold text-navy">
          Aguardando pagamento PIX
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink-secondary">
          Seu pedido foi criado, mas o pagamento{' '}
          <strong>ainda não foi confirmado</strong>. Pague o PIX abaixo para concluir a compra.
        </p>
      </div>

      {/* PIX QR code — só exibe se não expirou */}
      {!expired ? (
        <div className="rounded-3xl border border-line bg-surface-card p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <p className="font-display font-semibold text-navy">Pague com PIX</p>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                urgente ? 'bg-danger-subtle text-danger' : 'bg-brand-subtle text-brand-700'
              }`}
            >
              {expired
                ? 'Expirado'
                : `Expira em ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`}
            </span>
          </div>

          {order.pixQrCodeBase64 && (
            <div className="mb-4 flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`data:image/png;base64,${order.pixQrCodeBase64}`}
                alt="QR Code PIX"
                width={208}
                height={208}
                className="rounded-xl border border-line bg-surface-card p-2"
              />
            </div>
          )}

          {order.pixQrCode && (
            <div className="mb-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                PIX Copia e Cola
              </p>
              <div className="flex items-center gap-2 rounded-xl border border-line bg-surface-sunken px-3 py-3">
                <p className="min-w-0 flex-1 truncate font-mono text-xs text-ink-secondary">
                  {order.pixQrCode}
                </p>
                <button
                  type="button"
                  onClick={copyPix}
                  className="shrink-0 rounded-full bg-navy p-1.5 text-on-navy transition-all hover:bg-navy-hover"
                  aria-label="Copiar código PIX"
                >
                  <Copy className="h-4 w-4" strokeWidth={1.8} />
                </button>
              </div>
              {copied && (
                <p className="mt-2 text-center text-xs font-semibold text-success">
                  Código copiado!
                </p>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={handleCheckNow}
            disabled={checkingManual}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-navy px-5 py-3 text-sm font-bold text-navy transition-all hover:bg-navy/5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${checkingManual ? 'animate-spin' : ''}`} strokeWidth={2} />
            {checkingManual ? 'Verificando...' : 'Já paguei — confirmar'}
          </button>

          {manualResult === 'not_paid' && (
            <p className="mt-3 text-center text-xs text-warning">
              Pagamento ainda não identificado. Aguarde alguns segundos e tente novamente.
            </p>
          )}

          <p className="mt-4 text-center text-xs text-ink-muted">
            Confirmação automática a cada 5 segundos. Não feche esta página.
          </p>
        </div>
      ) : (
        <div className="rounded-3xl border border-danger/20 bg-danger-subtle p-6 text-center">
          <p className="font-display font-semibold text-navy">Código PIX expirado</p>
          <p className="mt-2 text-sm leading-6 text-ink-secondary">
            O código PIX expirou. Acesse <em>Meus pedidos</em> para gerar um novo código de pagamento.
          </p>
          <Link
            href="/pedidos"
            className="mt-4 inline-flex items-center justify-center rounded-full bg-navy px-5 py-3 text-sm font-bold text-on-navy transition-all hover:bg-navy-hover"
          >
            Ir para Meus pedidos
          </Link>
        </div>
      )}

      {/* Resumo do pedido */}
      <div className="rounded-2xl border border-line bg-surface-sunken p-4 text-sm text-ink-secondary">
        <div className="flex justify-between">
          <span className="font-semibold text-ink">Total</span>
          <span className="font-display font-semibold text-navy">{fmtCurrency(order.total)}</span>
        </div>
        <div className="mt-1 flex justify-between">
          <span className="font-semibold text-ink">Cliente</span>
          <span>{order.customer.fullName}</span>
        </div>
        <div className="mt-1 flex justify-between">
          <span className="font-semibold text-ink">Entrega</span>
          <span>{order.shipping.label}</span>
        </div>
      </div>

      <div className="rounded-2xl border border-brand/20 bg-brand-subtle px-4 py-3">
        <div className="flex items-start gap-2">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" strokeWidth={2} />
          <p className="text-xs leading-5 text-brand-700">
            Seu pedido ficará reservado por <strong>30 minutos</strong>. Após esse prazo, o estoque
            é liberado automaticamente se o pagamento não for confirmado.
          </p>
        </div>
      </div>
    </div>
  );
}
