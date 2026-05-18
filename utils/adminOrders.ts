export type AdminOrderStatus =
  | 'aguardando_pagamento'
  | 'pagamento_aprovado'
  | 'em_separacao'
  | 'enviado'
  | 'entregue'
  | 'cancelado';

export interface AdminOrderItem {
  sku: string;
  name: string;
  image: string;
  qty: number;
  unitPrice: number;
}

export interface AdminOrderTimelineStep {
  status: AdminOrderStatus;
  label: string;
  date: string;
  done: boolean;
  current?: boolean;
}

export interface AdminOrderDetail {
  id: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    document: string;
  };
  address: {
    street: string;
    number: string;
    district: string;
    city: string;
    state: string;
    zip: string;
    complement: string;
  };
  items: AdminOrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  payment: string;
  paymentCode: string;
  date: string;
  status: AdminOrderStatus;
  coupon: string | null;
  timeline: AdminOrderTimelineStep[];
  history: { date: string; event: string; actor: string }[];
  notes: string;
  trackingCode: string;
  channel: 'Loja Online' | 'Mercado Livre' | 'Admin';
  tinyStatus: 'pendente' | 'pronto' | 'sincronizado';
  invoiceStatus: 'nao_emitida' | 'emitida' | 'cancelada';
}

export const orderStatusMeta: Record<AdminOrderStatus, { label: string; bg: string; text: string; tone: string }> = {
  aguardando_pagamento: { label: 'Aguardando pagamento', bg: 'bg-yellow-500/15', text: 'text-yellow-300', tone: '#facc15' },
  pagamento_aprovado: { label: 'Pagamento aprovado', bg: 'bg-blue-500/15', text: 'text-blue-300', tone: '#60a5fa' },
  em_separacao: { label: 'Em separação', bg: 'bg-purple-500/15', text: 'text-purple-300', tone: '#a855f7' },
  enviado: { label: 'Enviado', bg: 'bg-cyan-500/15', text: 'text-cyan-300', tone: '#22d3ee' },
  entregue: { label: 'Entregue', bg: 'bg-emerald-500/15', text: 'text-emerald-300', tone: '#34d399' },
  cancelado: { label: 'Cancelado', bg: 'bg-red-500/15', text: 'text-red-300', tone: '#f87171' },
};

export const orderStatusFlow: AdminOrderStatus[] = [
  'aguardando_pagamento',
  'pagamento_aprovado',
  'em_separacao',
  'enviado',
  'entregue',
];

export function buildTimeline(status: AdminOrderStatus, baseDate: string): AdminOrderTimelineStep[] {
  if (status === 'cancelado') {
    return [
      { status: 'aguardando_pagamento', label: 'Pedido criado', date: baseDate, done: true },
      { status: 'cancelado', label: 'Pedido cancelado', date: baseDate, done: true, current: true },
    ];
  }

  const currentIndex = orderStatusFlow.indexOf(status);
  return orderStatusFlow.map((step, index) => ({
    status: step,
    label: orderStatusMeta[step].label,
    date: index <= currentIndex ? baseDate : '-',
    done: index <= currentIndex,
    current: index === currentIndex,
  }));
}

export function formatOrderDate(value: string) {
  return new Date(value.replace(' ', 'T')).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const statusMap: Record<string, AdminOrderStatus> = {
  AGUARDANDO_PAGAMENTO: 'aguardando_pagamento',
  PAGAMENTO_APROVADO: 'pagamento_aprovado',
  EM_SEPARACAO: 'em_separacao',
  ENVIADO: 'enviado',
  ENTREGUE: 'entregue',
  CANCELADO: 'cancelado',
  REEMBOLSADO: 'cancelado',
};

export function mapApiOrder(p: Record<string, unknown>): AdminOrderDetail {
  const endereco = (() => {
    try { return JSON.parse(String(p.enderecoSnap ?? '{}')) } catch { return {} }
  })();
  const itens = Array.isArray(p.itens) ? p.itens : [];

  return {
    id: String(p.id),
    customer: {
      name: String(p.compradorNome ?? ''),
      email: String(p.compradorEmail ?? ''),
      phone: String(p.compradorTelefone ?? ''),
      document: String(p.compradorCpf ?? ''),
    },
    address: {
      street: String(endereco.logradouro ?? ''),
      number: String(endereco.numero ?? ''),
      district: String(endereco.bairro ?? ''),
      city: String(endereco.cidade ?? ''),
      state: String(endereco.estado ?? ''),
      zip: String(endereco.cep ?? ''),
      complement: String(endereco.complemento ?? ''),
    },
    items: itens.map((item: Record<string, unknown>) => {
      const produto = typeof item.produto === 'object' && item.produto !== null ? item.produto as Record<string, unknown> : {};
      return {
        sku: String(item.produtoSku ?? ''),
        name: String(item.produtoNome ?? produto['nome'] ?? ''),
        image: String(item.produtoImagem ?? produto['imagemUrl'] ?? ''),
        qty: Number(item.quantidade ?? 1),
        unitPrice: Number(item.precoUnit ?? 0),
      };
    }),
    subtotal: Number(p.subtotal ?? 0),
    discount: Number(p.desconto ?? 0),
    shipping: Number(p.frete ?? 0),
    total: Number(p.total ?? 0),
    payment: String(p.metodoPagamento ?? 'PIX'),
    paymentCode: String(p.pixQrCode ?? ''),
    coupon: (() => {
      const c = p.cupom as Record<string, unknown> | null | undefined;
      return c?.codigo ? String(c.codigo) : null;
    })(),
    status: statusMap[String(p.status)] ?? 'aguardando_pagamento',
    date: String(p.criadoEm ?? new Date().toISOString()),
    timeline: buildTimeline(
      statusMap[String(p.status)] ?? 'aguardando_pagamento',
      new Date(String(p.criadoEm ?? '')).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }),
    ),
    history: [],
    notes: '',
    trackingCode: String(p.codigoRastreio ?? ''),
    channel: 'Loja Online',
    tinyStatus: 'pendente',
    invoiceStatus: 'nao_emitida',
  } as AdminOrderDetail;
}
