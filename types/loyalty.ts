export type LevelId = 'silver' | 'gold' | 'black';

export interface LevelConfig {
  id: LevelId;
  name: string;
  emoji: string;
  /** Minimum R$ spent to reach this level (= base progress points, 1:1 with R$) */
  minPoints: number;
  maxPoints: number | null;
  /** Points multiplier applied to total spend to calculate displayed points */
  multiplier: number;
  cashbackPct: number;
  gradient: string;
  gradientCard: string;
  color: string;
  colorDim: string;
  benefits: { icon: string; text: string }[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  reward: string;
  unlocked: boolean;
  unlockedDate?: string;
  progress?: number;
  maxProgress?: number;
}

export interface CashbackEntry {
  id: string;
  type: 'earned' | 'used';
  amount: number;
  description: string;
  date: string;
  orderId?: string;
}

export interface Coupon {
  id: string;
  code: string;
  title: string;
  discount: string;
  description: string;
  validUntil: string;
  minOrder: number;
  level: LevelId;
  used: boolean;
  type: 'percent' | 'shipping' | 'fixed';
}

export interface MockUser {
  name: string;
  firstName: string;
  email: string;
  level: LevelId;
  points: number;
  cashbackBalance: number;
  cashbackUsed: number;
  totalOrders: number;
  totalSpent: number;
  memberSince: string;
}
