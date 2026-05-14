export type OrderStatus = 'pendente' | 'confirmado' | 'processando' | 'enviado' | 'entregue' | 'cancelado';
export type ProductStatus = 'ativo' | 'inativo' | 'sem_estoque';
export type CustomerLevel = 'silver' | 'gold' | 'black';

export interface AdminOrder {
  id: string;
  customer: string;
  email: string;
  city: string;
  state: string;
  date: string;
  total: number;
  status: OrderStatus;
  items: number;
  payment: string;
  timeline: { label: string; date: string; done: boolean }[];
}

export interface AdminProduct {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  sold: number;
  status: ProductStatus;
  image: string;
  color: string;
}

export interface AdminCustomer {
  id: number;
  name: string;
  email: string;
  city: string;
  state: string;
  level: CustomerLevel;
  orders: number;
  totalSpent: number;
  cashback: number;
  joined: string;
  lastOrder: string;
}

export interface AdminBanner {
  id: number;
  title: string;
  subtitle: string;
  cta: string;
  ctaHref: string;
  image: string;
  active: boolean;
  order: number;
  bg: string;
  accent: string;
  campaign: string;
}

// ── Dashboard stats ──────────────────────────────────────────────────

export const dashboardStats = {
  faturamento: { value: 47832.50, change: 12.3, up: true, prefix: 'R$' },
  pedidos:     { value: 312,      change: 8.7,  up: true, prefix: '' },
  clientes:    { value: 1847,     change: 5.2,  up: true, prefix: '' },
  ticketMedio: { value: 153.30,   change: 3.1,  up: true, prefix: 'R$' },
  cupons:      { value: 89,       change: 15.4, up: true, prefix: '' },
  conversao:   { value: 3.2,      change: 0.4,  up: false, prefix: '', suffix: '%' },
};

// Revenue chart — últimos 14 dias
export const revenueChart = [
  { label: '25/04', value: 2100 }, { label: '26/04', value: 3400 },
  { label: '27/04', value: 2800 }, { label: '28/04', value: 4200 },
  { label: '29/04', value: 3900 }, { label: '30/04', value: 5100 },
  { label: '01/05', value: 4600 }, { label: '02/05', value: 3800 },
  { label: '03/05', value: 5800 }, { label: '04/05', value: 5200 },
  { label: '05/05', value: 6100 }, { label: '06/05', value: 5700 },
  { label: '07/05', value: 7200 }, { label: '08/05', value: 6800 },
];

// Visitors chart
export const visitorsChart = [
  { label: '25/04', value: 420 }, { label: '26/04', value: 610 },
  { label: '27/04', value: 530 }, { label: '28/04', value: 780 },
  { label: '29/04', value: 710 }, { label: '30/04', value: 920 },
  { label: '01/05', value: 840 }, { label: '02/05', value: 690 },
  { label: '03/05', value: 1050 }, { label: '04/05', value: 960 },
  { label: '05/05', value: 1120 }, { label: '06/05', value: 1040 },
  { label: '07/05', value: 1380 }, { label: '08/05', value: 1260 },
];

// Top products
export const topProducts = [
  { name: 'Articulice', sold: 87, revenue: 15471.30, pct: 100, color: '#6b21a8' },
  { name: 'Ademoril',   sold: 72, revenue: 5752.80,  pct: 83,  color: '#31629c' },
  { name: 'Apetimax',   sold: 61, revenue: 3348.90,  pct: 70,  color: '#c6e0eb' },
  { name: 'Kit 3 Apetimax', sold: 48, revenue: 6719.52, pct: 55, color: '#c6e0eb' },
  { name: 'Água Inglesa', sold: 41, revenue: 2045.90, pct: 47,  color: '#861878' },
];

// Category distribution
export const categoryChart = [
  { label: 'Articulações', value: 34, color: '#7c3aed' },
  { label: 'Vitaminas', value: 22, color: '#0ea5e9' },
  { label: 'Digestão', value: 18, color: '#10b981' },
  { label: 'Cabelo/Pele', value: 14, color: '#f59e0b' },
  { label: 'Outros', value: 12, color: '#6b7280' },
];

// ── Orders ───────────────────────────────────────────────────────────

export const orders: AdminOrder[] = [
  {
    id: '#1092', customer: 'Larissa Teixeira', email: 'larissa@email.com',
    city: 'Belo Horizonte', state: 'MG', date: '2025-05-08', total: 139.99,
    status: 'enviado', items: 1, payment: 'Pix',
    timeline: [
      { label: 'Pedido realizado', date: '08/05 09:14', done: true },
      { label: 'Pagamento confirmado', date: '08/05 09:16', done: true },
      { label: 'Em separação', date: '08/05 11:00', done: true },
      { label: 'Enviado', date: '08/05 14:30', done: true },
      { label: 'Entregue', date: '—', done: false },
    ],
  },
  {
    id: '#1091', customer: 'Carlos Mendes', email: 'carlos@email.com',
    city: 'São Paulo', state: 'SP', date: '2025-05-08', total: 203.75,
    status: 'entregue', items: 1, payment: 'Cartão de crédito',
    timeline: [
      { label: 'Pedido realizado', date: '07/05 16:22', done: true },
      { label: 'Pagamento confirmado', date: '07/05 16:25', done: true },
      { label: 'Em separação', date: '07/05 18:00', done: true },
      { label: 'Enviado', date: '07/05 20:10', done: true },
      { label: 'Entregue', date: '08/05 11:45', done: true },
    ],
  },
  {
    id: '#1090', customer: 'Fernanda Lima', email: 'fernanda@email.com',
    city: 'Curitiba', state: 'PR', date: '2025-05-07', total: 79.90,
    status: 'entregue', items: 1, payment: 'Pix',
    timeline: [
      { label: 'Pedido realizado', date: '06/05 10:30', done: true },
      { label: 'Pagamento confirmado', date: '06/05 10:32', done: true },
      { label: 'Em separação', date: '06/05 14:00', done: true },
      { label: 'Enviado', date: '06/05 17:00', done: true },
      { label: 'Entregue', date: '07/05 13:20', done: true },
    ],
  },
  {
    id: '#1089', customer: 'Roberto Lima', email: 'roberto@email.com',
    city: 'Florianópolis', state: 'SC', date: '2025-05-07', total: 177.90,
    status: 'processando', items: 1, payment: 'Boleto',
    timeline: [
      { label: 'Pedido realizado', date: '07/05 08:00', done: true },
      { label: 'Pagamento confirmado', date: '07/05 09:15', done: true },
      { label: 'Em separação', date: '07/05 10:00', done: true },
      { label: 'Enviado', date: '—', done: false },
      { label: 'Entregue', date: '—', done: false },
    ],
  },
  {
    id: '#1088', customer: 'Ana Paula Ferreira', email: 'ana@email.com',
    city: 'Fortaleza', state: 'CE', date: '2025-05-06', total: 143.82,
    status: 'entregue', items: 1, payment: 'Pix',
    timeline: [
      { label: 'Pedido realizado', date: '05/05 14:00', done: true },
      { label: 'Pagamento confirmado', date: '05/05 14:02', done: true },
      { label: 'Em separação', date: '05/05 16:00', done: true },
      { label: 'Enviado', date: '05/05 18:30', done: true },
      { label: 'Entregue', date: '06/05 15:00', done: true },
    ],
  },
  {
    id: '#1087', customer: 'Diego Cardoso', email: 'diego@email.com',
    city: 'Natal', state: 'RN', date: '2025-05-06', total: 54.90,
    status: 'cancelado', items: 1, payment: 'Cartão de crédito',
    timeline: [
      { label: 'Pedido realizado', date: '06/05 11:00', done: true },
      { label: 'Pagamento recusado', date: '06/05 11:02', done: true },
      { label: 'Cancelado', date: '06/05 11:05', done: true },
      { label: 'Enviado', date: '—', done: false },
      { label: 'Entregue', date: '—', done: false },
    ],
  },
  {
    id: '#1086', customer: 'Beatriz Santos', email: 'beatriz@email.com',
    city: 'Salvador', state: 'BA', date: '2025-05-05', total: 354.80,
    status: 'entregue', items: 2, payment: 'Pix',
    timeline: [
      { label: 'Pedido realizado', date: '04/05 09:00', done: true },
      { label: 'Pagamento confirmado', date: '04/05 09:02', done: true },
      { label: 'Em separação', date: '04/05 12:00', done: true },
      { label: 'Enviado', date: '04/05 16:00', done: true },
      { label: 'Entregue', date: '05/05 14:30', done: true },
    ],
  },
  {
    id: '#1085', customer: 'Gustavo Almeida', email: 'gustavo@email.com',
    city: 'Salvador', state: 'BA', date: '2025-05-04', total: 98.82,
    status: 'pendente', items: 1, payment: 'Boleto',
    timeline: [
      { label: 'Pedido realizado', date: '04/05 17:30', done: true },
      { label: 'Aguardando pagamento', date: '—', done: false },
      { label: 'Em separação', date: '—', done: false },
      { label: 'Enviado', date: '—', done: false },
      { label: 'Entregue', date: '—', done: false },
    ],
  },
];

// ── Products ─────────────────────────────────────────────────────────

export const adminProducts: AdminProduct[] = [
  { id: 1,  name: 'Ademoril',           category: 'Suplementos',    price: 79.90,  stock: 20, sold: 72, status: 'ativo',       image: '/products/ademoril.png',        color: '#31629c' },
  { id: 2,  name: 'Kit 2 Ademoril',     category: 'Kits',           price: 143.82, stock: 15, sold: 41, status: 'ativo',       image: '/products/ademoril-kit-2.png',  color: '#31629c' },
  { id: 3,  name: 'Kit 3 Ademoril',     category: 'Kits',           price: 203.75, stock: 10, sold: 28, status: 'ativo',       image: '/products/ademoril-kit-3.png',  color: '#31629c' },
  { id: 4,  name: 'Água Inglesa',       category: 'Suplementos',    price: 49.90,  stock: 20, sold: 41, status: 'ativo',       image: '/products/agua_inglesa.png',    color: '#861878' },
  { id: 5,  name: 'Kit 2 Água Inglesa', category: 'Kits',           price: 89.82,  stock: 15, sold: 19, status: 'ativo',       image: '/products/agua_inglesa-kit-2.png', color: '#861878' },
  { id: 7,  name: 'Apetimax',           category: 'Suplementos',    price: 54.90,  stock: 20, sold: 61, status: 'ativo',       image: '/products/apetimax.png',        color: '#c6e0eb' },
  { id: 8,  name: 'Kit 2 Apetimax',     category: 'Kits',           price: 98.82,  stock: 15, sold: 33, status: 'ativo',       image: '/products/apetimax-kit-2.png',  color: '#c6e0eb' },
  { id: 9,  name: 'Kit 3 Apetimax',     category: 'Kits',           price: 139.99, stock: 10, sold: 48, status: 'ativo',       image: '/products/apetimax-kit-3.png',  color: '#c6e0eb' },
  { id: 10, name: 'Articulice',         category: 'Articulações',   price: 177.90, stock: 20, sold: 87, status: 'ativo',       image: '/products/articulice.png',      color: '#6b21a8' },
  { id: 11, name: 'Azigov',             category: 'Suplementos',    price: 62.90,  stock: 0,  sold: 24, status: 'sem_estoque', image: '/products/azigov.png',          color: '#0f766e' },
  { id: 12, name: 'Biotina',            category: 'Cabelo/Pele',    price: 44.90,  stock: 8,  sold: 31, status: 'ativo',       image: '/products/biotina.png',         color: '#d97706' },
  { id: 13, name: 'Cogniflex',          category: 'Bem-Estar',      price: 129.90, stock: 12, sold: 18, status: 'ativo',       image: '/products/cogniflex.png',       color: '#7c3aed' },
  { id: 14, name: 'Complexo B',         category: 'Vitaminas',      price: 38.90,  stock: 0,  sold: 45, status: 'sem_estoque', image: '/products/complexo_b.png',      color: '#2563eb' },
  { id: 15, name: 'Dermatrox',          category: 'Cabelo/Pele',    price: 89.90,  stock: 5,  sold: 12, status: 'ativo',       image: '/products/dermatrox.png',       color: '#be185d' },
  { id: 16, name: 'Q10',                category: 'Antioxidantes',  price: 94.90,  stock: 0,  sold: 0,  status: 'inativo',     image: '/products/q10.png',             color: '#92400e' },
];

// ── Customers ────────────────────────────────────────────────────────

export const adminCustomers: AdminCustomer[] = [
  { id: 1,  name: 'Mariana Costa',      email: 'mariana@email.com',   city: 'São Paulo',      state: 'SP', level: 'gold',   orders: 5, totalSpent: 891.50,  cashback: 44.57, joined: '2024-08-15', lastOrder: '2025-04-28' },
  { id: 2,  name: 'Carlos Mendes',      email: 'carlos@email.com',    city: 'BH',             state: 'MG', level: 'gold',   orders: 4, totalSpent: 703.20,  cashback: 35.16, joined: '2024-09-01', lastOrder: '2025-05-08' },
  { id: 3,  name: 'Roberto Lima',       email: 'roberto@email.com',   city: 'Florianópolis',  state: 'SC', level: 'black',  orders: 9, totalSpent: 2341.80, cashback: 187.34, joined: '2024-07-10', lastOrder: '2025-05-07' },
  { id: 4,  name: 'Beatriz Santos',     email: 'beatriz@email.com',   city: 'Salvador',       state: 'BA', level: 'gold',   orders: 6, totalSpent: 1089.40, cashback: 54.47, joined: '2024-10-05', lastOrder: '2025-05-05' },
  { id: 5,  name: 'Ana Paula Ferreira', email: 'ana@email.com',       city: 'Fortaleza',      state: 'CE', level: 'silver', orders: 2, totalSpent: 223.72,  cashback: 4.47,  joined: '2025-02-20', lastOrder: '2025-05-06' },
  { id: 6,  name: 'Fernanda Lima',      email: 'fernanda@email.com',  city: 'Curitiba',       state: 'PR', level: 'silver', orders: 3, totalSpent: 334.70,  cashback: 6.69,  joined: '2025-01-12', lastOrder: '2025-05-07' },
  { id: 7,  name: 'Thiago Rodrigues',   email: 'thiago@email.com',    city: 'Recife',         state: 'PE', level: 'gold',   orders: 4, totalSpent: 652.30,  cashback: 32.61, joined: '2024-11-08', lastOrder: '2025-04-22' },
  { id: 8,  name: 'Larissa Teixeira',   email: 'larissa@email.com',   city: 'BH',             state: 'MG', level: 'gold',   orders: 7, totalSpent: 1432.90, cashback: 71.64, joined: '2024-08-25', lastOrder: '2025-05-08' },
  { id: 9,  name: 'Diego Cardoso',      email: 'diego@email.com',     city: 'Natal',          state: 'RN', level: 'silver', orders: 2, totalSpent: 194.80,  cashback: 3.89,  joined: '2025-03-01', lastOrder: '2025-05-06' },
  { id: 10, name: 'Luciana Martins',    email: 'luciana@email.com',   city: 'Goiânia',        state: 'GO', level: 'black',  orders: 12, totalSpent: 3892.60, cashback: 311.40, joined: '2024-06-15', lastOrder: '2025-04-30' },
];

// ── Banners (admin view) ─────────────────────────────────────────────

export const adminBanners: AdminBanner[] = [
  {
    id: 1,
    title: 'Qualidade e Tecnologia',
    subtitle: 'Formulações exclusivas, insumos selecionados e embalagem lacrada.',
    cta: 'Ver Produtos',
    ctaHref: '#produtos',
    image: '/products/articulice.png',
    active: true,
    order: 1,
    bg: 'linear-gradient(135deg, #1a0533, #2d1654, #1e3a5f)',
    accent: '#c084fc',
    campaign: 'Institucional',
  },
  {
    id: 2,
    title: 'Kits com até 30% OFF',
    subtitle: 'Compre Kit 2 ou Kit 3 e economize mais na sua rotina.',
    cta: 'Ver Kits',
    ctaHref: '#produtos',
    image: '/products/ademoril-kit-3.png',
    active: true,
    order: 2,
    bg: 'linear-gradient(135deg, #1e1b4b, #312e81, #1e3a5f)',
    accent: '#a5b4fc',
    campaign: 'Promoção',
  },
  {
    id: 3,
    title: 'Mais de 12.400 Clientes',
    subtitle: 'Clientes de todo o Brasil confiam na Metalab Store.',
    cta: 'Ver Avaliações',
    ctaHref: '/avaliacoes',
    image: '/products/biotina.png',
    active: true,
    order: 3,
    bg: 'linear-gradient(135deg, #0c1a35, #1e3a5f, #1a2744)',
    accent: '#7dd3fc',
    campaign: 'Prova social',
  },
  {
    id: 4,
    title: 'Produto Lacrado',
    subtitle: 'Procedência, nota fiscal e segurança em cada compra.',
    cta: 'Saiba Mais',
    ctaHref: '#qualidade',
    image: '/products/complexo_b.png',
    active: false,
    order: 4,
    bg: 'linear-gradient(135deg, #1a0533, #4a1272, #2d1654)',
    accent: '#e879f9',
    campaign: 'Confiança',
  },
];

// ── Helpers ──────────────────────────────────────────────────────────

export const statusColors: Record<OrderStatus, { bg: string; text: string; label: string }> = {
  pendente:     { bg: 'bg-yellow-500/15', text: 'text-yellow-400', label: 'Pendente' },
  confirmado:   { bg: 'bg-blue-500/15',   text: 'text-blue-400',   label: 'Confirmado' },
  processando:  { bg: 'bg-purple-500/15', text: 'text-purple-400', label: 'Processando' },
  enviado:      { bg: 'bg-cyan-500/15',   text: 'text-cyan-400',   label: 'Enviado' },
  entregue:     { bg: 'bg-emerald-500/15',text: 'text-emerald-400',label: 'Entregue' },
  cancelado:    { bg: 'bg-red-500/15',    text: 'text-red-400',    label: 'Cancelado' },
};

export const productStatusColors: Record<ProductStatus, { bg: string; text: string; label: string }> = {
  ativo:       { bg: 'bg-emerald-500/15', text: 'text-emerald-400', label: 'Ativo' },
  inativo:     { bg: 'bg-slate-500/15',   text: 'text-slate-400',   label: 'Inativo' },
  sem_estoque: { bg: 'bg-red-500/15',     text: 'text-red-400',     label: 'Sem estoque' },
};

export function fmtCurrency(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
}
export function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
}
