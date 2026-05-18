export type ProductStatus = 'ativo' | 'inativo' | 'sem_estoque';

export const productStatusColors: Record<ProductStatus, { bg: string; text: string; label: string }> = {
  ativo:       { bg: 'bg-emerald-500/15', text: 'text-emerald-400', label: 'Ativo' },
  inativo:     { bg: 'bg-slate-500/15',   text: 'text-slate-400',   label: 'Inativo' },
  sem_estoque: { bg: 'bg-red-500/15',     text: 'text-red-400',     label: 'Sem estoque' },
};

const _currencyFmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
export function fmtCurrency(v: number) {
  return _currencyFmt.format(v);
}
export function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
}
