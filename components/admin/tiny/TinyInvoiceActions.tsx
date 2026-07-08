import { AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react'
import TinyInvoiceLinks from './TinyInvoiceLinks'
import type { AdminOrderDetail } from '@/utils/adminOrders'

type TinyInvoiceActionsProps = {
  order: AdminOrderDetail
  syncing: boolean
  message: string | null
  onSync: () => void
}

function invoiceLabel(status: string | null, hasNumber: boolean) {
  if (status === 'ISSUED') return 'Emitida'
  if (status === 'REJECTED') return 'Rejeitada'
  if (status === 'CANCELLED') return 'Cancelada'
  if (status === 'NOT_FOUND') return 'Não encontrada'
  if (status === 'PROCESSING') return 'Processando'
  return hasNumber ? 'Emitida' : 'Pendente'
}

function messageIsError(value: string | null) {
  if (!value) return false
  return value.startsWith('Erro') || value.includes('não') || value.includes('rejeitada') || value.includes('encontrada')
}

export default function TinyInvoiceActions({ order, syncing, message, onSync }: TinyInvoiceActionsProps) {
  const sentToTiny = Boolean(order.tinyPedidoId) || order.tinySyncStatus === 'TINY_ORDER_CREATED' || order.tinySyncStatus === 'ENVIADO'
  const invoiceStatus = invoiceLabel(order.nfStatus, Boolean(order.nfNumero))
  const rejected = order.nfStatus === 'REJECTED'
  const syncError = order.tinySyncStatus === 'SYNC_ERROR' && Boolean(order.tinyErro)
  const notFound = order.nfStatus === 'NOT_FOUND'

  return (
    <div className="rounded-xl bg-surface-sunken p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-ink-muted">Status NF-e</p>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
          order.nfStatus === 'ISSUED'
            ? 'bg-success-subtle text-success'
            : rejected || syncError
              ? 'bg-danger-subtle text-danger'
              : 'bg-brand-50 text-brand-700'
        }`}>
          {invoiceStatus}
        </span>
      </div>

      {!sentToTiny ? (
        <p className="mt-2 text-xs text-ink-muted">Envie o pedido ao Tiny antes de sincronizar a NF-e.</p>
      ) : (
        <>
          {order.nfNumero ? (
            <div className="mt-2 space-y-1 text-xs text-ink-secondary">
              <p><span className="font-semibold text-ink">Número:</span> {order.nfNumero}</p>
              {order.nfSerie && <p><span className="font-semibold text-ink">Série:</span> {order.nfSerie}</p>}
              {order.nfChave && <p className="break-all"><span className="font-semibold text-ink">Chave:</span> {order.nfChave}</p>}
              {order.nfEmitidaEm && <p><span className="font-semibold text-ink">Emitida em:</span> {new Date(order.nfEmitidaEm).toLocaleString('pt-BR')}</p>}
            </div>
          ) : (
            <p className="mt-2 text-xs text-ink-muted">
              {notFound
                ? 'A NF-e ainda não foi encontrada no Tiny. Confira se ela já foi emitida e tente novamente.'
                : 'NF-e pendente de sincronização.'}
            </p>
          )}

          {(rejected || order.nfErro) && (
            <p className="mt-2 rounded-lg border border-danger/30 bg-danger-subtle px-3 py-2 text-xs font-semibold text-danger">
              <AlertTriangle className="mr-1 inline h-3.5 w-3.5" strokeWidth={1.8} />
              {order.nfErro ?? 'NF-e rejeitada no Tiny. Corrija a nota no Tiny e sincronize novamente.'}
            </p>
          )}

          {syncError && (
            <p className="mt-2 rounded-lg border border-danger/30 bg-danger-subtle px-3 py-2 text-xs font-semibold text-danger">
              {order.tinyErro}
            </p>
          )}

          <TinyInvoiceLinks danfeUrl={order.nfUrl} xmlUrl={order.nfXmlUrl} />

          <button
            onClick={onSync}
            disabled={syncing}
            className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-brand-50 px-3 py-2.5 text-xs font-semibold text-brand-700 transition-all hover:bg-brand-100 disabled:opacity-50"
          >
            {order.nfStatus === 'ISSUED' ? (
              <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.8} />
            ) : (
              <RefreshCw className={`h-3.5 w-3.5 ${syncing ? 'animate-spin' : ''}`} strokeWidth={1.8} />
            )}
            {syncing ? 'Sincronizando...' : order.nfStatus === 'ISSUED' ? 'Sincronizar novamente' : 'Sincronizar NF-e'}
          </button>

          {message && (
            <p className={`mt-2 rounded-xl px-3 py-2 text-xs font-semibold ${
              messageIsError(message)
                ? 'border border-danger/30 bg-danger-subtle text-danger'
                : 'border border-success/30 bg-success-subtle text-success'
            }`}>
              {message}
            </p>
          )}
        </>
      )}
    </div>
  )
}
