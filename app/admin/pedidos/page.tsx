'use client';

import {
  Ban,
  CheckCircle2,
  Copy,
  Download,
  Eye,
  FileText,
  PackageCheck,
  Printer,
  Save,
  Search,
  Send,
  Truck,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import Modal from '@/components/admin/Modal';
import StatusBadge from '@/components/admin/StatusBadge';
import ProductImage from '@/components/ProductImage';
import { fmtCurrency } from '@/data/admin';
import {
  AdminOrderDetail,
  AdminOrderStatus,
  formatOrderDate,
  mapApiOrder,
  orderStatusFlow,
  orderStatusMeta,
  tinyBadgeMeta,
} from '@/utils/adminOrders';

const pageSize = 5;
const statusFilters: Array<AdminOrderStatus | 'todos'> = [
  'todos',
  'aguardando_pagamento',
  'pagamento_aprovado',
  'em_separacao',
  'enviado',
  'entregue',
  'cancelado',
];

// Estilo visual (badge) por status — aplica as cores do design system sobre o
// label/lógica reais definidos em utils/adminOrders (sem alterar a lógica de status).
const statusPillClasses: Record<AdminOrderStatus, string> = {
  aguardando_pagamento: 'bg-warning-subtle text-warning',
  pagamento_aprovado: 'bg-brand-50 text-brand-700',
  em_separacao: 'bg-navy-50 text-navy-600',
  enviado: 'bg-brand-100 text-brand-700',
  entregue: 'bg-success-subtle text-success',
  cancelado: 'bg-danger-subtle text-danger',
};

function Timeline({ order }: { order: AdminOrderDetail }) {
  const steps = order.status === 'cancelado'
    ? order.timeline
    : orderStatusFlow.map((status) => order.timeline.find((step) => step.status === status)).filter(Boolean);

  return (
    <div className="flex flex-col gap-0">
      {steps.map((step, index) => step && (
        <div key={`${step.status}-${index}`} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div
              className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                step.done ? 'border-brand bg-brand' : 'border-line bg-surface-sunken'
              }`}
            >
              {step.done && <CheckCircle2 className="h-3 w-3 text-on-brand" strokeWidth={2.2} />}
            </div>
            {index < steps.length - 1 && (
              <div className={`my-1 min-h-7 w-0.5 flex-1 ${step.done ? 'bg-brand-200' : 'bg-line'}`} />
            )}
          </div>
          <div className="pb-4">
            <p className={`text-sm font-semibold ${step.done ? 'text-ink' : 'text-ink-muted'}`}>
              {step.label}
            </p>
            <p className="mt-0.5 text-xs text-ink-muted">{step.date}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function SkeletonTable() {
  return (
    <div className="rounded-2xl border border-line bg-surface-card p-5">
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="grid animate-pulse grid-cols-[120px_1fr_120px_160px_120px] gap-4 rounded-xl bg-surface-sunken p-4">
            <div className="h-4 rounded bg-line" />
            <div className="h-4 rounded bg-line" />
            <div className="h-4 rounded bg-line" />
            <div className="h-4 rounded bg-line" />
            <div className="h-4 rounded bg-line" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminPedidos() {
  const [orders, setOrders] = useState<AdminOrderDetail[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<AdminOrderStatus | 'todos'>('todos');
  const [page, setPage] = useState(1);
  const [quickOrder, setQuickOrder] = useState<AdminOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [trackingInput, setTrackingInput] = useState('');
  const [trackingSaving, setTrackingSaving] = useState(false);
  const [trackingSaved, setTrackingSaved] = useState(false);
  const [tinyTesting, setTinyTesting] = useState(false);
  const [tinyTestMsg, setTinyTestMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/admin/pedidos')
      .then((r) => r.json())
      .then((data: unknown) => {
        if (cancelled || !Array.isArray(data)) return;
        setOrders(data.map((p) => mapApiOrder(p as Record<string, unknown>)));
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const metrics = useMemo(() => {
    const todayPrefix = new Date().toISOString().slice(0, 10);
    const today = orders.filter((order) => order.date.startsWith(todayPrefix));
    const revenue = orders
      .filter((order) => order.status !== 'cancelado')
      .reduce((sum, order) => sum + order.total, 0);
    const paidOrders = orders.filter((order) => order.status !== 'cancelado' && order.status !== 'aguardando_pagamento');
    const pending = orders.filter((order) => order.status === 'aguardando_pagamento' || order.status === 'em_separacao');

    return {
      today: today.length,
      revenue,
      averageTicket: paidOrders.length ? revenue / paidOrders.length : 0,
      pending: pending.length,
    };
  }, [orders]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return orders.filter((order) => {
      const matchSearch = !term || [
        order.id,
        order.customer.name,
        order.customer.email,
        order.payment,
        order.items.map((item) => item.name).join(' '),
      ].some((value) => value.toLowerCase().includes(term));
      const matchStatus = statusFilter === 'todos' || order.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const statusApiMap: Record<AdminOrderStatus, string> = {
    aguardando_pagamento: 'AGUARDANDO_PAGAMENTO',
    pagamento_aprovado: 'PAGAMENTO_APROVADO',
    em_separacao: 'EM_SEPARACAO',
    enviado: 'ENVIADO',
    entregue: 'ENTREGUE',
    cancelado: 'CANCELADO',
  };

  function updateStatus(id: string, status: AdminOrderStatus) {
    const prevOrders = orders;
    const prevQuick = quickOrder;

    setOrders((current) => current.map((order) => {
      if (order.id !== id) return order;
      return {
        ...order,
        status,
        trackingCode: status === 'enviado' && !order.trackingCode ? `BR${order.id.replace('#', '')}MLABR` : order.trackingCode,
      };
    }));
    setQuickOrder((current) => current && current.id === id ? { ...current, status } : current);

    fetch(`/api/pedidos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: statusApiMap[status] }),
    }).then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
    }).catch(() => {
      setOrders(prevOrders);
      setQuickOrder(prevQuick);
      alert('Falha ao atualizar o status. Verifique a conexão e tente novamente.');
    });
  }

  async function saveTracking(id: string) {
    const code = trackingInput.trim();
    if (!code) return;
    setTrackingSaving(true);
    try {
      await fetch(`/api/pedidos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigoRastreio: code }),
      });
      setOrders((current) => current.map((o) => o.id === id ? { ...o, trackingCode: code } : o));
      setQuickOrder((current) => current && current.id === id ? { ...current, trackingCode: code } : current);
      setTrackingSaved(true);
      setTimeout(() => setTrackingSaved(false), 3000);
    } catch { /* ignore */ } finally {
      setTrackingSaving(false);
    }
  }

  function copyCode(code: string) {
    void navigator.clipboard?.writeText(code);
  }

  function printOrder() {
    window.print();
  }

  async function testTinyConnection() {
    if (tinyTesting) return;
    setTinyTesting(true);
    setTinyTestMsg(null);
    try {
      const res = await fetch('/api/admin/tiny/test-connection', { method: 'POST' });
      const data: unknown = await res.json().catch(() => null);
      const message = data && typeof data === 'object' && 'message' in data
        ? String((data as { message?: unknown }).message)
        : res.ok ? 'Conexão Tiny validada.' : 'Falha ao testar conexão Tiny.';
      setTinyTestMsg(message);
    } catch {
      setTinyTestMsg('Erro de conexão ao testar Tiny.');
    }
    setTinyTesting(false);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-700">Operação e logística</p>
          <h2 className="mt-1 text-xl font-display text-navy">Pedidos</h2>
          <p className="mt-1 text-xs text-ink-muted">{orders.length} pedidos no painel</p>
          {tinyTestMsg && (
            <p className="mt-2 text-xs font-semibold text-ink-secondary">{tinyTestMsg}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => void testTinyConnection()}
            disabled={tinyTesting}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-surface-card px-4 py-2.5 text-sm font-semibold text-ink-secondary transition-all hover:bg-surface-sunken disabled:opacity-50"
          >
            <CheckCircle2 className={`h-4 w-4 ${tinyTesting ? 'animate-pulse' : ''}`} strokeWidth={1.8} />
            {tinyTesting ? 'Testando Tiny' : 'Testar Tiny'}
          </button>
          <button
            onClick={printOrder}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-surface-card px-4 py-2.5 text-sm font-semibold text-ink-secondary transition-all hover:bg-surface-sunken"
          >
            <Printer className="h-4 w-4" strokeWidth={1.8} />
            Imprimir lista
          </button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        {[
          { label: 'Pedidos hoje', value: metrics.today, icon: PackageCheck },
          { label: 'Faturamento', value: fmtCurrency(metrics.revenue), icon: FileText },
          { label: 'Ticket médio', value: fmtCurrency(metrics.averageTicket), icon: Truck },
          { label: 'Pendentes', value: metrics.pending, icon: Ban },
        ].map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="rounded-2xl border border-line bg-surface-card shadow-sm p-4">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <Icon className="h-4 w-4" strokeWidth={1.8} />
              </div>
              <p className="text-xs text-ink-muted">{metric.label}</p>
              <p className="mt-1 font-display text-2xl text-navy">{metric.value}</p>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-line bg-brand-50 px-5 py-3">
        <p className="text-xs leading-5 text-brand-700">
          Gestão integrada com Mercado Livre, logística, rastreamento, notas fiscais e automações.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <a
          href={`/api/admin/pedidos/export${statusFilter !== 'todos' ? `?status=${statusFilter.toUpperCase()}` : ''}`}
          download
          className="flex items-center gap-2 rounded-full border border-line bg-surface-card px-3 py-2 text-xs font-semibold text-ink-secondary transition-colors hover:border-brand hover:text-brand-700"
        >
          <Download className="h-4 w-4" strokeWidth={1.8} />
          Exportar CSV
        </a>
        <div className="flex min-w-56 flex-1 items-center gap-2 rounded-full border border-line bg-surface-card px-3 py-2">
          <Search className="h-4 w-4 flex-shrink-0 text-ink-muted" strokeWidth={1.8} />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Buscar por pedido, cliente, pagamento ou produto..."
            className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-muted"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {statusFilters.map((status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                setPage(1);
              }}
              className={`rounded-full px-3 py-2 text-xs font-semibold transition-all ${
                statusFilter === status
                  ? 'bg-brand text-on-brand'
                  : 'border border-line bg-surface-card text-ink-muted hover:text-navy'
              }`}
            >
              {status === 'todos' ? 'Todos' : orderStatusMeta[status].label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <SkeletonTable />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-surface-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead>
                <tr className="border-b border-line">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-ink-muted">Pedido</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-ink-muted">Cliente</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-ink-muted">Produtos</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-ink-muted">Valores</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-ink-muted">Pagamento</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-ink-muted">Status</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-ink-muted">Ações</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((order, index) => {
                  const status = orderStatusMeta[order.status];
                  return (
                    <tr
                      key={order.id}
                      className={`transition-colors hover:bg-surface-sunken ${index < paginated.length - 1 ? 'border-b border-line' : ''}`}
                    >
                      <td className="px-5 py-4">
                        <Link href={`/admin/pedidos/${order.id.replace('#', '')}`} className="text-sm font-bold text-link hover:underline">
                          {order.id}
                        </Link>
                        <p className="mt-1 text-[11px] text-ink-muted">{formatOrderDate(order.date)}</p>
                        <p className="text-[11px] text-ink-muted">{order.channel}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-ink">{order.customer.name}</p>
                        <p className="text-xs text-ink-muted">{order.customer.email}</p>
                        <p className="text-xs text-ink-muted">{order.address.city}, {order.address.state}</p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1">
                          {order.items.slice(0, 2).map((item) => (
                            <p key={item.sku} className="text-xs text-ink-secondary">
                              {item.qty}x {item.name}
                            </p>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <p className="text-sm font-bold text-navy">{fmtCurrency(order.total)}</p>
                        <p className="text-[11px] text-ink-muted">Desc. {fmtCurrency(order.discount)}</p>
                        <p className="text-[11px] text-ink-muted">Frete {fmtCurrency(order.shipping)}</p>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <p className="text-xs font-semibold text-ink-secondary">{order.payment}</p>
                        <button
                          onClick={() => copyCode(order.paymentCode)}
                          className="mt-1 text-[11px] text-ink-muted transition-colors hover:text-brand-700"
                        >
                          copiar código
                        </button>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <StatusBadge label={status.label} color={statusPillClasses[order.status]} />
                        {(() => {
                          const b = tinyBadgeMeta(order.tinySyncStatus);
                          return (
                            <span
                              title="Sincronização Tiny/ERP"
                              className={`mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${b.cls}`}
                            >
                              {b.spinner && <span className="h-2.5 w-2.5 animate-spin rounded-full border border-current border-t-transparent" />}
                              Tiny: {b.label}
                            </span>
                          );
                        })()}
                        <span
                          title="Status da NF-e"
                          className="mt-1.5 inline-flex rounded-full bg-surface-sunken px-2 py-0.5 text-[10px] font-bold text-ink-muted"
                        >
                          NF-e: {order.nfStatus ?? (order.nfNumero ? 'Emitida' : 'Pendente')}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => { setQuickOrder(order); setTrackingInput(order.trackingCode ?? ''); setTrackingSaved(false); }}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-brand-700 transition-all hover:bg-brand-50"
                            title="Detalhes rápidos"
                          >
                            <Eye className="h-4 w-4" strokeWidth={1.8} />
                          </button>
                          <button
                            onClick={() => updateStatus(order.id, 'enviado')}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-navy transition-all hover:bg-navy-50"
                            title="Marcar como enviado"
                          >
                            <Send className="h-4 w-4" strokeWidth={1.8} />
                          </button>
                          <button
                            onClick={() => updateStatus(order.id, 'cancelado')}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-danger transition-all hover:bg-danger-subtle"
                            title="Cancelar pedido"
                          >
                            <Ban className="h-4 w-4" strokeWidth={1.8} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-4">
            <p className="text-xs text-ink-muted">
              Exibindo {paginated.length} de {filtered.length} pedidos
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page === 1}
                className="rounded-full border border-line bg-surface-card px-3 py-2 text-xs font-semibold text-ink-secondary transition-all hover:text-navy disabled:cursor-not-allowed disabled:opacity-40"
              >
                Anterior
              </button>
              <span className="text-xs font-semibold text-ink-secondary">{page} / {totalPages}</span>
              <button
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={page === totalPages}
                className="rounded-full border border-line bg-surface-card px-3 py-2 text-xs font-semibold text-ink-secondary transition-all hover:text-navy disabled:cursor-not-allowed disabled:opacity-40"
              >
                Próxima
              </button>
            </div>
          </div>
        </div>
      )}

      <Modal
        open={!!quickOrder}
        onClose={() => setQuickOrder(null)}
        title={`Pedido ${quickOrder?.id}`}
        maxWidth="max-w-3xl"
      >
        {quickOrder && (
          <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
            <div className="space-y-4">
              <div className="rounded-2xl border border-line bg-surface-sunken p-4">
                <p className="text-sm font-bold text-navy">{quickOrder.customer.name}</p>
                <p className="mt-1 text-xs text-ink-secondary">{quickOrder.customer.email}</p>
                <p className="text-xs text-ink-muted">
                  {quickOrder.address.street}, {quickOrder.address.number} · {quickOrder.address.city}/{quickOrder.address.state}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-4">
                {[
                  { label: 'Subtotal', value: fmtCurrency(quickOrder.subtotal) },
                  { label: 'Desconto', value: fmtCurrency(quickOrder.discount) },
                  { label: 'Frete', value: fmtCurrency(quickOrder.shipping) },
                  { label: 'Total', value: fmtCurrency(quickOrder.total) },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl bg-surface-sunken p-3 text-center">
                    <p className="text-sm font-bold text-navy">{item.value}</p>
                    <p className="mt-1 text-[10px] text-ink-muted">{item.label}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                {quickOrder.items.map((item) => (
                  <div key={item.sku} className="flex items-center gap-3 rounded-xl border border-line bg-surface-sunken p-3">
                    <div className="h-12 w-12 rounded-xl bg-surface-card p-1">
                      <ProductImage src={item.image} alt={item.name} sizes="48px" frameClassName="h-full w-full" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-navy">{item.name}</p>
                      <p className="text-xs text-ink-muted">{item.sku}</p>
                    </div>
                    <p className="text-xs text-ink-secondary">{item.qty}x</p>
                    <p className="text-sm font-bold text-navy">{fmtCurrency(item.unitPrice)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-ink-muted">Timeline</p>
              <Timeline order={quickOrder} />

              <div className="mt-4 space-y-2">
                {/* Código de rastreio */}
                <div>
                  <p className="mb-1.5 text-xs font-bold uppercase tracking-[0.2em] text-ink-muted">Rastreio</p>
                  <div className="flex gap-2">
                    <input
                      value={trackingInput}
                      onChange={(e) => { setTrackingInput(e.target.value.toUpperCase()); setTrackingSaved(false); }}
                      placeholder="BR123456789BR"
                      className="flex-1 min-w-0 rounded-xl border border-line-default bg-surface-card px-3 py-2 text-sm font-mono text-ink outline-none placeholder:text-ink-muted focus:border-brand"
                    />
                    <button
                      onClick={() => saveTracking(quickOrder.id)}
                      disabled={trackingSaving || !trackingInput.trim()}
                      className="flex shrink-0 items-center gap-1.5 rounded-xl border border-line-default bg-surface-card px-3 py-2 text-xs font-semibold text-ink-secondary transition-all hover:bg-surface-sunken disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Save className="h-3.5 w-3.5" strokeWidth={2} />
                      {trackingSaving ? 'Salvando…' : trackingSaved ? 'Salvo!' : 'Salvar'}
                    </button>
                  </div>
                  {trackingInput.trim() && (
                    <button
                      onClick={() => copyCode(trackingInput)}
                      className="mt-1.5 text-[11px] text-ink-muted hover:text-brand-700 transition-colors"
                    >
                      Copiar código de rastreio
                    </button>
                  )}
                </div>

                <select
                  value={quickOrder.status}
                  onChange={(event) => updateStatus(quickOrder.id, event.target.value as AdminOrderStatus)}
                  className="w-full rounded-xl border border-line-default bg-surface-card px-3 py-2.5 text-sm text-ink outline-none focus:border-brand"
                >
                  {statusFilters.filter((item) => item !== 'todos').map((item) => (
                    <option key={item} value={item}>{orderStatusMeta[item].label}</option>
                  ))}
                </select>
                <Link
                  href={`/admin/pedidos/${quickOrder.id.replace('#', '')}`}
                  className="flex w-full items-center justify-center rounded-full bg-brand px-4 py-2 text-sm font-semibold text-on-brand transition-all hover:bg-brand-hover"
                >
                  Ver pedido completo
                </Link>
                <button
                  onClick={() => copyCode(quickOrder.paymentCode)}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-line bg-surface-card px-4 py-2 text-sm font-semibold text-ink-secondary transition-all hover:bg-surface-sunken"
                >
                  <Copy className="h-4 w-4" strokeWidth={1.8} />
                  Copiar código
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
