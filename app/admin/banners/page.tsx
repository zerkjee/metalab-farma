'use client';

import { Eye, ImagePlus, Pencil, Plus, Save, Trash2 } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import Modal from '@/components/admin/Modal';
import StatusBadge from '@/components/admin/StatusBadge';

interface ApiBanner {
  id: string;
  titulo: string | null;
  subtitulo: string | null;
  imagemUrl: string;
  linkUrl: string | null;
  cta: string | null;
  bg: string | null;
  accent: string | null;
  campanha: string | null;
  ordem: number;
  ativo: boolean;
}

type BannerForm = Omit<ApiBanner, 'id'>;

const gradientOptions = [
  { label: 'Metalab Roxo',   value: 'linear-gradient(135deg, #1a0533, #2d1654, #1e3a5f)', accent: '#c084fc' },
  { label: 'Campanha Azul',  value: 'linear-gradient(135deg, #1e1b4b, #312e81, #1e3a5f)', accent: '#a5b4fc' },
  { label: 'Confiança',      value: 'linear-gradient(135deg, #0c1a35, #1e3a5f, #1a2744)', accent: '#7dd3fc' },
  { label: 'Premium',        value: 'linear-gradient(135deg, #1a0533, #4a1272, #2d1654)', accent: '#e879f9' },
];

const initialForm: BannerForm = {
  titulo: '',
  subtitulo: '',
  cta: 'Ver Produtos',
  linkUrl: '#produtos',
  imagemUrl: '/products/articulice.png',
  ativo: true,
  ordem: 1,
  bg: gradientOptions[0].value,
  accent: gradientOptions[0].accent,
  campanha: 'Campanha',
};

function BannerPreview({ banner, compact = false }: { banner: BannerForm | ApiBanner; compact?: boolean }) {
  const accent = banner.accent ?? '#c084fc';
  const bg = banner.bg ?? gradientOptions[0].value;
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl ${compact ? 'min-h-[170px]' : 'min-h-[260px]'}`} style={{ background: bg }}>
      <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '28px 28px' }} />
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-20 blur-sm" style={{ backgroundColor: accent }} />
      <div className={`relative z-10 grid h-full gap-4 p-5 ${compact ? 'grid-cols-[1fr_96px]' : 'grid-cols-1 sm:grid-cols-[1fr_180px] sm:p-7'}`}>
        <div className="flex min-w-0 flex-col justify-center">
          {banner.campanha && (
            <span className="mb-3 inline-flex w-fit rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-white" style={{ backgroundColor: `${accent}33` }}>
              {banner.campanha}
            </span>
          )}
          <h3 className={`${compact ? 'text-lg' : 'text-2xl sm:text-3xl'} font-black leading-tight text-white`}>
            {banner.titulo || 'Título do banner'}
          </h3>
          <p className={`mt-2 line-clamp-2 leading-relaxed text-white/70 ${compact ? 'text-xs' : 'text-sm'}`}>
            {banner.subtitulo || 'Subtítulo da campanha aparecerá aqui.'}
          </p>
          {banner.cta && (
            <div className="mt-4">
              <span className="inline-flex rounded-xl px-4 py-2 text-xs font-bold text-slate-950 shadow-lg" style={{ backgroundColor: accent }}>
                {banner.cta}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center justify-center">
          <div className={`${compact ? 'h-24 w-24' : 'h-36 w-36 sm:h-44 sm:w-44'} overflow-hidden rounded-3xl border border-white/15 bg-white/10 p-3 backdrop-blur`}>
            <div className="h-full w-full rounded-2xl bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url(${banner.imagemUrl})` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminBanners() {
  const [banners, setBanners] = useState<ApiBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BannerForm>({ ...initialForm });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const sortedBanners = useMemo(() => [...banners].sort((a, b) => a.ordem - b.ordem), [banners]);
  const activeCount = sortedBanners.filter((b) => b.ativo).length;
  const selectedGradient = gradientOptions.find((o) => o.value === form.bg) ?? gradientOptions[0];

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/banners');
      if (res.ok) {
        const data = await res.json();
        setBanners(data.banners);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    fetch('/api/admin/banners')
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (!cancelled && d?.banners) setBanners(d.banners); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm({ ...initialForm, ordem: sortedBanners.length + 1 });
    setModalMode('create');
  }

  function openEdit(banner: ApiBanner) {
    setEditingId(banner.id);
    setForm({
      titulo: banner.titulo,
      subtitulo: banner.subtitulo,
      cta: banner.cta,
      linkUrl: banner.linkUrl,
      imagemUrl: banner.imagemUrl,
      ativo: banner.ativo,
      ordem: banner.ordem,
      bg: banner.bg,
      accent: banner.accent,
      campanha: banner.campanha,
    });
    setModalMode('edit');
  }

  function closeModal() {
    setModalMode(null);
    setEditingId(null);
  }

  function updateField<K extends keyof BannerForm>(key: K, value: BannerForm[K]) {
    setForm((c) => ({ ...c, [key]: value }));
  }

  function handleGradientChange(value: string) {
    const o = gradientOptions.find((opt) => opt.value === value) ?? gradientOptions[0];
    setForm((c) => ({ ...c, bg: o.value, accent: o.accent }));
  }

  async function handleImageUpload(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      if (res.ok) {
        const data = await res.json();
        updateField('imagemUrl', data.url);
      } else {
        alert('Falha no upload');
      }
    } finally {
      setUploading(false);
    }
  }

  async function saveBanner(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    try {
      if (modalMode === 'create') {
        await fetch('/api/admin/banners', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      } else if (editingId) {
        await fetch(`/api/admin/banners?id=${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      }
      await load();
      closeModal();
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(b: ApiBanner) {
    await fetch(`/api/admin/banners?id=${b.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ativo: !b.ativo }),
    });
    await load();
  }

  async function deleteBanner(id: string) {
    if (!confirm('Excluir este banner?')) return;
    await fetch(`/api/admin/banners?id=${id}`, { method: 'DELETE' });
    await load();
  }

  async function changeOrder(b: ApiBanner, delta: number) {
    await fetch(`/api/admin/banners?id=${b.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ordem: Math.max(0, b.ordem + delta) }),
    });
    await load();
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-purple-400">Campanhas visuais</p>
          <h2 className="mt-1 text-xl font-black text-white">Banners da Home</h2>
          <p className="mt-1 text-xs text-slate-500">{activeCount} ativos de {sortedBanners.length} banners</p>
        </div>

        <div className="flex items-center gap-2">
          <a href="/" target="_blank" className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-300 transition-all hover:bg-slate-700">
            <Eye className="h-4 w-4" strokeWidth={1.8} />
            Ver home
          </a>
          <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-purple-950/20 transition-all hover:brightness-110 active:scale-[0.99]" style={{ background: 'linear-gradient(135deg, #6b21a8, #7c3aed)' }}>
            <Plus className="h-4 w-4" strokeWidth={1.9} />
            Novo banner
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-purple-700/30 bg-purple-600/10 px-5 py-3">
        <p className="text-xs leading-5 text-purple-300">
          Quando há banners aqui, eles substituem o carrossel padrão da home. Sem nenhum banner, a home volta ao carrossel original.
        </p>
      </div>

      {loading ? (
        <p className="text-slate-400 text-center py-12">Carregando banners...</p>
      ) : sortedBanners.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700 p-12 text-center">
          <p className="text-slate-400 mb-2">Nenhum banner cadastrado.</p>
          <p className="text-slate-500 text-sm">A home está usando o carrossel padrão.</p>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
          <div className="flex flex-col gap-4">
            {sortedBanners.map((banner, index) => (
              <article key={banner.id} className={`grid gap-4 rounded-2xl border p-4 transition-all lg:grid-cols-[260px_1fr_auto] ${banner.ativo ? 'border-slate-700/60 bg-slate-900/80' : 'border-slate-800/70 bg-slate-900/40 opacity-70'}`}>
                <BannerPreview banner={banner} compact />
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <StatusBadge label={banner.ativo ? 'Ativo' : 'Inativo'} color={banner.ativo ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-600/30 text-slate-500'} />
                    <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-400">Ordem {banner.ordem}</span>
                    {banner.campanha && <span className="rounded-full bg-purple-500/10 px-2.5 py-1 text-xs font-semibold text-purple-300">{banner.campanha}</span>}
                  </div>
                  <h3 className="text-base font-black text-white">{banner.titulo}</h3>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">{banner.subtitulo}</p>
                  <div className="mt-4 grid gap-2 sm:grid-cols-3">
                    <div className="rounded-xl bg-slate-950/50 p-3">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">CTA</p>
                      <p className="mt-1 truncate text-xs font-semibold text-slate-200">{banner.cta ?? '—'}</p>
                    </div>
                    <div className="rounded-xl bg-slate-950/50 p-3">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Link</p>
                      <p className="mt-1 truncate text-xs font-semibold text-slate-200">{banner.linkUrl ?? '—'}</p>
                    </div>
                    <div className="rounded-xl bg-slate-950/50 p-3">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Imagem</p>
                      <p className="mt-1 truncate text-xs font-semibold text-slate-200">{banner.imagemUrl}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 lg:flex-col lg:items-stretch">
                  <button onClick={() => changeOrder(banner, -1)} disabled={index === 0} className="inline-flex h-9 items-center justify-center rounded-xl px-3 text-xs font-semibold text-slate-300 transition-all hover:bg-slate-800 disabled:opacity-30">↑</button>
                  <button onClick={() => changeOrder(banner, 1)} disabled={index === sortedBanners.length - 1} className="inline-flex h-9 items-center justify-center rounded-xl px-3 text-xs font-semibold text-slate-300 transition-all hover:bg-slate-800 disabled:opacity-30">↓</button>
                  <button onClick={() => openEdit(banner)} className="inline-flex h-9 items-center justify-center gap-2 rounded-xl px-3 text-xs font-semibold text-purple-300 transition-all hover:bg-purple-600/10 hover:text-purple-200">
                    <Pencil className="h-3.5 w-3.5" strokeWidth={1.9} />
                    Editar
                  </button>
                  <button onClick={() => toggleActive(banner)} className={`inline-flex h-9 items-center justify-center rounded-xl px-3 text-xs font-semibold transition-all ${banner.ativo ? 'text-red-300 hover:bg-red-600/10 hover:text-red-200' : 'text-emerald-300 hover:bg-emerald-600/10 hover:text-emerald-200'}`}>
                    {banner.ativo ? 'Desativar' : 'Ativar'}
                  </button>
                  <button onClick={() => deleteBanner(banner.id)} className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition-all hover:bg-red-600/10 hover:text-red-300" title="Excluir banner">
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
            {sortedBanners[0] && <BannerPreview banner={sortedBanners[0]} />}
          </aside>
        </div>
      )}

      <Modal open={modalMode !== null} onClose={closeModal} title={modalMode === 'create' ? 'Criar banner' : 'Editar banner'} maxWidth="max-w-5xl">
        <form onSubmit={saveBanner} className="grid gap-5 lg:grid-cols-[1fr_1fr]">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-slate-400">Título</label>
                <input value={form.titulo ?? ''} onChange={(e) => updateField('titulo', e.target.value)} className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-purple-500" placeholder="Título da campanha" required />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-400">Campanha</label>
                <input value={form.campanha ?? ''} onChange={(e) => updateField('campanha', e.target.value)} className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-purple-500" placeholder="Ex: Promoção" />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs text-slate-400">Subtítulo</label>
              <textarea value={form.subtitulo ?? ''} onChange={(e) => updateField('subtitulo', e.target.value)} className="min-h-24 w-full resize-none rounded-xl border border-slate-600 bg-slate-800 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-purple-500" placeholder="Descrição curta do banner" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-slate-400">Texto do botão</label>
                <input value={form.cta ?? ''} onChange={(e) => updateField('cta', e.target.value)} className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-purple-500" placeholder="Ver Produtos" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-400">Link do botão</label>
                <input value={form.linkUrl ?? ''} onChange={(e) => updateField('linkUrl', e.target.value)} className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-purple-500" placeholder="/produtos" />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs text-slate-400">Imagem (URL)</label>
              <div className="flex gap-2">
                <input value={form.imagemUrl} onChange={(e) => updateField('imagemUrl', e.target.value)} className="flex-1 rounded-xl border border-slate-600 bg-slate-800 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-purple-500" placeholder="https://res.cloudinary.com/..." required />
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/10 px-4 py-2.5 text-xs font-bold text-purple-300 transition-all hover:bg-purple-500/20">
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleImageUpload(f); }} />
                  {uploading ? 'Enviando...' : 'Upload'}
                </label>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs text-slate-400">Gradiente</label>
                <select value={selectedGradient.value} onChange={(e) => handleGradientChange(e.target.value)} className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-purple-500">
                  {gradientOptions.map((o) => <option key={o.label} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-400">Ordem</label>
                <input type="number" min={0} value={form.ordem} onChange={(e) => updateField('ordem', Number(e.target.value))} className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-purple-500" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-400">Status</label>
                <button type="button" onClick={() => updateField('ativo', !form.ativo)} className={`flex h-[42px] w-full items-center justify-center rounded-xl border text-sm font-semibold transition-all ${form.ativo ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-slate-600 bg-slate-800 text-slate-400'}`}>
                  {form.ativo ? 'Ativo' : 'Inativo'}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label className="mb-2 block text-xs text-slate-400">Preview da home</label>
              <BannerPreview banner={form} />
            </div>

            <div className="flex justify-end gap-3 pt-1">
              <button type="button" onClick={closeModal} className="rounded-xl px-4 py-2 text-sm text-slate-400 transition-all hover:bg-slate-700 hover:text-slate-200">Cancelar</button>
              <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all hover:brightness-110 disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #6b21a8, #7c3aed)' }}>
                <Save className="h-4 w-4" strokeWidth={1.9} />
                {saving ? 'Salvando...' : 'Salvar banner'}
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
