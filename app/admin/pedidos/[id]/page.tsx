'use client';

import {
  ArrowLeft,
  Ban,
  Copy,
  FileText,
  PackageCheck,
  Printer,
  Save,
  Send,
  Truck,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import StatusBadge from '@/components/admin/StatusBadge';
import ProductImage from '@/components/ProductImage';
import TinyInvoiceActions from '@/components/admin/tiny/TinyInvoiceActions';
import TinyOrderActions from '@/components/admin/tiny/TinyOrderActions';
import { fmtCurrency } from '@/data/admin';
import {
  AdminOrderDetail,
  AdminOrderStatus,
  buildTimeline,
  formatOrderDate,
  mapApiOrder,
  orderStatusFlow,
  orderStatusMeta,
} from '@/utils/adminOrders';

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
    <div className="rounded-2xl border border-line bg-surface-card shadow-sm p-5">
      <h3 className="mb-5 text-sm font-display text-navy">Timeline do pedido</h3>
      <div className="flex flex-col gap-0">
        {steps.map((step, index) => step && (
          <div key={`${step.status}-${index}`} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                  step.done ? 'border-brand bg-brand' : 'border-line bg-surface-sunken'
                }`}
              >
                {step.done && <PackageCheck className="h-3.5 w-3.5 text-on-brand" strokeWidth={2.2} />}
              </div>
              {index < steps.length - 1 && (
                <div className={`my-1 min-h-9 w-0.5 flex-1 ${step.done ? 'bg-brand-200' : 'bg-line'}`} />
              )}
            </div>
            <div className="pb-5">
              <p className={`text-sm font-semibold ${step.done ? 'text-ink' : 'text-ink-muted'}`}>
                {step.label}
              </p>
              <p className="mt-0.5 text-xs text-ink-muted">{step.date}</p>
              {step.current && (
                <span className="mt-2 inline-flex rounded-full bg-brand-50 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700">
                  Status atual
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const statusToApi: Record<AdminOrderStatus, string> = {
  aguardando_pagamento: 'AGUARDANDO_PAGAMENTO',
  pagamento_aprovado: 'PAGAMENTO_APROVADO',
  em_separacao: 'EM_SEPARACAO',
  enviado: 'ENVIADO',
  entregue: 'ENTREGUE',
  cancelado: 'CANCELADO',
};

export default function AdminPedidoDetalhe() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<AdminOrderDetail | null>(null);
  const [note, setNote] = useState('');
  const [trackingCode, setTrackingCode] = useState('');
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [tinySending, setTinySending] = useState(false);
  const [invoiceSyncing, setInvoiceSyncing] = useState(false);
  const [tinyMsg, setTinyMsg] = useState<string | null>(null);
  const [invoiceMsg, setInvoiceMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/pedidos/${params.id}`)
      .then((r) => r.json())
      .then((data: unknown) => {
        if (cancelled) return;
        if (data && typeof data === 'object' && !('erro' in (data as object))) {
          const mapped = mapApiOrder(data as Record<string, unknown>);
          setOrder(mapped);
          setNote(mapped.notes ?? '');
          setTrackingCode(mapped.trackingCode ?? '');
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setFetching(false); });
    return () => { cancelled = true; };
  }, [params.id]);

  if (fetching) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-2xl border border-line bg-surface-card shadow-sm p-8 text-center">
        <p className="text-xl font-display text-navy">Pedido não encontrado</p>
        <p className="mt-2 text-sm text-ink-muted">Verifique o ID e tente novamente.</p>
        <Link href="/admin/pedidos" className="mt-5 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-on-brand">
          Voltar para pedidos
        </Link>
      </div>
    );
  }

  const status = orderStatusMeta[order.status];

  async function updateStatus(statusValue: AdminOrderStatus) {
    if (!order || saving) return;
    setSaving(true);
    setSaveError('');
    try {
      const res = await fetch(`/api/pedidos/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: statusToApi[statusValue] }),
      });
      if (res.ok) {
        setOrder({
          ...order,
          status: statusValue,
          timeline: buildTimeline(statusValue, new Date().toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })),
          history: [
            { date: 'Agora', event: `Status alterado para ${orderStatusMeta[statusValue].label}`, actor: 'Admin Metalab' },
            ...order.history,
          ],
        });
      } else {
        setSaveError('Erro ao atualizar status. Tente novamente.');
      }
    } catch {
      setSaveError('Falha de conexão. Tente novamente.');
    }
    setSaving(false);
  }

  async function saveTrackingCode() {
    if (!order || saving) return;
    setSaving(true);
    setSaveError('');
    try {
      const res = await fetch(`/api/pedidos/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigoRastreio: trackingCode }),
      });
      if (res.ok) {
        setOrder({ ...order, trackingCode });
      } else {
        setSaveError('Erro ao salvar rastreio. Tente novamente.');
      }
    } catch {
      setSaveError('Falha de conexão. Tente novamente.');
    }
    setSaving(false);
  }

  function copyCode(value: string) {
    void navigator.clipboard?.writeText(value);
  }

  function printOrder() {
    window.print();
  }

  async function refreshOrder() {
    const res = await fetch(`/api/pedidos/${params.id}`);
    if (!res.ok) return;
    const data = await res.json();
    setOrder(mapApiOrder(data as Record<string, unknown>));
  }

  function tinyErrorMessage(data: unknown, fallback: string) {
    if (!data || typeof data !== 'object') return fallback;
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.errors) && obj.errors.length > 0) return obj.errors.map(String).join(' ');
    if (typeof obj.message === 'string') return obj.message;
    if (typeof obj.erro === 'string') return obj.erro;
    return fallback;
  }

  async function handleTinySend() {
    if (!order || tinySending) return;
    setTinySending(true);
    setTinyMsg(null);
    try {
      const res = await fetch('/api/admin/tiny/orders/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id }),
      });
      const data: unknown = await res.json().catch(() => null);
      if (res.ok) {
        await refreshOrder();
        setTinyMsg('Pedido enviado ao Tiny com sucesso.');
      } else {
        setTinyMsg(tinyErrorMessage(data, 'Erro ao enviar pedido ao Tiny.'));
      }
    } catch {
      setTinyMsg('Erro de conexão. Tente novamente.');
    }
    setTinySending(false);
  }

  async function handleInvoiceSync() {
    if (!order || invoiceSyncing) return;
    setInvoiceSyncing(true);
    setInvoiceMsg(null);
    try {
      const res = await fetch('/api/admin/tiny/invoices/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id }),
      });
      const data: unknown = await res.json().catch(() => null);
      if (res.ok) {
        await refreshOrder();
        setInvoiceMsg(tinyErrorMessage(data, 'NF-e sincronizada com sucesso.'));
      } else {
        setInvoiceMsg(tinyErrorMessage(data, 'Erro ao sincronizar NF-e.'));
      }
    } catch {
      setInvoiceMsg('Erro de conexão. Tente novamente.');
    }
    setInvoiceSyncing(false);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/admin/pedidos')}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface-card text-ink-muted transition-all hover:bg-surface-sunken hover:text-navy"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.8} />
          </button>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-700">Detalhe do pedido</p>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-display text-navy">{order.id}</h2>
              <StatusBadge label={status.label} color={statusPillClasses[order.status]} />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={printOrder}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-surface-card px-4 py-2.5 text-sm font-semibold text-ink-secondary transition-all hover:bg-surface-sunken"
          >
            <Printer className="h-4 w-4" strokeWidth={1.8} />
            Imprimir
          </button>
          <button
            onClick={() => copyCode(order.paymentCode)}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-surface-card px-4 py-2.5 text-sm font-semibold text-ink-secondary transition-all hover:bg-surface-sunken"
          >
            <Copy className="h-4 w-4" strokeWidth={1.8} />
            Copiar código
          </button>
          <button
            onClick={() => void updateStatus('enviado')}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-navy-50 px-4 py-2.5 text-sm font-semibold text-navy-600 transition-all hover:bg-navy-100 disabled:opacity-50"
          >
            <Send className="h-4 w-4" strokeWidth={1.8} />
            Marcar enviado
          </button>
          <button
            onClick={() => void updateStatus('cancelado')}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-danger-subtle px-4 py-2.5 text-sm font-semibold text-danger transition-all hover:bg-danger/15 disabled:opacity-50"
          >
            <Ban className="h-4 w-4" strokeWidth={1.8} />
            Cancelar
          </button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        {[
          { label: 'Subtotal', value: fmtCurrency(order.subtotal), icon: FileText },
          { label: 'Desconto', value: fmtCurrency(order.discount), icon: Save },
          { label: 'Frete', value: fmtCurrency(order.shipping), icon: Truck },
          { label: 'Total', value: fmtCurrency(order.total), icon: PackageCheck },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-2xl border border-line bg-surface-card shadow-sm p-4">
              <Icon className="mb-3 h-4 w-4 text-brand-700" strokeWidth={1.8} />
              <p className="text-xs text-ink-muted">{item.label}</p>
              <p className="mt-1 font-display text-2xl text-navy">{item.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <main className="space-y-5">
          <section className="rounded-2xl border border-line bg-surface-card shadow-sm p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-sm font-display text-navy">Produtos do pedido</h3>
              <p className="text-xs text-ink-muted">{formatOrderDate(order.date)}</p>
            </div>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.sku} className="grid gap-3 rounded-2xl border border-line bg-surface-sunken p-4 sm:grid-cols-[56px_1fr_80px_120px] sm:items-center">
                  <div className="h-14 w-14 rounded-xl bg-surface-card p-1">
                    <ProductImage src={item.image} alt={item.name} sizes="56px" frameClassName="h-full w-full" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-navy">{item.name}</p>
                    <p className="text-xs text-ink-muted">{item.sku}</p>
                  </div>
                  <p className="text-sm font-semibold text-ink-secondary">{item.qty} un.</p>
                  <p className="text-sm font-bold text-navy">{fmtCurrency(item.qty * item.unitPrice)}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-2xl border border-line bg-surface-card shadow-sm p-5">
              <h3 className="mb-4 text-sm font-display text-navy">Cliente</h3>
              <p className="text-sm font-bold text-navy">{order.customer.name}</p>
              <p className="mt-1 text-xs text-ink-secondary">{order.customer.email}</p>
              <p className="text-xs text-ink-secondary">{order.customer.phone}</p>
              <p className="mt-3 text-xs text-ink-muted">Documento: {order.customer.document}</p>
            </div>

            <div className="rounded-2xl border border-line bg-surface-card shadow-sm p-5">
              <h3 className="mb-4 text-sm font-display text-navy">Endereço</h3>
              <p className="text-sm font-bold text-navy">{order.address.street}, {order.address.number}</p>
              <p className="mt-1 text-xs text-ink-secondary">{order.address.complement} · {order.address.district}</p>
              <p className="text-xs text-ink-secondary">{order.address.city}/{order.address.state} · {order.address.zip}</p>
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-surface-card shadow-sm p-5">
            <h3 className="mb-4 text-sm font-display text-navy">Histórico</h3>
            <div className="space-y-3">
              {order.history.map((entry, index) => (
                <div key={`${entry.event}-${index}`} className="rounded-xl border border-line bg-surface-sunken p-3">
                  <p className="text-sm font-semibold text-ink">{entry.event}</p>
                  <p className="mt-1 text-xs text-ink-muted">{entry.date} · {entry.actor}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-surface-card shadow-sm p-5">
            <h3 className="mb-4 text-sm font-display text-navy">Observações internas</h3>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              className="min-h-28 w-full resize-none rounded-xl border border-line-default bg-surface-sunken px-3 py-2.5 text-sm text-ink outline-none transition-all focus:border-brand"
            />
          </section>
        </main>

        <aside className="space-y-5 xl:sticky xl:top-20 xl:self-start">
          <Timeline order={order} />

          <div className="rounded-2xl border border-line bg-surface-card shadow-sm p-5">
            <h3 className="mb-4 text-sm font-display text-navy">Operação</h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs text-ink-secondary">Atualizar status</label>
                <select
                  value={order.status}
                  onChange={(event) => void updateStatus(event.target.value as AdminOrderStatus)}
                  disabled={saving}
                  className="w-full rounded-xl border border-line-default bg-surface-card px-3 py-2.5 text-sm text-ink outline-none focus:border-brand disabled:opacity-50"
                >
                  {(['aguardando_pagamento', 'pagamento_aprovado', 'em_separacao', 'enviado', 'entregue', 'cancelado'] as AdminOrderStatus[]).map((item) => (
                    <option key={item} value={item}>{orderStatusMeta[item].label}</option>
                  ))}
                </select>
              </div>

              <div className="rounded-xl bg-surface-sunken p-3">
                <p className="text-xs text-ink-muted">Pagamento</p>
                <p className="mt-1 text-sm font-bold text-navy">{order.payment}</p>
                <p className="text-xs text-ink-muted">{order.paymentCode}</p>
              </div>

              <div className="rounded-xl bg-surface-sunken p-3">
                <p className="text-xs text-ink-muted">Cupom</p>
                <p className="mt-1 text-sm font-bold text-navy">{order.coupon ?? 'Sem cupom'}</p>
              </div>

              <div>
                <label className="mb-1 block text-xs text-ink-secondary">Código de rastreio</label>
                <div className="flex gap-2">
                  <input
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value)}
                    placeholder="Aguardando envio"
                    className="flex-1 rounded-xl border border-line-default bg-surface-card px-3 py-2 text-sm text-ink outline-none focus:border-brand placeholder:text-ink-muted"
                  />
                  <button
                    onClick={() => void saveTrackingCode()}
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-2 text-xs font-semibold text-on-brand transition-all hover:bg-brand-hover disabled:opacity-50"
                  >
                    <Save className="h-3.5 w-3.5" strokeWidth={1.8} />
                    Salvar
                  </button>
                </div>
              </div>

              {saveError && (
                <p className="rounded-xl border border-danger/30 bg-danger-subtle px-3 py-2 text-xs font-semibold text-danger">
                  {saveError}
                </p>
              )}

              <div className="space-y-2 border-t border-line pt-3">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink-muted">Tiny ERP</p>
                <TinyOrderActions
                  order={order}
                  sending={tinySending}
                  message={tinyMsg}
                  onSend={() => void handleTinySend()}
                />
                <TinyInvoiceActions
                  order={order}
                  syncing={invoiceSyncing}
                  message={invoiceMsg}
                  onSync={() => void handleInvoiceSync()}
                />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
