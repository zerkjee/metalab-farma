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

function Timeline({ order }: { order: AdminOrderDetail }) {
  const steps = order.status === 'cancelado'
    ? order.timeline
    : orderStatusFlow.map((status) => order.timeline.find((step) => step.status === status)).filter(Boolean);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <h3 className="mb-5 text-sm font-black text-white">Timeline do pedido</h3>
      <div className="flex flex-col gap-0">
        {steps.map((step, index) => step && (
          <div key={`${step.status}-${index}`} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                  step.done ? 'border-purple-500 bg-purple-600 shadow-lg shadow-purple-950/30' : 'border-slate-600 bg-slate-950'
                }`}
              >
                {step.done && <PackageCheck className="h-3.5 w-3.5 text-white" strokeWidth={2.2} />}
              </div>
              {index < steps.length - 1 && (
                <div className={`my-1 min-h-9 w-0.5 flex-1 ${step.done ? 'bg-purple-500/40' : 'bg-slate-700'}`} />
              )}
            </div>
            <div className="pb-5">
              <p className={`text-sm font-semibold ${step.done ? 'text-slate-100' : 'text-slate-600'}`}>
                {step.label}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">{step.date}</p>
              {step.current && (
                <span className="mt-2 inline-flex rounded-full bg-purple-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-purple-300">
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
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/70 p-8 text-center">
        <p className="text-xl font-black text-white">Pedido não encontrado</p>
        <p className="mt-2 text-sm text-slate-500">Verifique o ID e tente novamente.</p>
        <Link href="/admin/pedidos" className="mt-5 rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white">
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

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/admin/pedidos')}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-slate-400 transition-all hover:bg-slate-700 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.8} />
          </button>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-purple-400">Detalhe do pedido</p>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-black text-white">{order.id}</h2>
              <StatusBadge label={status.label} color={`${status.bg} ${status.text}`} />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={printOrder}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-300 transition-all hover:bg-slate-700"
          >
            <Printer className="h-4 w-4" strokeWidth={1.8} />
            Imprimir
          </button>
          <button
            onClick={() => copyCode(order.paymentCode)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-300 transition-all hover:bg-slate-700"
          >
            <Copy className="h-4 w-4" strokeWidth={1.8} />
            Copiar código
          </button>
          <button
            onClick={() => void updateStatus('enviado')}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-500/10 px-4 py-2.5 text-sm font-semibold text-cyan-300 transition-all hover:bg-cyan-500/15 disabled:opacity-50"
          >
            <Send className="h-4 w-4" strokeWidth={1.8} />
            Marcar enviado
          </button>
          <button
            onClick={() => void updateStatus('cancelado')}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-300 transition-all hover:bg-red-500/15 disabled:opacity-50"
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
            <div key={item.label} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
              <Icon className="mb-3 h-4 w-4 text-purple-300" strokeWidth={1.8} />
              <p className="text-xs text-slate-500">{item.label}</p>
              <p className="mt-1 text-2xl font-black text-white">{item.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <main className="space-y-5">
          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-sm font-black text-white">Produtos do pedido</h3>
              <p className="text-xs text-slate-500">{formatOrderDate(order.date)}</p>
            </div>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.sku} className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 sm:grid-cols-[56px_1fr_80px_120px] sm:items-center">
                  <div className="h-14 w-14 rounded-xl bg-slate-800 bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url(${item.image})` }} />
                  <div>
                    <p className="text-sm font-bold text-white">{item.name}</p>
                    <p className="text-xs text-slate-500">{item.sku}</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-300">{item.qty} un.</p>
                  <p className="text-sm font-black text-white">{fmtCurrency(item.qty * item.unitPrice)}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
              <h3 className="mb-4 text-sm font-black text-white">Cliente</h3>
              <p className="text-sm font-bold text-white">{order.customer.name}</p>
              <p className="mt-1 text-xs text-slate-400">{order.customer.email}</p>
              <p className="text-xs text-slate-400">{order.customer.phone}</p>
              <p className="mt-3 text-xs text-slate-500">Documento: {order.customer.document}</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
              <h3 className="mb-4 text-sm font-black text-white">Endereço</h3>
              <p className="text-sm font-bold text-white">{order.address.street}, {order.address.number}</p>
              <p className="mt-1 text-xs text-slate-400">{order.address.complement} · {order.address.district}</p>
              <p className="text-xs text-slate-400">{order.address.city}/{order.address.state} · {order.address.zip}</p>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <h3 className="mb-4 text-sm font-black text-white">Histórico</h3>
            <div className="space-y-3">
              {order.history.map((entry, index) => (
                <div key={`${entry.event}-${index}`} className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
                  <p className="text-sm font-semibold text-slate-200">{entry.event}</p>
                  <p className="mt-1 text-xs text-slate-500">{entry.date} · {entry.actor}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <h3 className="mb-4 text-sm font-black text-white">Observações internas</h3>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              className="min-h-28 w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-200 outline-none transition-all focus:border-purple-500"
            />
          </section>
        </main>

        <aside className="space-y-5 xl:sticky xl:top-20 xl:self-start">
          <Timeline order={order} />

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <h3 className="mb-4 text-sm font-black text-white">Operação</h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs text-slate-400">Atualizar status</label>
                <select
                  value={order.status}
                  onChange={(event) => void updateStatus(event.target.value as AdminOrderStatus)}
                  disabled={saving}
                  className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-purple-500 disabled:opacity-50"
                >
                  {(['aguardando_pagamento', 'pagamento_aprovado', 'em_separacao', 'enviado', 'entregue', 'cancelado'] as AdminOrderStatus[]).map((item) => (
                    <option key={item} value={item}>{orderStatusMeta[item].label}</option>
                  ))}
                </select>
              </div>

              <div className="rounded-xl bg-slate-950/60 p-3">
                <p className="text-xs text-slate-500">Pagamento</p>
                <p className="mt-1 text-sm font-bold text-white">{order.payment}</p>
                <p className="text-xs text-slate-500">{order.paymentCode}</p>
              </div>

              <div className="rounded-xl bg-slate-950/60 p-3">
                <p className="text-xs text-slate-500">Cupom</p>
                <p className="mt-1 text-sm font-bold text-white">{order.coupon ?? 'Sem cupom'}</p>
              </div>

              <div>
                <label className="mb-1 block text-xs text-slate-400">Código de rastreio</label>
                <div className="flex gap-2">
                  <input
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value)}
                    placeholder="Aguardando envio"
                    className="flex-1 rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-200 outline-none focus:border-purple-500 placeholder:text-slate-600"
                  />
                  <button
                    onClick={() => void saveTrackingCode()}
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-3 py-2 text-xs font-semibold text-white transition-all hover:bg-purple-500 disabled:opacity-50"
                  >
                    <Save className="h-3.5 w-3.5" strokeWidth={1.8} />
                    Salvar
                  </button>
                </div>
              </div>

              {saveError && (
                <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-400">
                  {saveError}
                </p>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-slate-950/60 p-3">
                  <p className="text-xs text-slate-500">Tiny</p>
                  <p className="mt-1 text-xs font-bold text-slate-200">{order.tinyStatus}</p>
                </div>
                <div className="rounded-xl bg-slate-950/60 p-3">
                  <p className="text-xs text-slate-500">Nota fiscal</p>
                  <p className="mt-1 text-xs font-bold text-slate-200">{order.invoiceStatus.replace('_', ' ')}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-purple-700/30 bg-purple-600/10 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple-300">Estrutura futura</p>
            <p className="mt-2 text-xs leading-5 text-slate-400">
              Preparado para backend real, Tiny, Mercado Livre, logística, rastreamento, notas fiscais e automações.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
