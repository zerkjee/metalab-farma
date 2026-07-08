'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  ExternalLink,
  FileText,
  PackageCheck,
  RefreshCw,
  Search,
  Send,
  SlidersHorizontal,
  Warehouse,
} from 'lucide-react'
import { fmtCurrency } from '@/data/admin'
import { tinyBadgeMeta } from '@/utils/adminOrders'

type CapabilityStatus = 'active' | 'planned'

interface TinyCapability {
  key: string
  title: string
  status: CapabilityStatus
  description: string
}

interface TinyOrderRow {
  id: string
  numero: string
  status: string
  pago: boolean
  compradorNome: string
  compradorEmail: string
  total: number
  criadoEm: string
  tinyPedidoId: string | null
  tinyNumero: string | null
  tinyStatus: string | null
  tinySyncStatus: string | null
  tinySyncAt: string | null
  tinyErro: string | null
  nfTinyId: string | null
  nfNumero: string | null
  nfSerie: string | null
  nfUrl: string | null
  nfStatus: string | null
  nfXmlUrl: string | null
  nfErro: string | null
  nfEmitidaEm: string | null
  itemSummary: string
}

interface TinyDashboardData {
  metrics: {
    totalOrders: number
    paidOrders: number
    readyToSend: number
    sentToTiny: number
    syncErrors: number
    invoicePending: number
    totalProducts: number
    lowStockProducts: number
  }
  orders: TinyOrderRow[]
  capabilities: TinyCapability[]
}

type Filter = 'all' | 'ready' | 'sent' | 'invoice' | 'errors'

const filters: Array<{ key: Filter; label: string }> = [
  { key: 'all', label: 'Todos' },
  { key: 'ready', label: 'Prontos para Tiny' },
  { key: 'sent', label: 'Enviados' },
  { key: 'invoice', label: 'NF-e pendente' },
  { key: 'errors', label: 'Erros' },
]

function formatDate(value: string | null) {
  if (!value) return '-'
  return new Date(value).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    AGUARDANDO_PAGAMENTO: 'Aguardando pagamento',
    PAGAMENTO_APROVADO: 'Pagamento aprovado',
    EM_SEPARACAO: 'Em separação',
    ENVIADO: 'Enviado',
    ENTREGUE: 'Entregue',
    CANCELADO: 'Cancelado',
    REEMBOLSADO: 'Reembolsado',
  }
  return labels[status] ?? status
}

function responseMessage(data: unknown, fallback: string) {
  if (!data || typeof data !== 'object') return fallback
  const obj = data as Record<string, unknown>
  if (Array.isArray(obj.errors) && obj.errors.length > 0) return obj.errors.map(String).join(' ')
  if (typeof obj.message === 'string') return obj.message
  if (typeof obj.erro === 'string') return obj.erro
  return fallback
}

function isTinySending(status: string | null) {
  return status === 'PROCESSANDO' || status === 'SENDING_TO_TINY'
}

function isTinySent(order: TinyOrderRow) {
  return Boolean(order.tinyPedidoId) || order.tinySyncStatus === 'ENVIADO' || order.tinySyncStatus === 'TINY_ORDER_CREATED'
}

function isTinyError(status: string | null) {
  return status === 'ERRO' || status === 'VALIDATION_ERROR' || status === 'SYNC_ERROR'
}

async function fetchTinyDashboard(): Promise<TinyDashboardData> {
  const res = await fetch('/api/admin/tiny/dashboard')
  if (!res.ok) throw new Error('Falha ao carregar painel Tiny')
  return await res.json() as TinyDashboardData
}

export default function TinyIntegrationPanel() {
  const [data, setData] = useState<TinyDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('ready')
  const [search, setSearch] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [busyKey, setBusyKey] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setData(await fetchTinyDashboard())
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Falha ao carregar painel Tiny')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    fetchTinyDashboard()
      .then((payload) => {
        if (!cancelled) setData(payload)
      })
      .catch((error: unknown) => {
        if (!cancelled) setMessage(error instanceof Error ? error.message : 'Falha ao carregar painel Tiny')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const filteredOrders = useMemo(() => {
    const term = search.trim().toLowerCase()
    return (data?.orders ?? []).filter((order) => {
      const matchFilter =
        filter === 'all' ||
        (filter === 'ready' && order.pago && !isTinySent(order) && !isTinySending(order.tinySyncStatus)) ||
        (filter === 'sent' && isTinySent(order)) ||
        (filter === 'invoice' && isTinySent(order) && order.nfStatus !== 'ISSUED') ||
        (filter === 'errors' && isTinyError(order.tinySyncStatus))

      const matchSearch = !term || [
        order.numero,
        order.compradorNome,
        order.compradorEmail,
        order.itemSummary,
        order.tinyPedidoId ?? '',
        order.tinyNumero ?? '',
      ].some((value) => value.toLowerCase().includes(term))

      return matchFilter && matchSearch
    })
  }, [data?.orders, filter, search])

  async function postAction(key: string, url: string, body?: object) {
    setBusyKey(key)
    setMessage(null)
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      })
      const payload: unknown = await res.json().catch(() => null)
      if (!res.ok) {
        setMessage(responseMessage(payload, 'Ação Tiny não concluída.'))
        return
      }
      setMessage(responseMessage(payload, 'Ação concluída com sucesso.'))
      await load()
    } catch {
      setMessage('Erro de conexão ao executar ação Tiny.')
    } finally {
      setBusyKey(null)
    }
  }

  const metrics = data?.metrics

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-700">Integrações</p>
          <h2 className="mt-1 text-xl font-display text-navy">Tiny ERP</h2>
          <p className="mt-1 text-xs text-ink-muted">Operação da integração Metalab com Tiny/Olist Tiny.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => void postAction('connection', '/api/admin/tiny/test-connection')}
            disabled={busyKey === 'connection'}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-surface-card px-4 py-2.5 text-sm font-semibold text-ink-secondary transition-all hover:bg-surface-sunken disabled:opacity-50"
          >
            <CheckCircle2 className={`h-4 w-4 ${busyKey === 'connection' ? 'animate-pulse' : ''}`} strokeWidth={1.8} />
            Testar conexão
          </button>
          <button
            onClick={() => {
              setLoading(true)
              void load()
            }}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-on-brand transition-all hover:bg-brand-hover disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} strokeWidth={1.8} />
            Atualizar
          </button>
        </div>
      </div>

      {message && (
        <p className="rounded-xl border border-line bg-surface-card px-4 py-3 text-sm font-semibold text-ink-secondary">
          {message}
        </p>
      )}

      <div className="grid gap-3 md:grid-cols-4">
        {[
          { label: 'Prontos para envio', value: metrics?.readyToSend ?? 0, icon: Send },
          { label: 'Enviados ao Tiny', value: metrics?.sentToTiny ?? 0, icon: PackageCheck },
          { label: 'NF-e pendentes', value: metrics?.invoicePending ?? 0, icon: FileText },
          { label: 'Estoque baixo', value: metrics?.lowStockProducts ?? 0, icon: Warehouse },
        ].map((metric) => {
          const Icon = metric.icon
          return (
            <div key={metric.label} className="rounded-2xl border border-line bg-surface-card p-4 shadow-sm">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <Icon className="h-4 w-4" strokeWidth={1.8} />
              </div>
              <p className="text-xs text-ink-muted">{metric.label}</p>
              <p className="mt-1 font-display text-2xl text-navy">{metric.value}</p>
            </div>
          )
        })}
      </div>

      <section className="rounded-2xl border border-line bg-surface-card p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-display text-navy">Módulos da integração</h3>
            <p className="mt-1 text-xs text-ink-muted">O painel começa por pedidos e NF-e; produtos, estoque e preços entram como próximas frentes.</p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-5">
          {(data?.capabilities ?? []).map((capability) => {
            const active = capability.status === 'active'
            const icon = capability.key === 'stock' ? Warehouse : capability.key === 'prices' ? SlidersHorizontal : capability.key === 'products' ? Boxes : capability.key === 'invoices' ? FileText : PackageCheck
            const Icon = icon
            return (
              <div key={capability.key} className="rounded-xl border border-line bg-surface-sunken p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <Icon className={`h-4 w-4 ${active ? 'text-success' : 'text-ink-muted'}`} strokeWidth={1.8} />
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${active ? 'bg-success-subtle text-success' : 'bg-surface-card text-ink-muted'}`}>
                    {active ? 'Ativo' : 'Planejado'}
                  </span>
                </div>
                <p className="text-sm font-bold text-navy">{capability.title}</p>
                <p className="mt-1 text-xs leading-5 text-ink-muted">{capability.description}</p>
              </div>
            )
          })}
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-line bg-surface-card shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-4">
          <div>
            <h3 className="text-sm font-display text-navy">Pedidos da integração</h3>
            <p className="mt-1 text-xs text-ink-muted">{filteredOrders.length} pedidos nesta visão</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" strokeWidth={1.8} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar pedido, cliente, SKU..."
                className="h-10 w-64 rounded-full border border-line-default bg-surface-sunken pl-9 pr-3 text-sm text-ink outline-none transition-all focus:border-brand"
              />
            </div>
          </div>
          <div className="flex w-full flex-wrap gap-2">
            {filters.map((item) => (
              <button
                key={item.key}
                onClick={() => setFilter(item.key)}
                className={`rounded-full px-3 py-2 text-xs font-semibold transition-all ${
                  filter === item.key
                    ? 'bg-brand text-on-brand'
                    : 'border border-line bg-surface-card text-ink-muted hover:text-navy'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px]">
            <thead>
              <tr className="border-b border-line bg-surface-sunken/60">
                <th className="px-5 py-3 text-left text-xs font-semibold text-ink-muted">Pedido</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-ink-muted">Cliente</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-ink-muted">Itens</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-ink-muted">Total</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-ink-muted">Tiny</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-ink-muted">NF-e</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-ink-muted">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-sm text-ink-muted">Carregando pedidos...</td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-sm text-ink-muted">Nenhum pedido encontrado para este filtro.</td>
                </tr>
              ) : filteredOrders.map((order) => {
                const badge = tinyBadgeMeta(order.tinySyncStatus)
                const canSend = order.pago && !isTinySent(order) && !isTinySending(order.tinySyncStatus)
                const canSyncInvoice = isTinySent(order)
                return (
                  <tr key={order.id} className="border-b border-line transition-colors hover:bg-surface-sunken">
                    <td className="px-5 py-4">
                      <Link href={`/admin/pedidos/${order.id}`} className="text-sm font-bold text-link hover:underline">
                        {order.numero}
                      </Link>
                      <p className="mt-1 text-[11px] text-ink-muted">{formatDate(order.criadoEm)}</p>
                      <p className="text-[11px] text-ink-muted">{statusLabel(order.status)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-ink">{order.compradorNome}</p>
                      <p className="text-xs text-ink-muted">{order.compradorEmail}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="max-w-xs truncate text-xs text-ink-secondary">{order.itemSummary || 'Sem itens'}</p>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <p className="text-sm font-bold text-navy">{fmtCurrency(order.total)}</p>
                      <p className="text-[11px] text-ink-muted">{order.pago ? 'Pago' : 'Não pago'}</p>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${badge.cls}`}>
                        {badge.spinner && <span className="h-2.5 w-2.5 animate-spin rounded-full border border-current border-t-transparent" />}
                        {badge.label}
                      </span>
                      {order.tinyPedidoId && <p className="mt-1 text-[11px] text-ink-muted">ID {order.tinyPedidoId}</p>}
                      {order.tinyErro && (
                        <p className="mx-auto mt-1 flex max-w-[180px] items-center justify-center gap-1 truncate text-[11px] text-danger">
                          <AlertTriangle className="h-3 w-3" />
                          {order.tinyErro}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="rounded-full bg-surface-sunken px-2 py-0.5 text-[10px] font-bold text-ink-muted">
                        {order.nfStatus ?? (order.nfNumero ? 'Emitida' : 'Pendente')}
                      </span>
                      {order.nfNumero && <p className="mt-1 text-[11px] text-ink-muted">NF {order.nfNumero}</p>}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1.5">
                        {canSend && (
                          <button
                            onClick={() => void postAction(`send:${order.id}`, '/api/admin/tiny/orders/send', { orderId: order.id })}
                            disabled={busyKey === `send:${order.id}`}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-brand-700 transition-all hover:bg-brand-50 disabled:opacity-50"
                            title="Enviar para Tiny"
                          >
                            <Send className="h-4 w-4" strokeWidth={1.8} />
                          </button>
                        )}
                        {canSyncInvoice && (
                          <button
                            onClick={() => void postAction(`invoice:${order.id}`, '/api/admin/tiny/invoices/sync', { orderId: order.id })}
                            disabled={busyKey === `invoice:${order.id}`}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-navy transition-all hover:bg-navy-50 disabled:opacity-50"
                            title="Sincronizar NF-e"
                          >
                            <FileText className="h-4 w-4" strokeWidth={1.8} />
                          </button>
                        )}
                        {order.nfUrl && (
                          <a
                            href={order.nfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-success transition-all hover:bg-success-subtle"
                            title="Abrir DANFE"
                          >
                            <ExternalLink className="h-4 w-4" strokeWidth={1.8} />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
