'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronDown, ChevronUp, PackageSearch, ShoppingBag } from 'lucide-react';
import { fmtCurrency, fmtDate } from '@/utils/formatters';

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
  AGUARDANDO_PAGAMENTO: { label: 'Aguardando pagamento', bg: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-700' },
  PAGAMENTO_APROVADO:   { label: 'Pagamento aprovado',   bg: 'bg-blue-50 border-blue-200',     text: 'text-blue-700'   },
  EM_SEPARACAO:         { label: 'Em separação',          bg: 'bg-purple-50 border-purple-200', text: 'text-purple-700' },
  ENVIADO:              { label: 'Enviado',               bg: 'bg-cyan-50 border-cyan-200',     text: 'text-cyan-700'   },
  ENTREGUE:             { label: 'Entregue',              bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700' },
  CANCELADO:            { label: 'Cancelado',             bg: 'bg-red-50 border-red-100',       text: 'text-red-600'    },
  REEMBOLSADO:          { label: 'Reembolsado',           bg: 'bg-red-50 border-red-100',       text: 'text-red-600'    },
};

const PAYMENT_LABEL: Record<string, string> = {
  PIX:            'Pix',
  CARTAO_CREDITO: 'Cartão de crédito',
  CARTAO_DEBITO:  'Cartão de débito',
  BOLETO:         'Boleto',
};

function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] ?? { label: status, bg: 'bg-gray-50 border-gray-200', text: 'text-gray-600' };
  return (
    <span className={`inline-block rounded-full border px-3 py-0.5 text-xs font-bold ${meta.bg} ${meta.text}`}>
      {meta.label}
    </span>
  );
}

// ── order card ────────────────────────────────────────────────────────────────

function OrderCard({ order }: { order: Order }) {
  const [open, setOpen] = useState(false);

  return (
    <article className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      {/* header */}
      <button
        className="w-full text-left px-5 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between hover:bg-gray-50 transition-colors"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-black text-gray-950">{order.numero}</span>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-xs text-gray-400">
            {fmtDate(order.criadoEm)}
            {order.metodoPagamento && (
              <> · {PAYMENT_LABEL[order.metodoPagamento] ?? order.metodoPagamento}</>
            )}
            {' · '}{order.itens.length} {order.itens.length === 1 ? 'produto' : 'produtos'}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-base font-black text-[#6b21a8]">{fmtCurrency(Number(order.total))}</span>
          {open
            ? <ChevronUp className="h-4 w-4 text-gray-400 shrink-0" strokeWidth={2} />
            : <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" strokeWidth={2} />}
        </div>
      </button>

      {/* expanded */}
      {open && (
        <div className="border-t border-gray-100 px-5 py-4 flex flex-col gap-4">

          {/* items */}
          <ul className="flex flex-col gap-3">
            {order.itens.map((item) => (
              <li key={item.id} className="flex items-center gap-3">
                {item.produtoImagem ? (
                  <img
                    src={item.produtoImagem}
                    alt={item.produtoNome}
                    className="h-12 w-12 rounded-xl object-cover border border-gray-100 shrink-0"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-xl bg-gray-100 shrink-0 flex items-center justify-center">
                    <ShoppingBag className="h-5 w-5 text-gray-300" strokeWidth={1.5} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{item.produtoNome}</p>
                  <p className="text-xs text-gray-400">{item.quantidade}× {fmtCurrency(Number(item.precoUnit))}</p>
                </div>
                <span className="text-sm font-black text-gray-800 shrink-0">{fmtCurrency(Number(item.subtotal))}</span>
              </li>
            ))}
          </ul>

          {/* totals */}
          <div className="rounded-xl bg-gray-50 px-4 py-3 text-sm flex flex-col gap-1.5">
            {Number(order.desconto) > 0 && (
              <div className="flex justify-between text-gray-500">
                <span>Desconto</span>
                <span className="text-emerald-600 font-semibold">−{fmtCurrency(Number(order.desconto))}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-500">
              <span>Frete</span>
              <span>{Number(order.frete) === 0 ? <span className="text-emerald-600 font-semibold">Grátis</span> : fmtCurrency(Number(order.frete))}</span>
            </div>
            <div className="flex justify-between font-black text-gray-950 pt-1 border-t border-gray-200 mt-0.5">
              <span>Total</span>
              <span>{fmtCurrency(Number(order.total))}</span>
            </div>
          </div>

          {/* tracking */}
          {order.codigoRastreio && (
            <div className="rounded-xl border border-cyan-100 bg-cyan-50 px-4 py-3">
              <p className="text-xs font-semibold text-cyan-700">Código de rastreio</p>
              <p className="mt-0.5 font-mono text-sm font-bold text-gray-900">{order.codigoRastreio}</p>
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
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login?callbackUrl=/pedidos');
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    setFetchError(false);
    fetch('/api/pedidos')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false));
  }, [status]);

  if (status === 'loading' || (status === 'unauthenticated')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#6b21a8] border-t-transparent" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">

        {/* page header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-[#6b21a8] transition-colors mb-4">
            ← Voltar para a loja
          </Link>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6b21a8]">Área do cliente</p>
          <h1 className="mt-1 text-3xl font-black text-gray-950">Meus pedidos</h1>
          {session?.user?.name && (
            <p className="mt-1 text-sm text-gray-400">Olá, {session.user.name.split(' ')[0]}!</p>
          )}
        </div>

        {/* content */}
        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-gray-200" />
            ))}
          </div>
        ) : fetchError ? (
          <div className="flex flex-col items-center gap-5 rounded-3xl border border-red-100 bg-red-50 py-16 px-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-3xl">⚠️</div>
            <div>
              <p className="text-lg font-black text-gray-950">Erro ao carregar pedidos</p>
              <p className="mt-1 text-sm text-gray-500">Verifique sua conexão e tente novamente.</p>
            </div>
            <button
              onClick={() => { setFetchError(false); setLoading(true); fetch('/api/pedidos').then((r) => r.json()).then((data) => setOrders(Array.isArray(data) ? data : [])).catch(() => setFetchError(true)).finally(() => setLoading(false)); }}
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-2.5 text-sm font-bold text-red-600 transition-all hover:bg-red-50"
            >
              Tentar novamente
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center gap-5 rounded-3xl border border-gray-100 bg-white py-16 px-8 text-center shadow-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-50">
              <PackageSearch className="h-8 w-8 text-[#6b21a8]" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-lg font-black text-gray-950">Nenhum pedido ainda</p>
              <p className="mt-1 text-sm text-gray-400">Suas compras aparecerão aqui após a finalização.</p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-black text-white transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #6b21a8, #7c3aed)' }}
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
