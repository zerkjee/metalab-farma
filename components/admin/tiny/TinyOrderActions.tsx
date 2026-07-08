import { RefreshCw, Send } from 'lucide-react'
import TinyStatusBadge from './TinyStatusBadge'
import type { AdminOrderDetail } from '@/utils/adminOrders'

type TinyOrderActionsProps = {
  order: AdminOrderDetail
  sending: boolean
  message: string | null
  onSend: () => void
}

function splitErrors(value: string | null): string[] {
  if (!value) return []
  return value
    .split(/\.\s+/)
    .map((item) => item.trim().replace(/\.$/, ''))
    .filter(Boolean)
}

function messageIsError(value: string | null): boolean {
  if (!value) return false
  return value.startsWith('Erro') || value.includes('não') || value.includes('sem') || value.includes('inválido')
}

export default function TinyOrderActions({ order, sending, message, onSend }: TinyOrderActionsProps) {
  const paidOrder = order.status !== 'aguardando_pagamento' && order.status !== 'cancelado'
  const alreadySent = Boolean(order.tinyPedidoId) || order.tinySyncStatus === 'TINY_ORDER_CREATED' || order.tinySyncStatus === 'ENVIADO'
  const isSending = sending || order.tinySyncStatus === 'SENDING_TO_TINY' || order.tinySyncStatus === 'PROCESSANDO'
  const canSend = paidOrder && !alreadySent && !isSending
  const errors = splitErrors(order.tinyErro)
  const showRetryCopy = order.tinySyncStatus === 'VALIDATION_ERROR' || order.tinySyncStatus === 'SYNC_ERROR' || order.tinySyncStatus === 'ERRO'

  return (
    <div className="space-y-3">
      <div className="rounded-xl bg-surface-sunken p-3">
        <p className="text-xs text-ink-muted">Status Tiny</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <TinyStatusBadge status={isSending ? 'SENDING_TO_TINY' : order.tinySyncStatus} />
          {alreadySent && (
            <span className="text-xs text-ink-muted">
              Pedido Tiny: {order.tinyNumero || order.tinyPedidoId}
            </span>
          )}
        </div>
        {!paidOrder && (
          <p className="mt-2 text-xs text-ink-muted">
            Este pedido ainda não está pago. O envio para o Tiny será liberado após confirmação do pagamento.
          </p>
        )}
        {order.tinyNumero && !alreadySent && (
          <p className="mt-1.5 text-xs text-ink-muted">Nº Tiny: {order.tinyNumero}</p>
        )}
      </div>

      {errors.length > 0 && (
        <div className="rounded-xl border border-danger/30 bg-danger-subtle px-3 py-2 text-xs font-semibold text-danger">
          <p>{order.tinySyncStatus === 'VALIDATION_ERROR' ? 'Erro de validação' : 'Erro de sincronização'}</p>
          <ul className="mt-1 space-y-1">
            {errors.map((error) => <li key={error}>- {error}.</li>)}
          </ul>
        </div>
      )}

      {canSend && (
        <button
          onClick={onSend}
          disabled={isSending}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-brand px-3 py-2.5 text-xs font-semibold text-on-brand transition-all hover:bg-brand-hover disabled:opacity-50"
        >
          {showRetryCopy ? (
            <RefreshCw className={`h-3.5 w-3.5 ${isSending ? 'animate-spin' : ''}`} strokeWidth={1.8} />
          ) : (
            <Send className={`h-3.5 w-3.5 ${isSending ? 'animate-pulse' : ''}`} strokeWidth={1.8} />
          )}
          {isSending ? 'Enviando...' : showRetryCopy ? 'Revalidar / Tentar novamente' : 'Enviar para Tiny'}
        </button>
      )}

      {message && (
        <p className={`rounded-xl px-3 py-2 text-xs font-semibold ${
          messageIsError(message)
            ? 'border border-danger/30 bg-danger-subtle text-danger'
            : 'border border-success/30 bg-success-subtle text-success'
        }`}>
          {message}
        </p>
      )}
    </div>
  )
}
