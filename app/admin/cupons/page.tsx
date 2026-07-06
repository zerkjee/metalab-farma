'use client';

import {
  BadgePercent,
  Ban,
  CheckCircle2,
  Copy,
  Edit3,
  Gift,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  Truck,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import Modal from '@/components/admin/Modal';
import StatusBadge from '@/components/admin/StatusBadge';
import { fmtCurrency, fmtDate } from '@/data/admin';
import {
  couponKindLabels,
  couponStatusLabels,
  emptyCouponForm,
} from '@/data/adminCoupons';
import type {
  AdminCoupon,
  AdminCouponFormValues,
  AdminCouponKind,
  AdminCouponStatus,
} from '@/types/adminCoupon';

type CouponFilter = 'all' | AdminCouponStatus;
type CouponKindFilter = 'all' | AdminCouponKind;

function normalizeCode(value: string) {
  return value.replace(/\s/g, '').toUpperCase();
}

function couponValue(coupon: AdminCoupon) {
  if (coupon.kind === 'free_shipping') return 'Frete grátis';
  if (coupon.discountMode === 'percent') return `${coupon.percentage}%`;
  return fmtCurrency(coupon.fixedValue);
}

interface ApiCupom {
  id: string;
  codigo: string;
  tipo: 'PERCENTUAL' | 'VALOR_FIXO' | 'FRETE_GRATIS';
  valor: number;
  usoMaximo: number | null;
  usoAtual: number;
  validade: string | null;
  ativo: boolean;
}

function apiToCoupon(c: ApiCupom): AdminCoupon {
  const isShipping = c.tipo === 'FRETE_GRATIS';
  const isPercent = c.tipo === 'PERCENTUAL';
  return {
    id: c.id,
    code: c.codigo,
    name: c.codigo,
    kind: isShipping ? 'free_shipping' : 'discount',
    discountMode: isPercent ? 'percent' : 'fixed',
    percentage: isPercent ? c.valor : 0,
    fixedValue: c.tipo === 'VALOR_FIXO' ? c.valor : 0,
    validUntil: c.validade ? c.validade.slice(0, 10) : '',
    usageLimit: c.usoMaximo ?? 0,
    usedTotal: c.usoAtual,
    minimumOrderValue: 0,
    status: c.ativo ? 'active' : 'inactive',
    createdAt: new Date().toISOString().slice(0, 10),
  };
}

function couponToApiPayload(values: AdminCouponFormValues) {
  const tipo = values.kind === 'free_shipping'
    ? 'FRETE_GRATIS'
    : values.percentage > 0 ? 'PERCENTUAL' : 'VALOR_FIXO';
  const valor = values.kind === 'free_shipping' ? 0
    : values.percentage > 0 ? values.percentage : values.fixedValue;
  return {
    codigo: values.code,
    tipo,
    valor,
    usoMaximo: values.usageLimit || null,
    validade: values.validUntil || null,
    ativo: values.status === 'active',
  };
}


function couponToForm(coupon: AdminCoupon): AdminCouponFormValues {
  return {
    code: coupon.code,
    name: coupon.name,
    kind: coupon.kind,
    percentage: coupon.percentage,
    fixedValue: coupon.fixedValue,
    validUntil: coupon.validUntil,
    usageLimit: coupon.usageLimit,
    minimumOrderValue: coupon.minimumOrderValue,
    status: coupon.status,
  };
}

function CouponTypeBadge({ kind }: { kind: AdminCouponKind }) {
  const isShipping = kind === 'free_shipping';
  const Icon = isShipping ? Truck : BadgePercent;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
      isShipping ? 'bg-navy-50 text-navy-600' : 'bg-brand-50 text-brand-700'
    }`}>
      <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />
      {couponKindLabels[kind]}
    </span>
  );
}

function RulePanel() {
  return (
    <div className="rounded-2xl border border-line bg-brand-50 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-700">Regra de combinação</p>
          <p className="mt-1 text-sm font-semibold text-navy">O cliente pode usar 1 cupom de desconto + 1 cupom de frete grátis.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-2 rounded-xl bg-surface-card px-3 py-2 text-xs font-semibold text-success">
            <CheckCircle2 className="h-4 w-4" strokeWidth={1.8} />
            Desconto + Frete
          </span>
          <span className="inline-flex items-center gap-2 rounded-xl bg-surface-card px-3 py-2 text-xs font-semibold text-danger">
            <Ban className="h-4 w-4" strokeWidth={1.8} />
            2 descontos bloqueado
          </span>
        </div>
      </div>
    </div>
  );
}

function CouponForm({
  initialValues,
  submitLabel,
  onCancel,
  onSubmit,
}: {
  initialValues: AdminCouponFormValues;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: (values: AdminCouponFormValues) => void;
}) {
  const [values, setValues] = useState<AdminCouponFormValues>(initialValues);
  const isShipping = values.kind === 'free_shipping';
  const discountConflict = values.kind === 'discount' && values.percentage > 0 && values.fixedValue > 0;
  const canSubmit = values.code.trim().length > 0 && values.name.trim().length > 0 && !discountConflict;

  function setField<K extends keyof AdminCouponFormValues>(key: K, value: AdminCouponFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  return (
    <form
      className="flex max-h-[75vh] flex-col gap-4 overflow-y-auto pr-1"
      onSubmit={(event) => {
        event.preventDefault();
        if (canSubmit) onSubmit(values);
      }}
    >
      <div className="rounded-2xl border border-line bg-surface-sunken p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">Regra visual</p>
        <p className="mt-2 text-sm text-ink-secondary">Cadastre cupons separados: um de desconto e outro de frete grátis. Na loja, dois cupons de desconto não devem ser combinados.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs text-ink-secondary">Código</label>
          <input
            value={values.code}
            onChange={(event) => setField('code', normalizeCode(event.target.value))}
            placeholder="PRIMEIRACOMPRA30"
            className="w-full rounded-xl border border-line-default bg-surface-card px-3 py-2.5 text-sm font-semibold uppercase tracking-wide text-ink outline-none focus:border-brand"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-ink-secondary">Nome</label>
          <input
            value={values.name}
            onChange={(event) => setField('name', event.target.value)}
            placeholder="Primeira compra 30% OFF"
            className="w-full rounded-xl border border-line-default bg-surface-card px-3 py-2.5 text-sm text-ink outline-none focus:border-brand"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-ink-secondary">Tipo</label>
          <select
            value={values.kind}
            onChange={(event) => {
              const kind = event.target.value as AdminCouponKind;
              setValues((current) => ({
                ...current,
                kind,
                percentage: kind === 'free_shipping' ? 0 : current.percentage || 10,
                fixedValue: kind === 'free_shipping' ? 0 : current.fixedValue,
              }));
            }}
            className="w-full rounded-xl border border-line-default bg-surface-card px-3 py-2.5 text-sm text-ink outline-none focus:border-brand"
          >
            <option value="discount">Desconto</option>
            <option value="free_shipping">Frete grátis</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-ink-secondary">Status</label>
          <select
            value={values.status}
            onChange={(event) => setField('status', event.target.value as AdminCouponStatus)}
            className="w-full rounded-xl border border-line-default bg-surface-card px-3 py-2.5 text-sm text-ink outline-none focus:border-brand"
          >
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-ink-secondary">Porcentagem</label>
          <input
            type="number"
            min="0"
            max="100"
            disabled={isShipping}
            value={values.percentage}
            onChange={(event) => setField('percentage', Number(event.target.value))}
            className="w-full rounded-xl border border-line-default bg-surface-card px-3 py-2.5 text-sm text-ink outline-none focus:border-brand disabled:cursor-not-allowed disabled:opacity-40"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-ink-secondary">Valor fixo</label>
          <input
            type="number"
            min="0"
            step="0.01"
            disabled={isShipping}
            value={values.fixedValue}
            onChange={(event) => setField('fixedValue', Number(event.target.value))}
            className="w-full rounded-xl border border-line-default bg-surface-card px-3 py-2.5 text-sm text-ink outline-none focus:border-brand disabled:cursor-not-allowed disabled:opacity-40"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-ink-secondary">Validade</label>
          <input
            type="date"
            value={values.validUntil}
            onChange={(event) => setField('validUntil', event.target.value)}
            className="w-full rounded-xl border border-line-default bg-surface-card px-3 py-2.5 text-sm text-ink outline-none focus:border-brand"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-ink-secondary">Limite de uso</label>
          <input
            type="number"
            min="0"
            value={values.usageLimit}
            onChange={(event) => setField('usageLimit', Number(event.target.value))}
            className="w-full rounded-xl border border-line-default bg-surface-card px-3 py-2.5 text-sm text-ink outline-none focus:border-brand"
          />
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs text-ink-secondary">Valor mínimo de compra</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={values.minimumOrderValue}
            onChange={(event) => setField('minimumOrderValue', Number(event.target.value))}
            className="w-full rounded-xl border border-line-default bg-surface-card px-3 py-2.5 text-sm text-ink outline-none focus:border-brand"
          />
        </div>
      </div>

      {discountConflict && (
        <div className="rounded-xl border border-danger/30 bg-danger-subtle px-4 py-3 text-sm font-semibold text-danger">
          Use porcentagem ou valor fixo para o desconto. Não combine os dois no mesmo cupom.
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full px-4 py-2 text-sm text-ink-muted transition-all hover:bg-surface-sunken hover:text-navy"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-on-brand transition-all hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

export default function AdminCupons() {
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<CouponFilter>('all');
  const [kindFilter, setKindFilter] = useState<CouponKindFilter>('all');
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [editingCoupon, setEditingCoupon] = useState<AdminCoupon | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/admin/cupons')
      .then((r) => r.json())
      .then((data: unknown) => {
        if (cancelled) return;
        if (Array.isArray(data)) setCoupons(data.map((c) => apiToCoupon(c as ApiCupom)));
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const filteredCoupons = useMemo(() => {
    const term = search.trim().toLowerCase();

    return coupons.filter((coupon) => {
      const matchesSearch = !term || [
        coupon.code,
        coupon.name,
        couponKindLabels[coupon.kind],
        couponStatusLabels[coupon.status],
      ].some((value) => value.toLowerCase().includes(term));
      const matchesStatus = statusFilter === 'all' || coupon.status === statusFilter;
      const matchesKind = kindFilter === 'all' || coupon.kind === kindFilter;
      return matchesSearch && matchesStatus && matchesKind;
    });
  }, [coupons, kindFilter, search, statusFilter]);

  const activeDiscounts = coupons.filter((coupon) => coupon.status === 'active' && coupon.kind === 'discount').length;
  const activeShipping = coupons.filter((coupon) => coupon.status === 'active' && coupon.kind === 'free_shipping').length;

  function openCreate() {
    setEditingCoupon(null);
    setFormMode('create');
  }

  function openEdit(coupon: AdminCoupon) {
    setEditingCoupon(coupon);
    setFormMode('edit');
  }

  function closeForm() {
    setFormMode(null);
    setEditingCoupon(null);
  }

  async function saveCoupon(values: AdminCouponFormValues) {
    const payload = couponToApiPayload(values);
    if (formMode === 'edit' && editingCoupon) {
      const res = await fetch(`/api/admin/cupons/${editingCoupon.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        const updated = apiToCoupon(data as ApiCupom);
        updated.name = values.name;
        updated.minimumOrderValue = values.minimumOrderValue;
        setCoupons((cur) => cur.map((c) => c.id === editingCoupon.id ? updated : c));
      }
    } else {
      const res = await fetch('/api/admin/cupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        const created = apiToCoupon(data as ApiCupom);
        created.name = values.name;
        created.minimumOrderValue = values.minimumOrderValue;
        setCoupons((cur) => [created, ...cur]);
      }
    }
    closeForm();
  }

  async function toggleStatus(id: string) {
    const coupon = coupons.find((c) => c.id === id);
    if (!coupon) return;
    const newAtivo = coupon.status !== 'active';
    const res = await fetch(`/api/admin/cupons/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ativo: newAtivo }),
    });
    if (res.ok) {
      setCoupons((cur) => cur.map((c) => c.id === id ? { ...c, status: newAtivo ? 'active' : 'inactive' } : c));
    }
  }

  async function duplicateCoupon(coupon: AdminCoupon) {
    const payload = {
      codigo: `${coupon.code}_COPIA`,
      tipo: coupon.kind === 'free_shipping' ? 'FRETE_GRATIS' : coupon.discountMode === 'percent' ? 'PERCENTUAL' : 'VALOR_FIXO',
      valor: coupon.kind === 'free_shipping' ? 0 : coupon.discountMode === 'percent' ? coupon.percentage : coupon.fixedValue,
      usoMaximo: coupon.usageLimit || null,
      validade: coupon.validUntil || null,
      ativo: false,
    };
    const res = await fetch('/api/admin/cupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await res.json();
      const copy = apiToCoupon(data as ApiCupom);
      copy.name = `${coupon.name} copia`;
      setCoupons((cur) => [copy, ...cur]);
    }
  }

  async function deleteCoupon(id: string) {
    const res = await fetch(`/api/admin/cupons/${id}`, { method: 'DELETE' });
    if (res.ok) setCoupons((cur) => cur.filter((c) => c.id !== id));
  }

  const formInitialValues = editingCoupon ? couponToForm(editingCoupon) : emptyCouponForm;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-700">Promoções e retenção</p>
          <h2 className="mt-1 text-xl font-display text-navy">Cupons</h2>
          <p className="mt-1 text-xs text-ink-muted">{loading ? 'Carregando...' : `${coupons.length} cupons no banco de dados`}</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-on-brand transition-all hover:bg-brand-hover"
        >
          <Plus className="h-4 w-4" strokeWidth={1.8} />
          Novo cupom
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        {[
          { label: 'Cupons ativos', value: coupons.filter((coupon) => coupon.status === 'active').length, icon: Gift },
          { label: 'Descontos ativos', value: activeDiscounts, icon: BadgePercent },
          { label: 'Frete grátis ativo', value: activeShipping, icon: Truck },
          { label: 'Usos totais', value: coupons.reduce((sum, coupon) => sum + coupon.usedTotal, 0), icon: CheckCircle2 },
        ].map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="rounded-2xl border border-line bg-surface-card shadow-sm p-4">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <Icon className="h-4 w-4" strokeWidth={1.8} />
              </div>
              <p className="text-xs text-ink-muted">{metric.label}</p>
              <p className="mt-1 font-display text-2xl text-navy">{metric.value}</p>
            </div>
          );
        })}
      </div>

      <RulePanel />

      <div className="flex flex-wrap gap-3">
        <div className="flex min-w-64 flex-1 items-center gap-2 rounded-full border border-line bg-surface-card px-3 py-2">
          <Search className="h-4 w-4 flex-shrink-0 text-ink-muted" strokeWidth={1.8} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por código, nome, tipo ou status..."
            className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-muted"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(['all', 'active', 'inactive'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`rounded-full px-3 py-2 text-xs font-semibold transition-all ${
                statusFilter === status
                  ? 'bg-brand text-on-brand'
                  : 'border border-line bg-surface-card text-ink-muted hover:text-navy'
              }`}
            >
              {status === 'all' ? 'Todos' : couponStatusLabels[status]}
            </button>
          ))}
          {(['all', 'discount', 'free_shipping'] as const).map((kind) => (
            <button
              key={kind}
              onClick={() => setKindFilter(kind)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold transition-all ${
                kindFilter === kind
                  ? 'bg-navy text-on-navy'
                  : 'border border-line bg-surface-card text-ink-muted hover:text-navy'
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={1.8} />
              {kind === 'all' ? 'Tipos' : couponKindLabels[kind]}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-surface-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px]">
            <thead>
              <tr className="border-b border-line">
                <th className="px-5 py-3 text-left text-xs font-semibold text-ink-muted">Cupom</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-ink-muted">Tipo</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-ink-muted">Valor</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-ink-muted">Uso total</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-ink-muted">Compra mínima</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-ink-muted">Validade</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-ink-muted">Status</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-ink-muted">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredCoupons.map((coupon, index) => {
                const usagePct = coupon.usageLimit > 0 ? Math.min((coupon.usedTotal / coupon.usageLimit) * 100, 100) : 0;

                return (
                  <tr
                    key={coupon.id}
                    className={`transition-colors hover:bg-surface-sunken ${index < filteredCoupons.length - 1 ? 'border-b border-line' : ''}`}
                  >
                    <td className="px-5 py-4">
                      <p className="text-sm font-bold tracking-wide text-navy">{coupon.code}</p>
                      <p className="mt-1 text-xs text-ink-muted">{coupon.name}</p>
                    </td>
                    <td className="px-5 py-4">
                      <CouponTypeBadge kind={coupon.kind} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <p className="text-sm font-bold text-navy">{couponValue(coupon)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="mx-auto w-32">
                        <div className="mb-1 flex justify-between text-[10px]">
                          <span className="text-ink-muted">Usos</span>
                          <span className="font-semibold text-ink-secondary">{coupon.usedTotal}/{coupon.usageLimit}</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-surface-sunken">
                          <div className="h-full rounded-full bg-brand" style={{ width: `${usagePct}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right text-sm font-semibold text-ink-secondary">
                      {coupon.minimumOrderValue > 0 ? fmtCurrency(coupon.minimumOrderValue) : 'Sem mínimo'}
                    </td>
                    <td className="px-5 py-4 text-center text-sm text-ink-secondary">
                      {fmtDate(coupon.validUntil)}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <StatusBadge
                        label={couponStatusLabels[coupon.status]}
                        color={coupon.status === 'active' ? 'bg-success-subtle text-success' : 'bg-surface-sunken text-ink-muted'}
                      />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => openEdit(coupon)}
                          className="flex h-9 w-9 items-center justify-center rounded-full text-ink-muted transition-all hover:bg-brand-50 hover:text-brand-700"
                          title="Editar"
                        >
                          <Edit3 className="h-4 w-4" strokeWidth={1.8} />
                        </button>
                        <button
                          onClick={() => duplicateCoupon(coupon)}
                          className="flex h-9 w-9 items-center justify-center rounded-full text-ink-muted transition-all hover:bg-navy-50 hover:text-navy-600"
                          title="Duplicar"
                        >
                          <Copy className="h-4 w-4" strokeWidth={1.8} />
                        </button>
                        <button
                          onClick={() => toggleStatus(coupon.id)}
                          className="flex h-9 w-9 items-center justify-center rounded-full text-ink-muted transition-all hover:bg-warning-subtle hover:text-warning"
                          title={coupon.status === 'active' ? 'Desativar' : 'Ativar'}
                        >
                          {coupon.status === 'active' ? <Ban className="h-4 w-4" strokeWidth={1.8} /> : <CheckCircle2 className="h-4 w-4" strokeWidth={1.8} />}
                        </button>
                        <button
                          onClick={() => deleteCoupon(coupon.id)}
                          className="flex h-9 w-9 items-center justify-center rounded-full text-ink-muted transition-all hover:bg-danger-subtle hover:text-danger"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={1.8} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredCoupons.length === 0 && (
          <div className="px-5 py-10 text-center">
            <p className="text-sm font-semibold text-ink-secondary">Nenhum cupom encontrado</p>
            <p className="mt-1 text-xs text-ink-muted">Ajuste a busca ou os filtros para ver outros cupons.</p>
          </div>
        )}
      </div>

      <Modal
        open={formMode !== null}
        onClose={closeForm}
        title={formMode === 'edit' ? `Editar ${editingCoupon?.code}` : 'Novo cupom'}
        maxWidth="max-w-3xl"
      >
        <CouponForm
          key={editingCoupon?.id ?? formMode ?? 'create'}
          initialValues={formInitialValues}
          submitLabel={formMode === 'edit' ? 'Salvar cupom' : 'Criar cupom'}
          onCancel={closeForm}
          onSubmit={saveCoupon}
        />
      </Modal>
    </div>
  );
}
