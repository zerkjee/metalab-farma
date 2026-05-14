'use client';

import {
  Copy,
  Eye,
  Filter,
  ImagePlus,
  PackagePlus,
  Pencil,
  Plus,
  Save,
  Search,
  SlidersHorizontal,
  Tags,
  Trash2,
} from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import Modal from '@/components/admin/Modal';
import StatusBadge from '@/components/admin/StatusBadge';
import { fmtCurrency, productStatusColors, type ProductStatus } from '@/data/admin';

// ─── Types ────────────────────────────────────────────────────────────────────

type ProductKitKey = 'unit' | 'kit2' | 'kit3' | 'kit6';

interface ManagedProduct {
  id: string;
  name: string;
  slug: string;
  brand: string;
  category: string;
  price: number;
  salePrice: number;
  stock: number;
  sold: number;
  status: ProductStatus;
  image: string;
  color: string;
  description: string;
  composition: string;
  usage: string;
  images: string[];
  tags: string[];
  kits: Record<ProductKitKey, { label: string; qty: number; price: number; saving: string }>;
  tinySku: string;
  marketplaceStatus: 'nao_integrado' | 'pronto' | 'sincronizado';
}

type ProductForm = Omit<ManagedProduct, 'id' | 'sold'> & {
  imagesText: string;
  tagsText: string;
};

interface ApiProduto {
  id: string;
  nome: string;
  slug: string;
  sku: string;
  marca: string;
  preco: number;
  precoOriginal: number | null;
  estoque: number;
  ativo: boolean;
  descricaoCurta: string | null;
  corPrincipal: string | null;
  imagemUrl: string | null;
  imagens: { url: string }[];
  categoria: { nome: string; slug: string } | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const statusOptions: Array<{ value: ProductStatus | 'todos'; label: string }> = [
  { value: 'todos', label: 'Todos status' },
  { value: 'ativo', label: 'Ativo' },
  { value: 'inativo', label: 'Inativo' },
  { value: 'sem_estoque', label: 'Sem estoque' },
];

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function buildKits(price: number): ManagedProduct['kits'] {
  return {
    unit: { label: 'Unidade', qty: 1, price, saving: 'Base' },
    kit2: { label: 'Kit 2', qty: 2, price: Number((price * 2 * 0.9).toFixed(2)), saving: '10%' },
    kit3: { label: 'Kit 3', qty: 3, price: Number((price * 3 * 0.7).toFixed(2)), saving: '30%' },
    kit6: { label: 'Kit 6', qty: 6, price: Number((price * 6 * 0.62).toFixed(2)), saving: '38%' },
  };
}

function parseList(value: string) {
  return value.split(',').map((item) => item.trim()).filter(Boolean);
}

function apiToManaged(p: ApiProduto): ManagedProduct {
  const img = p.imagens?.[0]?.url ?? p.imagemUrl ?? '/products/articulice.png';
  const status: ProductStatus = !p.ativo ? 'inativo' : p.estoque === 0 ? 'sem_estoque' : 'ativo';
  return {
    id: p.id,
    name: p.nome,
    slug: p.slug,
    brand: p.marca ?? 'Metalab',
    category: p.categoria?.nome ?? 'Suplementos',
    price: p.precoOriginal ?? p.preco,
    salePrice: p.precoOriginal ? p.preco : 0,
    stock: p.estoque,
    sold: 0,
    status,
    image: img,
    color: p.corPrincipal ?? '#6b21a8',
    description: p.descricaoCurta ?? '',
    composition: '',
    usage: '',
    images: [img],
    tags: [p.categoria?.slug ?? 'suplemento'],
    kits: buildKits(p.preco),
    tinySku: p.sku,
    marketplaceStatus: 'nao_integrado',
  };
}

function productToForm(product: ManagedProduct): ProductForm {
  return {
    ...product,
    imagesText: product.images.join(', '),
    tagsText: product.tags.join(', '),
  };
}

const emptyForm: ProductForm = {
  name: '',
  slug: '',
  brand: 'Metalab',
  category: 'Suplementos',
  price: 0,
  salePrice: 0,
  stock: 0,
  status: 'ativo',
  image: '/products/articulice.png',
  images: ['/products/articulice.png'],
  imagesText: '/products/articulice.png',
  color: '#6b21a8',
  description: '',
  composition: '',
  usage: '',
  tags: [],
  tagsText: '',
  kits: buildKits(0),
  tinySku: '',
  marketplaceStatus: 'nao_integrado',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProductCardPreview({ product }: { product: ProductForm | ManagedProduct }) {
  const statusColor = productStatusColors[product.status];
  const displayPrice = product.salePrice > 0 ? product.salePrice : product.price;
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 shadow-xl">
      <div className="relative flex h-44 items-center justify-center overflow-hidden" style={{ background: `${product.color}18` }}>
        <div className="absolute inset-0 opacity-[0.08]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}
        />
        <div className="h-32 w-32 rounded-3xl border border-white/10 bg-white/10 bg-contain bg-center bg-no-repeat p-4"
          style={{ backgroundImage: `url(${product.image})` }}
        />
      </div>
      <div className="p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="rounded-full bg-purple-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-purple-300">
            {product.category || 'Categoria'}
          </span>
          <StatusBadge label={statusColor.label} color={`${statusColor.bg} ${statusColor.text}`} />
        </div>
        <h3 className="line-clamp-2 text-sm font-black text-white">{product.name || 'Nome do produto'}</h3>
        <p className="mt-1 text-xs text-slate-500">{product.brand || 'Metalab'}</p>
        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            {product.salePrice > 0 && (
              <p className="text-xs text-slate-500 line-through">{fmtCurrency(product.price || 0)}</p>
            )}
            <p className="text-lg font-black text-white">{fmtCurrency(displayPrice || 0)}</p>
          </div>
          <span className={`text-xs font-bold ${product.stock > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {product.stock} un.
          </span>
        </div>
      </div>
    </div>
  );
}

function ProductPagePreview({ product }: { product: ProductForm | ManagedProduct }) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-950 p-4">
      <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
        <div className="h-40 rounded-2xl border border-white/10 bg-white/5 bg-contain bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${product.image})` }}
        />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-purple-300">{product.brand || 'Metalab'}</p>
          <h3 className="mt-2 text-xl font-black text-white">{product.name || 'Produto Metalab'}</h3>
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-400">
            {product.description || 'Descrição básica do produto aparecerá aqui.'}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {Object.values(product.kits).slice(0, 4).map((kit) => (
              <div key={kit.label} className="rounded-xl border border-slate-800 bg-slate-900 p-3">
                <p className="text-xs font-bold text-slate-300">{kit.label}</p>
                <p className="mt-1 text-sm font-black text-white">{fmtCurrency(kit.price || 0)}</p>
                <p className="text-[10px] text-emerald-400">Economia {kit.saving}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminProdutos() {
  const [products, setProducts] = useState<ManagedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [category, setCategory] = useState('Todos');
  const [status, setStatus] = useState<ProductStatus | 'todos'>('todos');
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ por_pagina: '100' });
    if (search) params.set('busca', search);
    fetch(`/api/admin/produtos?${params}`)
      .then((r) => r.json())
      .then((data: { produtos?: ApiProduto[]; total?: number }) => {
        if (Array.isArray(data.produtos)) {
          setProducts(data.produtos.map(apiToManaged));
          setTotal(data.total ?? data.produtos.length);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search]);

  const filtered = useMemo(() => {
    const term = searchInput.trim().toLowerCase();
    return products.filter((product) => {
      const matchSearch = !term || [product.name, product.slug, product.brand, product.category, product.tags.join(' ')]
        .some((v) => v.toLowerCase().includes(term));
      const matchCategory = category === 'Todos' || product.category === category;
      const matchStatus = status === 'todos' || product.status === status;
      return matchSearch && matchCategory && matchStatus;
    });
  }, [category, products, searchInput, status]);

  const categoryOptions = useMemo(
    () => ['Todos', ...Array.from(new Set(products.map((p) => p.category)))],
    [products],
  );

  const activeCount = products.filter((p) => p.status === 'ativo').length;
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 8).length;
  const inventoryValue = products.reduce((t, p) => t + p.price * p.stock, 0);

  function updateField<K extends keyof ProductForm>(key: K, value: ProductForm[K]) {
    setForm((cur) => ({ ...cur, [key]: value }));
  }

  function updateKit(key: ProductKitKey, field: 'price' | 'saving', value: string) {
    setForm((cur) => ({
      ...cur,
      kits: { ...cur.kits, [key]: { ...cur.kits[key], [field]: field === 'price' ? Number(value) : value } },
    }));
  }

  function openCreate() {
    setEditingId(null);
    setForm({ ...emptyForm, tinySku: `MTL-${String(products.length + 1).padStart(4, '0')}` });
    setSaveError('');
    setModalMode('create');
  }

  function openEdit(product: ManagedProduct) {
    setEditingId(product.id);
    setForm(productToForm(product));
    setSaveError('');
    setModalMode('edit');
  }

  function closeModal() {
    setModalMode(null);
    setEditingId(null);
    setSaveError('');
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setSaveError('');

    const images = parseList(form.imagesText);
    const tags = parseList(form.tagsText);
    const imageUrl = images[0] || form.image;

    // Map form → API payload
    const payload = {
      nome: form.name,
      slug: form.slug || slugify(form.name),
      sku: form.tinySku || `MTL-${Date.now()}`,
      marca: form.brand,
      preco: form.salePrice > 0 ? form.salePrice : form.price,
      precoOriginal: form.salePrice > 0 ? form.price : undefined,
      estoque: form.stock,
      descricaoCurta: form.description,
      descricaoHtml: form.description,
      corPrincipal: form.color,
      imagemUrl: imageUrl,
      ativo: form.status !== 'inativo',
      destaque: false,
    };

    try {
      let res: Response;
      if (modalMode === 'create') {
        res = await fetch('/api/produtos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`/api/produtos/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();

      if (!res.ok) {
        setSaveError(data.erro ?? 'Erro ao salvar produto.');
        setSaving(false);
        return;
      }

      // Optimistic update
      const saved = apiToManaged({ ...data, imagens: imageUrl ? [{ url: imageUrl }] : [], categoria: null });
      saved.tags = tags;

      setProducts((cur) => {
        if (modalMode === 'create') return [saved, ...cur];
        return cur.map((p) => p.id === editingId ? saved : p);
      });
      setTotal((t) => modalMode === 'create' ? t + 1 : t);
      closeModal();
    } catch {
      setSaveError('Erro de conexão. Tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  async function toggleProductStatus(product: ManagedProduct) {
    const newAtivo = product.status === 'inativo';
    const res = await fetch(`/api/produtos/${product.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ativo: newAtivo }),
    });
    if (res.ok) {
      setProducts((cur) => cur.map((p) =>
        p.id === product.id ? { ...p, status: newAtivo ? 'ativo' : 'inativo', ativo: newAtivo } as ManagedProduct : p,
      ));
    }
  }

  async function deleteProduct(id: string) {
    const res = await fetch(`/api/produtos/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setProducts((cur) => cur.filter((p) => p.id !== id));
      setTotal((t) => t - 1);
    }
  }

  async function duplicateProduct(product: ManagedProduct) {
    const payload = {
      nome: `${product.name} Cópia`,
      slug: `${product.slug}-copia-${Date.now()}`,
      sku: `${product.tinySku}-CP`,
      marca: product.brand,
      preco: product.salePrice > 0 ? product.salePrice : product.price,
      precoOriginal: product.salePrice > 0 ? product.price : undefined,
      estoque: product.stock,
      descricaoCurta: product.description,
      descricaoHtml: product.description,
      corPrincipal: product.color,
      imagemUrl: product.image,
      ativo: false,
      destaque: false,
    };
    const res = await fetch('/api/produtos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await res.json();
      const copy = apiToManaged({ ...data, imagens: [{ url: product.image }], categoria: null });
      setProducts((cur) => [copy, ...cur]);
      setTotal((t) => t + 1);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-purple-400">Catálogo administrativo</p>
          <h2 className="mt-1 text-xl font-black text-white">Produtos</h2>
          <p className="mt-1 text-xs text-slate-500">{total} produtos no banco de dados</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-purple-950/20 transition-all hover:brightness-110 active:scale-[0.99]"
          style={{ background: 'linear-gradient(135deg, #6b21a8, #7c3aed)' }}
        >
          <Plus className="h-4 w-4" strokeWidth={1.9} />
          Novo produto
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        {[
          { label: 'Ativos', value: activeCount },
          { label: 'Estoque baixo', value: lowStockCount },
          { label: 'Categorias', value: categoryOptions.length - 1 },
          { label: 'Valor em estoque', value: fmtCurrency(inventoryValue) },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-xs text-slate-500">{item.label}</p>
            <p className="mt-1 text-2xl font-black text-white">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex min-w-56 flex-1 items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2">
          <Search className="h-4 w-4 flex-shrink-0 text-slate-500" strokeWidth={1.8} />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { setSearch(searchInput); } }}
            placeholder="Buscar por nome, slug, SKU..."
            className="w-full bg-transparent text-sm text-slate-300 outline-none placeholder:text-slate-600"
          />
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2">
          <Filter className="h-4 w-4 text-slate-500" strokeWidth={1.8} />
          <select value={category} onChange={(e) => setCategory(e.target.value)}
            className="bg-transparent text-xs text-slate-300 outline-none">
            {categoryOptions.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2">
          <SlidersHorizontal className="h-4 w-4 text-slate-500" strokeWidth={1.8} />
          <select value={status} onChange={(e) => setStatus(e.target.value as ProductStatus | 'todos')}
            className="bg-transparent text-xs text-slate-300 outline-none">
            {statusOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-700/50 bg-slate-800/70 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">Produto</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">Categoria</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500">Preço</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500">Estoque</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500">Status</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-5 py-3">
                      <div className="h-10 rounded-lg bg-slate-700/40 animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-500">
                    {products.length === 0 ? 'Nenhum produto cadastrado. Crie o primeiro!' : 'Nenhum produto encontrado.'}
                  </td>
                </tr>
              ) : (
                filtered.map((product, index) => {
                  const statusColor = productStatusColors[product.status];
                  return (
                    <tr key={product.id}
                      className={`transition-colors hover:bg-slate-700/30 ${index < filtered.length - 1 ? 'border-b border-slate-700/30' : ''}`}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="h-12 w-12 flex-shrink-0 rounded-xl border border-white/10 bg-contain bg-center bg-no-repeat"
                            style={{ backgroundColor: `${product.color}22`, backgroundImage: `url(${product.image})` }}
                          />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-100">{product.name}</p>
                            <p className="truncate text-xs text-slate-500">{product.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-xs font-semibold text-slate-300">{product.category}</p>
                        <p className="text-[11px] text-slate-500">{product.brand}</p>
                      </td>
                      <td className="px-5 py-4 text-right">
                        {product.salePrice > 0 && (
                          <p className="text-xs text-slate-500 line-through">{fmtCurrency(product.price)}</p>
                        )}
                        <p className="text-sm font-black text-white">{fmtCurrency(product.salePrice || product.price)}</p>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <p className={`text-sm font-black ${product.stock === 0 ? 'text-red-400' : product.stock <= 8 ? 'text-yellow-400' : 'text-slate-200'}`}>
                          {product.stock}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <StatusBadge label={statusColor.label} color={`${statusColor.bg} ${statusColor.text}`} />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-1.5">
                          <button onClick={() => openEdit(product)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-purple-300 transition-all hover:bg-purple-600/10"
                            title="Editar">
                            <Pencil className="h-4 w-4" strokeWidth={1.8} />
                          </button>
                          <button onClick={() => duplicateProduct(product)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-slate-700 hover:text-white"
                            title="Duplicar">
                            <Copy className="h-4 w-4" strokeWidth={1.8} />
                          </button>
                          <button onClick={() => toggleProductStatus(product)}
                            className={`inline-flex h-9 px-3 items-center justify-center rounded-xl text-xs font-semibold transition-all ${
                              product.status !== 'inativo'
                                ? 'text-red-300 hover:bg-red-600/10'
                                : 'text-emerald-300 hover:bg-emerald-600/10'
                            }`}>
                            {product.status !== 'inativo' ? 'Desativar' : 'Ativar'}
                          </button>
                          <button onClick={() => deleteProduct(product.id)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition-all hover:bg-red-600/10 hover:text-red-300"
                            title="Excluir">
                            <Trash2 className="h-4 w-4" strokeWidth={1.8} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal
        open={modalMode !== null}
        onClose={closeModal}
        title={modalMode === 'create' ? 'Adicionar produto' : `Editar — ${form.name}`}
        maxWidth="max-w-6xl"
      >
        <form onSubmit={saveProduct} className="max-h-[78vh] overflow-y-auto pr-1">
          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-5">
              <section className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
                <div className="mb-4 flex items-center gap-2">
                  <PackagePlus className="h-4 w-4 text-purple-300" strokeWidth={1.8} />
                  <h3 className="text-sm font-black text-white">Dados principais</h3>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs text-slate-400">Nome</label>
                    <input value={form.name}
                      onChange={(e) => { updateField('name', e.target.value); if (!form.slug) updateField('slug', slugify(e.target.value)); }}
                      className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-purple-500"
                      required />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-slate-400">Slug</label>
                    <input value={form.slug} onChange={(e) => updateField('slug', e.target.value)}
                      className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-purple-500"
                      required />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-slate-400">Marca</label>
                    <input value={form.brand} onChange={(e) => updateField('brand', e.target.value)}
                      className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-purple-500" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-slate-400">Categoria</label>
                    <input value={form.category} onChange={(e) => updateField('category', e.target.value)}
                      className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-purple-500" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-slate-400">Preço</label>
                    <input type="number" min={0} step="0.01" value={form.price}
                      onChange={(e) => { const p = Number(e.target.value); updateField('price', p); updateField('kits', buildKits(p)); }}
                      className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-purple-500" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-slate-400">Preço promocional</label>
                    <input type="number" min={0} step="0.01" value={form.salePrice}
                      onChange={(e) => updateField('salePrice', Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-purple-500" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-slate-400">Estoque</label>
                    <input type="number" min={0} value={form.stock}
                      onChange={(e) => updateField('stock', Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-purple-500" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-slate-400">Status</label>
                    <select value={form.status} onChange={(e) => updateField('status', e.target.value as ProductStatus)}
                      className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-purple-500">
                      <option value="ativo">Ativo</option>
                      <option value="inativo">Inativo</option>
                      <option value="sem_estoque">Sem estoque</option>
                    </select>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
                <div className="mb-4 flex items-center gap-2">
                  <Tags className="h-4 w-4 text-purple-300" strokeWidth={1.8} />
                  <h3 className="text-sm font-black text-white">Conteúdo e mídia</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-xs text-slate-400">Descrição</label>
                    <textarea value={form.description} onChange={(e) => updateField('description', e.target.value)}
                      className="min-h-24 w-full resize-none rounded-xl border border-slate-600 bg-slate-800 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-purple-500" />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs text-slate-400">Composição</label>
                      <textarea value={form.composition} onChange={(e) => updateField('composition', e.target.value)}
                        className="min-h-24 w-full resize-none rounded-xl border border-slate-600 bg-slate-800 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-purple-500" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-slate-400">Modo de uso</label>
                      <textarea value={form.usage} onChange={(e) => updateField('usage', e.target.value)}
                        className="min-h-24 w-full resize-none rounded-xl border border-slate-600 bg-slate-800 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-purple-500" />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-slate-400">Imagem URL</label>
                    <input value={form.imagesText}
                      onChange={(e) => { updateField('imagesText', e.target.value); updateField('image', parseList(e.target.value)[0] || form.image); }}
                      className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-purple-500"
                      placeholder="/products/produto.png" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-slate-400">Tags</label>
                    <input value={form.tagsText} onChange={(e) => updateField('tagsText', e.target.value)}
                      className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-purple-500"
                      placeholder="suplemento, kit, destaque" />
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
                <h3 className="mb-4 text-sm font-black text-white">Kits e economia visual</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {(Object.keys(form.kits) as ProductKitKey[]).map((key) => {
                    const kit = form.kits[key];
                    return (
                      <div key={key} className="rounded-2xl border border-slate-800 bg-slate-950/50 p-3">
                        <p className="mb-3 text-xs font-bold text-slate-300">{kit.label} · {kit.qty} un.</p>
                        <div className="grid grid-cols-2 gap-2">
                          <input type="number" min={0} step="0.01" value={kit.price}
                            onChange={(e) => updateKit(key, 'price', e.target.value)}
                            className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-slate-200 outline-none focus:border-purple-500" />
                          <input value={kit.saving} onChange={(e) => updateKit(key, 'saving', e.target.value)}
                            className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-slate-200 outline-none focus:border-purple-500"
                            placeholder="Economia" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
                <h3 className="mb-4 text-sm font-black text-white">Configurações</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs text-slate-400">SKU</label>
                    <input value={form.tinySku} onChange={(e) => updateField('tinySku', e.target.value)}
                      className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-purple-500" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-slate-400">Cor do produto (hex)</label>
                    <input value={form.color} onChange={(e) => updateField('color', e.target.value)}
                      className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-purple-500" />
                  </div>
                </div>
              </section>
            </div>

            <aside className="space-y-4 xl:sticky xl:top-0 xl:self-start">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <ImagePlus className="h-4 w-4 text-purple-300" strokeWidth={1.8} />
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Preview card</p>
                </div>
                <ProductCardPreview product={form} />
              </div>
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Eye className="h-4 w-4 text-purple-300" strokeWidth={1.8} />
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Preview página</p>
                </div>
                <ProductPagePreview product={form} />
              </div>

              {saveError && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-400">
                  {saveError}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button type="button" onClick={closeModal}
                  className="rounded-xl px-4 py-2 text-sm text-slate-400 transition-all hover:bg-slate-700 hover:text-slate-200">
                  Cancelar
                </button>
                <button type="submit" disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all hover:brightness-110 disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #6b21a8, #7c3aed)' }}>
                  <Save className="h-4 w-4" strokeWidth={1.9} />
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </aside>
          </div>
        </form>
      </Modal>
    </div>
  );
}
