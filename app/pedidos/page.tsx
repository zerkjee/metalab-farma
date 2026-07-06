'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { AlertTriangle, ChevronDown, ChevronUp, PackageSearch, ShoppingBag } from 'lucide-react';
import { fmtCurrency, fmtDate } from '@/utils/formatters';
import { lerPedidosLocais } from '@/lib/pedidosLocais';

// ── types ─────────────────────────────────────────────────────────────────────

interface OrderItem {
  id: string;
  produtoNome: string;
  produtoImagem: string | null;
  quantidade: number;
  precoUnit: number;
  subtotal: number;
}

interface Order {
  id: string;
  numero: string;
  status: string;
  total: number;
  subtotal: number;
  desconto: number;
  frete: number;
  metodoPagamento: string | null;
  criadoEm: string;
  codigoRastreio: string | null;
  pago: boolean;
  itens: OrderItem[];
}

// ── helpers ───────────────────────────────────────────────────────────────────

const STATUS_META: Record<string, { label: string; bg: string; text: string }> = {
  AGUARDANDO_PAGAMENTO: { label: 'Aguardando pagamento', bg: 'bg-warning-subtle', text: 'text-warning' },
  PAGAMENTO_APROVADO:   { label: 'Pagamento aprovado',   bg: 'bg-brand-subtle',   text: 'text-brand-700' },
  EM_SEPARACAO:         { label: 'Em separação',         bg: 'bg-brand-subtle',   text: 'text-brand-700' },
  ENVIADO:              { label: 'Enviado',              bg: 'bg-navy-50',       text: 'text-navy'      },
  ENTREGUE:             { label: 'Entregue',              bg: 'bg-success-subtle', text: 'text-success'  },
  CANCELADO:            { label: 'Cancelado',             bg: 'bg-danger-subtle',  text: 'text-danger'   },
  REEMBOLSADO:          { label: 'Reembolsado',           bg: 'bg-danger-subtle',  text: 'text-danger'   },
};

const PAYMENT_LABEL: Record<string, string> = {
  PIX:            'Pix',
  CARTAO_CREDITO: 'Cartão de crédito',
  CARTAO_DEBITO:  'Cartão de débito',
  BOLETO:         'Boleto',
};

function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] ?? { label: status, bg: 'bg-neutral-100', text: 'text-ink-secondary' };
  return (
    <span className={`inline-block rounded-full px-3 py-0.5 text-xs font-bold ${meta.bg} ${meta.text}`}>
      {meta.label}
    </span>
  );
}

// ── order card ────────────────────────────────────────────────────────────────

function OrderCard({ order }: { order: Order }) {
  const [open, setOpen] = useState(false);

  return (
    <article className="rounded-2xl border border-line bg-surface-card shadow-sm overflow-hidden">
      {/* header */}
      <button
        className="w-full text-left px-5 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between hover:bg-surface-sunken transition-colors"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-bold text-navy">{order.numero}</span>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-xs text-ink-muted">
            {fmtDate(order.criadoEm)}
            {order.metodoPagamento && (
              <> · {PAYMENT_LABEL[order.metodoPagamento] ?? order.metodoPagamento}</>
            )}
            {' · '}{order.itens.length} {order.itens.length === 1 ? 'produto' : 'produtos'}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <span className="font-display text-base font-semibold text-navy">{fmtCurrency(Number(order.total))}</span>
          {open
            ? <ChevronUp className="h-4 w-4 text-ink-muted shrink-0" strokeWidth={2} />
            : <ChevronDown className="h-4 w-4 text-ink-muted shrink-0" strokeWidth={2} />}
        </div>
      </button>

      {/* expanded */}
      {open && (
        <div className="border-t border-line px-5 py-4 flex flex-col gap-4">

          {/* items */}
          <ul className="flex flex-col gap-3">
            {order.itens.map((item) => (
              <li key={item.id} className="flex items-center gap-3">
                {item.produtoImagem ? (
                  <Image
                    src={item.produtoImagem}
                    alt={item.produtoNome}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-xl object-cover border border-line shrink-0"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-xl bg-surface-sunken shrink-0 flex items-center justify-center">
                    <ShoppingBag className="h-5 w-5 text-neutral-300" strokeWidth={1.5} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-display text-sm font-semibold text-navy truncate">{item.produtoNome}</p>
                  <p className="text-xs text-ink-muted">{item.quantidade}× {fmtCurrency(Number(item.precoUnit))}</p>
                </div>
                <span className="text-sm font-semibold text-ink shrink-0">{fmtCurrency(Number(item.subtotal))}</span>
              </li>
            ))}
          </ul>

          {/* totals */}
          <div className="rounded-xl bg-surface-sunken px-4 py-3 text-sm flex flex-col gap-1.5">
            {Number(order.desconto) > 0 && (
              <div className="flex justify-between text-ink-secondary">
                <span>Desconto</span>
                <span className="text-success font-semibold">−{fmtCurrency(Number(order.desconto))}</span>
              </div>
            )}
            <div className="flex justify-between text-ink-secondary">
              <span>Frete</span>
              <span>{Number(order.frete) === 0 ? <span className="text-success font-semibold">Grátis</span> : fmtCurrency(Number(order.frete))}</span>
            </div>
            <div className="flex justify-between font-display font-semibold text-navy pt-1 border-t border-line-default mt-0.5">
              <span>Total</span>
              <span>{fmtCurrency(Number(order.total))}</span>
            </div>
          </div>

          {/* tracking */}
          {order.codigoRastreio && (
            <div className="rounded-xl border border-brand/20 bg-brand-subtle px-4 py-3">
              <p className="text-xs font-semibold text-brand-700">Código de rastreio</p>
              <p className="mt-0.5 font-mono text-sm font-bold text-navy">{order.codigoRastreio}</p>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

// ── page ──────────────────────────────────────────────────────────────────────

export default function PedidosPage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  const isGuest = status === 'unauthenticated';

  // load() só busca os dados (sem setState). O setState fica nos callbacks de run().
  const load = useCallback(async (): Promise<Order[]> => {
    if (status === 'authenticated') {
      const r = await fetch('/api/pedidos');
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      return Array.isArray(data) ? (data as Order[]) : [];
    }
    // Convidado: acompanha pelos pedidos salvos neste navegador (sem login).
    const refs = lerPedidosLocais();
    const results = await Promise.all(
      refs.map((ref) =>
        fetch(`/api/pedidos/${ref.id}/status`)
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null),
      ),
    );
    return results.filter(Boolean) as Order[];
  }, [status]);

  const run = useCallback(() => {
    load()
      .then((o) => { setOrders(o); setFetchError(false); })
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false));
  }, [load]);

  useEffect(() => {
    if (status === 'loading') return;
    run();
  }, [status, run]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-page">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-navy border-t-transparent" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-surface-page">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">

        {/* page header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted hover:text-navy transition-colors mb-4">
            ← Voltar para a loja
          </Link>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-navy">Área do cliente</p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-navy">Meus pedidos</h1>
          {session?.user?.name && (
            <p className="mt-1 text-sm text-ink-muted">Olá, {session.user.name.split(' ')[0]}!</p>
          )}
          {isGuest && (
            <p className="mt-1 text-sm text-ink-muted">
              Mostrando pedidos salvos neste dispositivo.{' '}
              <Link href="/login?callbackUrl=/pedidos" className="font-semibold text-navy hover:underline">Entrar</Link>{' '}para ver todos da sua conta.
            </p>
          )}
        </div>

        {/* content */}
        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-neutral-100" />
            ))}
          </div>
        ) : fetchError ? (
          <div className="flex flex-col items-center gap-5 rounded-3xl border border-danger/20 bg-danger-subtle py-16 px-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-card text-danger">
              <AlertTriangle className="h-8 w-8" strokeWidth={1.6} />
            </div>
            <div>
              <p className="font-display text-lg font-semibold text-navy">Erro ao carregar pedidos</p>
              <p className="mt-1 text-sm text-ink-secondary">Verifique sua conexão e tente novamente.</p>
            </div>
            <button
              onClick={() => { setLoading(true); run(); }}
              className="inline-flex items-center gap-2 rounded-full border border-danger/30 bg-surface-card px-5 py-2.5 text-sm font-bold text-danger transition-all hover:bg-danger-subtle"
            >
              Tentar novamente
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center gap-5 rounded-3xl border border-line bg-surface-card py-16 px-8 text-center shadow-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100">
              <PackageSearch className="h-8 w-8 text-navy" strokeWidth={1.5} />
            </div>
            <div>
              <p className="font-display text-lg font-semibold text-navy">Nenhum pedido ainda</p>
              <p className="mt-1 text-sm text-ink-muted">Suas compras aparecerão aqui após a finalização.</p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-bold text-on-brand transition-all hover:bg-brand-hover"
            >
              <ShoppingBag className="h-4 w-4" strokeWidth={1.8} />
              Ver produtos
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
