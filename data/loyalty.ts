import { LevelConfig, Achievement, CashbackEntry, Coupon, MockUser } from '@/types/loyalty';

export const levels: LevelConfig[] = [
  {
    id: 'silver',
    name: 'Silver',
    emoji: '🥈',
    minPoints: 0,
    maxPoints: 299,
    multiplier: 1.0,
    cashbackPct: 2,
    gradient: 'linear-gradient(135deg, #475569 0%, #94a3b8 50%, #cbd5e1 100%)',
    gradientCard: 'linear-gradient(135deg, #1e293b, #334155)',
    color: '#94a3b8',
    colorDim: '#475569',
    benefits: [
      { icon: '💰', text: '2% cashback em todas as compras' },
      { icon: '⚡', text: '1 ponto por R$ 1 gasto' },
      { icon: '🚚', text: 'Frete grátis acima de R$ 199' },
      { icon: '📧', text: 'Novidades em primeira mão' },
      { icon: '🎁', text: 'Cupom de boas-vindas' },
    ],
  },
  {
    id: 'gold',
    name: 'Gold',
    emoji: '🥇',
    minPoints: 300,
    maxPoints: 1499,
    multiplier: 1.5,
    cashbackPct: 5,
    gradient: 'linear-gradient(135deg, #92400e 0%, #d97706 50%, #fbbf24 100%)',
    gradientCard: 'linear-gradient(135deg, #451a03, #78350f)',
    color: '#f59e0b',
    colorDim: '#d97706',
    benefits: [
      { icon: '💰', text: '5% cashback em todas as compras' },
      { icon: '⚡', text: '1,5 pontos por R$ 1 gasto (+50%)' },
      { icon: '🚚', text: 'Frete grátis acima de R$ 99' },
      { icon: '🔓', text: 'Acesso antecipado a lançamentos' },
      { icon: '🎫', text: 'Cupons mensais exclusivos Gold' },
      { icon: '📦', text: 'Desconto especial em kits' },
      { icon: '🏆', text: 'Suporte prioritário' },
    ],
  },
  {
    id: 'black',
    name: 'Black',
    emoji: '💎',
    minPoints: 1500,
    maxPoints: null,
    multiplier: 2.0,
    cashbackPct: 8,
    gradient: 'linear-gradient(135deg, #0f0f0f 0%, #1f1f1f 50%, #374151 100%)',
    gradientCard: 'linear-gradient(135deg, #000000, #111827)',
    color: '#e5e7eb',
    colorDim: '#6b7280',
    benefits: [
      { icon: '💰', text: '8% cashback em todas as compras' },
      { icon: '⚡', text: '2 pontos por R$ 1 gasto (+100%)' },
      { icon: '🚚', text: 'Frete grátis em TODOS os pedidos' },
      { icon: '🔓', text: 'Acesso antecipado + reserva garantida' },
      { icon: '🎫', text: 'Cupons semanais exclusivos Black' },
      { icon: '📦', text: 'Kits exclusivos Black Member' },
      { icon: '👑', text: 'Atendimento VIP personalizado' },
      { icon: '🎯', text: 'Ofertas relâmpago exclusivas' },
      { icon: '🎁', text: 'Brindes surpresa nos pedidos' },
    ],
  },
];

export const mockUser: MockUser = {
  name: 'Pedro Silva',
  firstName: 'Pedro',
  email: 'pedro@email.com',
  level: 'gold',
  points: 2340,
  cashbackBalance: 47.80,
  cashbackUsed: 132.50,
  totalOrders: 8,
  totalSpent: 1247.60,
  memberSince: '2024-09-15',
};

export const achievements: Achievement[] = [
  {
    id: 'first_purchase',
    title: 'Primeira Compra',
    description: 'Realizou a primeira compra na Metalab Store',
    icon: '🛒',
    reward: '+50 pts',
    unlocked: true,
    unlockedDate: '2024-09-15',
  },
  {
    id: 'kit_lover',
    title: 'Kit Lover',
    description: 'Comprou um kit pela primeira vez',
    icon: '📦',
    reward: '+75 pts',
    unlocked: true,
    unlockedDate: '2024-10-02',
  },
  {
    id: 'reviewer',
    title: 'Avaliador',
    description: 'Deixou a primeira avaliação de produto',
    icon: '⭐',
    reward: '+50 pts',
    unlocked: true,
    unlockedDate: '2024-10-15',
  },
  {
    id: 'loyal_3',
    title: 'Comprador Frequente',
    description: 'Realizou 3 compras na loja',
    icon: '🔄',
    reward: '+100 pts',
    unlocked: true,
    unlockedDate: '2024-11-20',
  },
  {
    id: 'loyal_6m',
    title: 'Cliente Fiel',
    description: '6 meses como cliente Metalab',
    icon: '❤️',
    reward: '+150 pts',
    unlocked: true,
    unlockedDate: '2025-03-15',
  },
  {
    id: 'ambassador',
    title: 'Embaixador',
    description: 'Indique um amigo que realize uma compra',
    icon: '🤝',
    reward: '+200 pts',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
  },
  {
    id: 'super_buyer',
    title: 'Super Comprador',
    description: 'Realize 20 compras na loja',
    icon: '🏆',
    reward: '+300 pts',
    unlocked: false,
    progress: 8,
    maxProgress: 20,
  },
  {
    id: 'black_member',
    title: 'Black Member',
    description: 'Atinja o nível Black Elite',
    icon: '💎',
    reward: '+500 pts',
    unlocked: false,
    progress: 2340,
    maxProgress: 5000,
  },
];

export const cashbackHistory: CashbackEntry[] = [
  { id: 'cb1', type: 'earned', amount: 8.95, description: 'Compra — Articulice', date: '2025-04-29', orderId: '#1089' },
  { id: 'cb2', type: 'earned', amount: 3.99, description: 'Compra — Ademoril', date: '2025-04-20', orderId: '#1077' },
  { id: 'cb3', type: 'used', amount: 20.00, description: 'Resgatado no pedido', date: '2025-04-10', orderId: '#1065' },
  { id: 'cb4', type: 'earned', amount: 7.19, description: 'Compra — Kit 2 Ademoril', date: '2025-03-30', orderId: '#1054' },
  { id: 'cb5', type: 'earned', amount: 4.49, description: 'Compra — Água Inglesa', date: '2025-03-15', orderId: '#1038' },
  { id: 'cb6', type: 'used', amount: 15.00, description: 'Resgatado no pedido', date: '2025-02-28', orderId: '#1020' },
  { id: 'cb7', type: 'earned', amount: 6.99, description: 'Compra — Apetimax', date: '2025-02-10', orderId: '#1008' },
  { id: 'cb8', type: 'earned', amount: 5.50, description: 'Bônus boas-vindas', date: '2024-09-15' },
];

export const coupons: Coupon[] = [
  {
    id: 'c1',
    code: 'GOLD10',
    title: '10% OFF na próxima compra',
    discount: '10% OFF',
    description: 'Válido em todos os produtos da loja',
    validUntil: '2025-05-31',
    minOrder: 100,
    level: 'gold',
    used: false,
    type: 'percent',
  },
  {
    id: 'c2',
    code: 'FRETEVIP',
    title: 'Frete Grátis',
    discount: 'Frete Grátis',
    description: 'Frete grátis sem pedido mínimo — exclusivo Gold',
    validUntil: '2025-05-20',
    minOrder: 0,
    level: 'gold',
    used: false,
    type: 'shipping',
  },
  {
    id: 'c3',
    code: 'KIT15',
    title: '15% OFF em kits',
    discount: '15% OFF Kits',
    description: 'Válido apenas em kits (Kit 2 ou Kit 3)',
    validUntil: '2025-06-30',
    minOrder: 150,
    level: 'gold',
    used: false,
    type: 'percent',
  },
];

export function getLevelConfig(id: string): LevelConfig {
  return levels.find((l) => l.id === id) ?? levels[0];
}

export function getNextLevel(currentId: string): LevelConfig | null {
  const idx = levels.findIndex((l) => l.id === currentId);
  return idx < levels.length - 1 ? levels[idx + 1] : null;
}

export function getProgressToNext(user: MockUser): number {
  const next = getNextLevel(user.level);
  if (!next) return 100;
  const current = getLevelConfig(user.level);
  const range = next.minPoints - current.minPoints;
  // Progress uses totalSpent (R$ = base 1:1), same scale as minPoints thresholds
  const done = user.totalSpent - current.minPoints;
  return Math.min(100, Math.max(0, Math.round((done / range) * 100)));
}
