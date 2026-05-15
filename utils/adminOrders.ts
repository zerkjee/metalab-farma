import { fmtCurrency } from '@/data/admin';

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

const productPool: AdminOrderItem[] = [
  { sku: 'MTL-0010', name: 'Articulice', image: '/products/articulice.png', qty: 1, unitPrice: 177.90 },
  { sku: 'MTL-0003', name: 'Kit 3 Ademoril', image: '/products/ademoril-kit-3.png', qty: 1, unitPrice: 203.75 },
  { sku: 'MTL-0012', name: 'Biotina', image: '/products/biotina.png', qty: 2, unitPrice: 44.90 },
  { sku: 'MTL-0008', name: 'Kit 2 Apetimax', image: '/products/apetimax-kit-2.png', qty: 1, unitPrice: 98.82 },
  { sku: 'MTL-0014', name: 'Complexo B', image: '/products/complexo_b.png', qty: 2, unitPrice: 38.90 },
  { sku: 'MTL-0004', name: 'Agua Inglesa', image: '/products/agua_inglesa.png', qty: 1, unitPrice: 49.90 },
];

function buildTimeline(status: AdminOrderStatus, baseDate: string): AdminOrderTimelineStep[] {
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

function totals(items: AdminOrderItem[], discount: number, shipping: number) {
  const subtotal = items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
  return {
    subtotal,
    discount,
    shipping,
    total: subtotal - discount + shipping,
  };
}

const customers = [
  ['Larissa Teixeira', 'larissa@email.com', 'Belo Horizonte', 'MG'],
  ['Carlos Mendes', 'carlos@email.com', 'Sao Paulo', 'SP'],
  ['Fernanda Lima', 'fernanda@email.com', 'Curitiba', 'PR'],
  ['Roberto Lima', 'roberto@email.com', 'Florianopolis', 'SC'],
  ['Ana Paula Ferreira', 'ana@email.com', 'Fortaleza', 'CE'],
  ['Diego Cardoso', 'diego@email.com', 'Natal', 'RN'],
  ['Beatriz Santos', 'beatriz@email.com', 'Salvador', 'BA'],
  ['Gustavo Almeida', 'gustavo@email.com', 'Salvador', 'BA'],
] as const;

const statuses: AdminOrderStatus[] = [
  'enviado',
  'entregue',
  'entregue',
  'em_separacao',
  'pagamento_aprovado',
  'cancelado',
  'entregue',
  'aguardando_pagamento',
];

export const mockAdminOrders: AdminOrderDetail[] = customers.map(([name, email, city, state], index) => {
  const id = `#${1092 - index}`;
  const items = index % 3 === 0
    ? [productPool[index % productPool.length], productPool[(index + 2) % productPool.length]]
    : [productPool[index % productPool.length]];
  const discount = index % 2 === 0 ? 18.9 : 0;
  const shipping = index % 4 === 0 ? 0 : 19.9;
  const amounts = totals(items, discount, shipping);
  const date = `2026-05-${String(12 - Math.min(index, 7)).padStart(2, '0')} ${String(9 + index).padStart(2, '0')}:20`;
  const status = statuses[index];

  return {
    id,
    customer: {
      name,
      email,
      phone: `(11) 9${String(8400 + index * 317).padStart(4, '0')}-${String(1200 + index * 91).padStart(4, '0')}`,
      document: `***.${String(120 + index * 17)}.${String(450 + index * 13)}-**`,
    },
    address: {
      street: 'Rua das Fórmulas',
      number: String(120 + index * 8),
      district: 'Centro',
      city,
      state,
      zip: `0${String(1300 + index * 211)}-000`,
      complement: index % 2 === 0 ? 'Apto 402' : 'Casa',
    },
    items,
    ...amounts,
    payment: index % 3 === 0 ? 'Pix' : index % 3 === 1 ? 'Cartão de crédito' : 'Boleto',
    paymentCode: `PAY-${id.replace('#', '')}-${String(8821 + index)}`,
    date,
    status,
    coupon: discount > 0 ? 'VIP10' : null,
    timeline: buildTimeline(status, date),
    history: [
      { date, event: 'Pedido recebido pela loja', actor: 'Sistema' },
      { date, event: `Status atual: ${orderStatusMeta[status].label}`, actor: 'Admin Metalab' },
    ],
    notes: index % 2 === 0 ? 'Cliente solicitou envio discreto e nota fiscal no pacote.' : 'Sem observações internas.',
    trackingCode: status === 'enviado' || status === 'entregue' ? `BR${id.replace('#', '')}MLABR` : '',
    channel: index % 5 === 0 ? 'Mercado Livre' : 'Loja Online',
    tinyStatus: status === 'cancelado' ? 'pendente' : status === 'entregue' ? 'sincronizado' : 'pronto',
    invoiceStatus: status === 'cancelado' ? 'cancelada' : status === 'aguardando_pagamento' ? 'nao_emitida' : 'emitida',
  };
});

export function findAdminOrder(id: string) {
  const normalized = decodeURIComponent(id);
  return mockAdminOrders.find((order) => order.id === normalized || order.id.replace('#', '') === normalized);
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

export function orderSummary(order: AdminOrderDetail) {
  return `${order.items.length} produto${order.items.length === 1 ? '' : 's'} · ${fmtCurrency(order.total)}`;
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
    coupon: null,
    status: statusMap[String(p.status)] ?? 'aguardando_pagamento',
    date: String(p.criadoEm ?? new Date().toISOString()).slice(0, 10),
    timeline: [],
    history: [],
    notes: '',
    trackingCode: String(p.codigoRastreio ?? ''),
    channel: 'Loja Online',
    tinyStatus: 'pendente',
    invoiceStatus: 'nao_emitida',
  } as AdminOrderDetail;
}
