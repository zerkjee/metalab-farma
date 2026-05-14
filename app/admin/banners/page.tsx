'use client';

import { ArrowDown, ArrowUp, Eye, ImagePlus, Pencil, Plus, Save, Trash2 } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import Modal from '@/components/admin/Modal';
import StatusBadge from '@/components/admin/StatusBadge';
import { AdminBanner, adminBanners } from '@/data/admin';

type BannerForm = Omit<AdminBanner, 'id'>;

const gradientOptions = [
  {
    label: 'Metalab Roxo',
    value: 'linear-gradient(135deg, #1a0533, #2d1654, #1e3a5f)',
    accent: '#c084fc',
  },
  {
    label: 'Campanha Azul',
    value: 'linear-gradient(135deg, #1e1b4b, #312e81, #1e3a5f)',
    accent: '#a5b4fc',
  },
  {
    label: 'Confiança',
    value: 'linear-gradient(135deg, #0c1a35, #1e3a5f, #1a2744)',
    accent: '#7dd3fc',
  },
  {
    label: 'Premium',
    value: 'linear-gradient(135deg, #1a0533, #4a1272, #2d1654)',
    accent: '#e879f9',
  },
];

const initialForm: BannerForm = {
  title: '',
  subtitle: '',
  cta: 'Ver Produtos',
  ctaHref: '#produtos',
  image: '/products/articulice.png',
  active: true,
  order: 1,
  bg: gradientOptions[0].value,
  accent: gradientOptions[0].accent,
  campaign: 'Campanha',
};

function sortByOrder(items: AdminBanner[]) {
  return [...items].sort((a, b) => a.order - b.order);
}

function normalizeOrder(items: AdminBanner[]) {
  return items.map((banner, index) => ({ ...banner, order: index + 1 }));
}

function BannerPreview({ banner, compact = false }: { banner: BannerForm | AdminBanner; compact?: boolean }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl ${
        compact ? 'min-h-[170px]' : 'min-h-[260px]'
      }`}
      style={{ background: banner.bg }}
    >
      <div className="absolute inset-0 opacity-[0.07]"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '28px 28px' }}
      />
      <div
        className="absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-20 blur-sm"
        style={{ backgroundColor: banner.accent }}
      />
      <div className={`relative z-10 grid h-full gap-4 p-5 ${compact ? 'grid-cols-[1fr_96px]' : 'grid-cols-1 sm:grid-cols-[1fr_180px] sm:p-7'}`}>
        <div className="flex min-w-0 flex-col justify-center">
          <span
            className="mb-3 inline-flex w-fit rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-white"
            style={{ backgroundColor: `${banner.accent}33` }}
          >
            {banner.campaign}
          </span>
          <h3 className={`${compact ? 'text-lg' : 'text-2xl sm:text-3xl'} font-black leading-tight text-white`}>
            {banner.title || 'Título do banner'}
          </h3>
          <p className={`mt-2 line-clamp-2 leading-relaxed text-white/70 ${compact ? 'text-xs' : 'text-sm'}`}>
            {banner.subtitle || 'Subtítulo da campanha aparecerá aqui.'}
          </p>
          <div className="mt-4">
            <span
              className="inline-flex rounded-xl px-4 py-2 text-xs font-bold text-slate-950 shadow-lg"
              style={{ backgroundColor: banner.accent }}
            >
              {banner.cta || 'CTA'}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <div className={`${compact ? 'h-24 w-24' : 'h-36 w-36 sm:h-44 sm:w-44'} overflow-hidden rounded-3xl border border-white/15 bg-white/10 p-3 backdrop-blur`}>
            <div
              className="h-full w-full rounded-2xl bg-contain bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${banner.image})` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminBanners() {
  const [banners, setBanners] = useState(() => sortByOrder(adminBanners));
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<BannerForm>({ ...initialForm, order: adminBanners.length + 1 });

  const sortedBanners = useMemo(() => sortByOrder(banners), [banners]);
  const activeCount = sortedBanners.filter((banner) => banner.active).length;
  const selectedGradient = gradientOptions.find((option) => option.value === form.bg) ?? gradientOptions[0];

  function openCreate() {
    setEditingId(null);
    setForm({
      ...initialForm,
      order: sortedBanners.length + 1,
    });
    setModalMode('create');
  }

  function openEdit(banner: AdminBanner) {
    setEditingId(banner.id);
    setForm({
      title: banner.title,
      subtitle: banner.subtitle,
      cta: banner.cta,
      ctaHref: banner.ctaHref,
      image: banner.image,
      active: banner.active,
      order: banner.order,
      bg: banner.bg,
      accent: banner.accent,
      campaign: banner.campaign,
    });
    setModalMode('edit');
  }

  function closeModal() {
    setModalMode(null);
    setEditingId(null);
  }

  function updateField<K extends keyof BannerForm>(key: K, value: BannerForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleGradientChange(value: string) {
    const option = gradientOptions.find((item) => item.value === value) ?? gradientOptions[0];
    setForm((current) => ({ ...current, bg: option.value, accent: option.accent }));
  }

  function saveBanner(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setBanners((current) => {
      const requestedOrder = Math.max(1, Math.min(form.order, current.length + (modalMode === 'create' ? 1 : 0)));

      if (modalMode === 'create') {
        const nextBanner: AdminBanner = {
          ...form,
          id: Math.max(0, ...current.map((banner) => banner.id)) + 1,
          order: requestedOrder,
        };
        const next = sortByOrder(current);
        next.splice(requestedOrder - 1, 0, nextBanner);
        return normalizeOrder(next);
      }

      const edited = current.find((banner) => banner.id === editingId);
      if (!edited) {
        return current;
      }

      const next = sortByOrder(current.filter((banner) => banner.id !== editingId));
      next.splice(requestedOrder - 1, 0, { ...edited, ...form, order: requestedOrder });
      return normalizeOrder(next);
    });

    closeModal();
  }

  function toggleActive(id: number) {
    setBanners((current) => current.map((banner) =>
      banner.id === id ? { ...banner, active: !banner.active } : banner
    ));
  }

  function deleteBanner(id: number) {
    setBanners((current) => normalizeOrder(sortByOrder(current.filter((banner) => banner.id !== id))));
  }

  function moveBanner(id: number, direction: 'up' | 'down') {
    setBanners((current) => {
      const next = sortByOrder(current);
      const index = next.findIndex((banner) => banner.id === id);
      const target = direction === 'up' ? index - 1 : index + 1;

      if (index < 0 || target < 0 || target >= next.length) {
        return current;
      }

      [next[index], next[target]] = [next[target], next[index]];
      return normalizeOrder(next);
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-purple-400">Campanhas visuais</p>
          <h2 className="mt-1 text-xl font-black text-white">Banners da Home</h2>
          <p className="mt-1 text-xs text-slate-500">
            {activeCount} ativos de {sortedBanners.length} banners mockados
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/"
            target="_blank"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-300 transition-all hover:bg-slate-700"
          >
            <Eye className="h-4 w-4" strokeWidth={1.8} />
            Ver home
          </a>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-purple-950/20 transition-all hover:brightness-110 active:scale-[0.99]"
            style={{ background: 'linear-gradient(135deg, #6b21a8, #7c3aed)' }}
          >
            <Plus className="h-4 w-4" strokeWidth={1.9} />
            Novo banner
          </button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        {[
          { label: 'Ativos', value: activeCount },
          { label: 'Inativos', value: sortedBanners.length - activeCount },
          { label: 'Campanhas', value: sortedBanners.length },
          { label: 'Próxima ordem', value: sortedBanners.length + 1 },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-xs text-slate-500">{item.label}</p>
            <p className="mt-1 text-2xl font-black text-white">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-purple-700/30 bg-purple-600/10 px-5 py-3">
        <p className="text-xs leading-5 text-purple-300">
          Alterações são apenas locais por enquanto. A estrutura já separa campos para backend, upload de imagem,
          controle de campanhas e persistência futura.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-4">
          {sortedBanners.map((banner, index) => (
            <article
              key={banner.id}
              className={`grid gap-4 rounded-2xl border p-4 transition-all lg:grid-cols-[260px_1fr_auto] ${
                banner.active ? 'border-slate-700/60 bg-slate-900/80' : 'border-slate-800/70 bg-slate-900/40 opacity-70'
              }`}
            >
              <BannerPreview banner={banner} compact />

              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <StatusBadge
                    label={banner.active ? 'Ativo' : 'Inativo'}
                    color={banner.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-600/30 text-slate-500'}
                  />
                  <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-400">
                    Ordem {banner.order}
                  </span>
                  <span className="rounded-full bg-purple-500/10 px-2.5 py-1 text-xs font-semibold text-purple-300">
                    {banner.campaign}
                  </span>
                </div>

                <h3 className="text-base font-black text-white">{banner.title}</h3>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">{banner.subtitle}</p>

                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  <div className="rounded-xl bg-slate-950/50 p-3">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">CTA</p>
                    <p className="mt-1 truncate text-xs font-semibold text-slate-200">{banner.cta}</p>
                  </div>
                  <div className="rounded-xl bg-slate-950/50 p-3">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Link</p>
                    <p className="mt-1 truncate text-xs font-semibold text-slate-200">{banner.ctaHref}</p>
                  </div>
                  <div className="rounded-xl bg-slate-950/50 p-3">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Imagem</p>
                    <p className="mt-1 truncate text-xs font-semibold text-slate-200">{banner.image}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 lg:flex-col lg:items-stretch">
                <button
                  onClick={() => moveBanner(banner.id, 'up')}
                  disabled={index === 0}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                  title="Subir banner"
                >
                  <ArrowUp className="h-4 w-4" strokeWidth={1.9} />
                </button>
                <button
                  onClick={() => moveBanner(banner.id, 'down')}
                  disabled={index === sortedBanners.length - 1}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                  title="Descer banner"
                >
                  <ArrowDown className="h-4 w-4" strokeWidth={1.9} />
                </button>
                <button
                  onClick={() => openEdit(banner)}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-xl px-3 text-xs font-semibold text-purple-300 transition-all hover:bg-purple-600/10 hover:text-purple-200"
                >
                  <Pencil className="h-3.5 w-3.5" strokeWidth={1.9} />
                  Editar
                </button>
                <button
                  onClick={() => toggleActive(banner.id)}
                  className={`inline-flex h-9 items-center justify-center rounded-xl px-3 text-xs font-semibold transition-all ${
                    banner.active
                      ? 'text-red-300 hover:bg-red-600/10 hover:text-red-200'
                      : 'text-emerald-300 hover:bg-emerald-600/10 hover:text-emerald-200'
                  }`}
                >
                  {banner.active ? 'Desativar' : 'Ativar'}
                </button>
                <button
                  onClick={() => deleteBanner(banner.id)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition-all hover:bg-red-600/10 hover:text-red-300"
                  title="Excluir banner"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={1.8} />
                </button>
              </div>
            </article>
          ))}
        </div>

        <aside className="h-fit rounded-2xl border border-slate-800 bg-slate-900/70 p-4 xl:sticky xl:top-20">
          <div className="mb-4 flex items-center gap-2">
            <ImagePlus className="h-4 w-4 text-purple-300" strokeWidth={1.8} />
            <h3 className="text-sm font-black text-white">Preview prioritário</h3>
          </div>
          {sortedBanners[0] ? (
            <BannerPreview banner={sortedBanners[0]} />
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-700 p-8 text-center text-sm text-slate-500">
              Nenhum banner cadastrado.
            </div>
          )}
        </aside>
      </div>

      <Modal
        open={modalMode !== null}
        onClose={closeModal}
        title={modalMode === 'create' ? 'Criar banner' : 'Editar banner'}
        maxWidth="max-w-5xl"
      >
        <form onSubmit={saveBanner} className="grid gap-5 lg:grid-cols-[1fr_1fr]">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-slate-400">Título</label>
                <input
                  value={form.title}
                  onChange={(event) => updateField('title', event.target.value)}
                  className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2.5 text-sm text-slate-200 outline-none transition-all focus:border-purple-500"
                  placeholder="Título da campanha"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-400">Campanha</label>
                <input
                  value={form.campaign}
                  onChange={(event) => updateField('campaign', event.target.value)}
                  className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2.5 text-sm text-slate-200 outline-none transition-all focus:border-purple-500"
                  placeholder="Ex: Promoção"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs text-slate-400">Subtítulo</label>
              <textarea
                value={form.subtitle}
                onChange={(event) => updateField('subtitle', event.target.value)}
                className="min-h-24 w-full resize-none rounded-xl border border-slate-600 bg-slate-800 px-3 py-2.5 text-sm text-slate-200 outline-none transition-all focus:border-purple-500"
                placeholder="Descrição curta do banner"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-slate-400">Texto do botão</label>
                <input
                  value={form.cta}
                  onChange={(event) => updateField('cta', event.target.value)}
                  className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2.5 text-sm text-slate-200 outline-none transition-all focus:border-purple-500"
                  placeholder="Ver Produtos"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-400">Link do botão</label>
                <input
                  value={form.ctaHref}
                  onChange={(event) => updateField('ctaHref', event.target.value)}
                  className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2.5 text-sm text-slate-200 outline-none transition-all focus:border-purple-500"
                  placeholder="#produtos"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs text-slate-400">Imagem</label>
              <input
                value={form.image}
                onChange={(event) => updateField('image', event.target.value)}
                className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2.5 text-sm text-slate-200 outline-none transition-all focus:border-purple-500"
                placeholder="/products/produto.png"
              />
              <p className="mt-1 text-[11px] text-slate-500">Mock de URL. No backend futuro vira upload real.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs text-slate-400">Gradiente</label>
                <select
                  value={selectedGradient.value}
                  onChange={(event) => handleGradientChange(event.target.value)}
                  className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2.5 text-sm text-slate-200 outline-none transition-all focus:border-purple-500"
                >
                  {gradientOptions.map((option) => (
                    <option key={option.label} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-400">Ordem</label>
                <input
                  type="number"
                  min={1}
                  max={Math.max(1, sortedBanners.length + 1)}
                  value={form.order}
                  onChange={(event) => updateField('order', Number(event.target.value))}
                  className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2.5 text-sm text-slate-200 outline-none transition-all focus:border-purple-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-400">Status</label>
                <button
                  type="button"
                  onClick={() => updateField('active', !form.active)}
                  className={`flex h-[42px] w-full items-center justify-center rounded-xl border text-sm font-semibold transition-all ${
                    form.active
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                      : 'border-slate-600 bg-slate-800 text-slate-400'
                  }`}
                >
                  {form.active ? 'Ativo' : 'Inativo'}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label className="mb-2 block text-xs text-slate-400">Preview da home</label>
              <BannerPreview banner={form} />
            </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Pronto para backend</p>
              <p className="mt-2 text-xs leading-5 text-slate-400">
                Os campos do formulário já representam o contrato futuro para salvar no banco, publicar campanhas,
                receber upload real de imagem e versionar banners por status.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl px-4 py-2 text-sm text-slate-400 transition-all hover:bg-slate-700 hover:text-slate-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all hover:brightness-110"
                style={{ background: 'linear-gradient(135deg, #6b21a8, #7c3aed)' }}
              >
                <Save className="h-4 w-4" strokeWidth={1.9} />
                Salvar banner
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
