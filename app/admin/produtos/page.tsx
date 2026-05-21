'use client';

import {
  Box, Copy, Eye, Filter, ImagePlus, Package, PackagePlus,
  Pencil, Plus, Save, Search, SlidersHorizontal, Tag, Trash2, X,
} from 'lucide-react';
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Modal from '@/components/admin/Modal';
import StatusBadge from '@/components/admin/StatusBadge';
import { fmtCurrency, productStatusColors, type ProductStatus } from '@/data/admin';

// ─── Types ────────────────────────────────────────────────────────────────────

type TipoProduto = 'SIMPLES' | 'KIT';

interface KitItemForm {
  produtoId: string;
  produtoNome: string;
  precoUnit: number;
  quantidade: number;
  ordem: number;
}

interface ApiCategoria {
  id: string;
  nome: string;
  slug: string;
}

interface ApiProduto {
  id: string;
  nome: string;
  slug: string;
  sku: string;
  ean: string | null;
  marca: string;
  tipo: TipoProduto;
  categoriaId: string | null;
  preco: number;
  precoOriginal: number | null;
  estoque: number;
  ativo: boolean;
  destaque: boolean;
  descricaoCurta: string | null;
  composicao: string | null;
  modoDeUso: string | null;
  pesoGramas: number | null;
  alturaCm: number | null;
  larguraCm: number | null;
  comprimentoCm: number | null;
  tags: string[];
  corPrincipal: string | null;
  imagemUrl: string | null;
  imagens: { url: string }[];
  categoria: { id: string; nome: string; slug: string } | null;
  kitItens?: { produtoId: string; quantidade: number; ordem: number; produto: { id: string; nome: string; preco: number } }[];
}

interface ManagedProduct {
  id: string;
  name: string;
  slug: string;
  sku: string;
  ean: string;
  brand: string;
  categoriaId: string;
  tipo: TipoProduto;
  price: number;
  salePrice: number;
  stock: number;
  status: ProductStatus;
  image: string;
  color: string;
  description: string;
  composicao: string;
  modoDeUso: string;
  pesoGramas: number | null;
  alturaCm: number | null;
  larguraCm: number | null;
  comprimentoCm: number | null;
  tags: string[];
  kitItens: KitItemForm[];
}

type ProductForm = Omit<ManagedProduct, 'id'> & { tagsText: string };

// ─── Helpers ──────────────────────────────────────────────────────────────────

const statusOptions: Array<{ value: ProductStatus | 'todos'; label: string }> = [
  { value: 'todos', label: 'Todos status' },
  { value: 'ativo', label: 'Ativo' },
  { value: 'inativo', label: 'Inativo' },
  { value: 'sem_estoque', label: 'Sem estoque' },
];

function slugify(value: string) {
  return value
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function apiToManaged(p: ApiProduto): ManagedProduct {
  const img = p.imagens?.[0]?.url ?? p.imagemUrl ?? '';
  const status: ProductStatus = !p.ativo ? 'inativo' : p.estoque === 0 ? 'sem_estoque' : 'ativo';
  return {
    id: p.id,
    name: p.nome,
    slug: p.slug,
    sku: p.sku,
    ean: p.ean ?? '',
    brand: p.marca ?? 'Metalab',
    categoriaId: p.categoriaId ?? '',
    tipo: p.tipo ?? 'SIMPLES',
    price: p.precoOriginal ?? p.preco,
    salePrice: p.precoOriginal ? p.preco : 0,
    stock: p.estoque,
    status,
    image: img,
    color: p.corPrincipal ?? '#6b21a8',
    description: p.descricaoCurta ?? '',
    composicao: p.composicao ?? '',
    modoDeUso: p.modoDeUso ?? '',
    pesoGramas: p.pesoGramas ?? null,
    alturaCm: p.alturaCm ?? null,
    larguraCm: p.larguraCm ?? null,
    comprimentoCm: p.comprimentoCm ?? null,
    tags: p.tags ?? [],
    kitItens: (p.kitItens ?? []).map((k, i) => ({
      produtoId: k.produtoId,
      produtoNome: k.produto?.nome ?? k.produtoId,
      precoUnit: k.produto?.preco ?? 0,
      quantidade: k.quantidade,
      ordem: i,
    })),
  };
}

function productToForm(p: ManagedProduct): ProductForm {
  return { ...p, tagsText: p.tags.join(', ') };
}

const emptyForm: ProductForm = {
  name: '', slug: '', sku: '', ean: '', brand: 'Metalab', categoriaId: '',
  tipo: 'SIMPLES', price: 0, salePrice: 0, stock: 0, status: 'ativo',
  image: '', color: '#6b21a8', description: '',
  composicao: '', modoDeUso: '',
  pesoGramas: null, alturaCm: null, larguraCm: null, comprimentoCm: null,
  tags: [], tagsText: '', kitItens: [],
};

// ─── Input helper ─────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs text-slate-400">{label}</label>
      {children}
    </div>
  );
}

const inputCls = 'w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-purple-500';
const textareaCls = `${inputCls} min-h-24 resize-none`;

// ─── Preview components ───────────────────────────────────────────────────────

function ProductCardPreview({ product }: { product: ProductForm }) {
  const statusColor = productStatusColors[product.status];
  const displayPrice = product.salePrice > 0 ? product.salePrice : product.price;
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 shadow-xl">
      <div className="relative flex h-44 items-center justify-center overflow-hidden" style={{ background: `${product.color}18` }}>
        <div className="absolute inset-0 opacity-[0.08]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        {product.image
          ? <div className="h-32 w-32 rounded-3xl border border-white/10 bg-white/10 bg-contain bg-center bg-no-repeat p-4" style={{ backgroundImage: `url(${product.image})` }} />
          : <Package className="h-16 w-16 text-white/20" />}
      </div>
      <div className="p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="rounded-full bg-purple-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-purple-300">
            {product.tipo === 'KIT' ? '📦 Kit' : 'Suplemento'}
          </span>
          <StatusBadge label={statusColor.label} color={`${statusColor.bg} ${statusColor.text}`} />
        </div>
        <h3 className="line-clamp-2 text-sm font-black text-white">{product.name || 'Nome do produto'}</h3>
        <p className="mt-1 text-xs text-slate-500">{product.brand || 'Metalab'}</p>
        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            {product.salePrice > 0 && <p className="text-xs text-slate-500 line-through">{fmtCurrency(product.price)}</p>}
            <p className="text-lg font-black text-white">{fmtCurrency(displayPrice)}</p>
          </div>
          <span className={`text-xs font-bold ${product.stock > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {product.stock} un.
          </span>
        </div>
        {product.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {product.tags.slice(0, 3).map((t) => (
              <span key={t} className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400">{t}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminProdutos() {
  const [products, setProducts]         = useState<ManagedProduct[]>([]);
  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState(false);
  const [total, setTotal]               = useState(0);
  const [search, setSearch]             = useState('');
  const [searchInput, setSearchInput]   = useState('');
  const [statusFilter, setStatusFilter] = useState<ProductStatus | 'todos'>('todos');
  const [modalMode, setModalMode]       = useState<'create' | 'edit' | null>(null);
  const [editingId, setEditingId]       = useState<string | null>(null);
  const [form, setForm]                 = useState<ProductForm>(emptyForm);
  const [saveError, setSaveError]       = useState('');
  const [uploading, setUploading]       = useState(false);
  const [categorias, setCategorias]     = useState<ApiCategoria[]>([]);
  const [prodListKit, setProdListKit]   = useState<{ id: string; nome: string; preco: number }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Carrega categorias uma vez
  useEffect(() => {
    fetch('/api/categorias').then(r => r.json()).then(d => setCategorias(d.categorias ?? [])).catch(() => {});
  }, []);

  // Carrega produtos
  const loadProducts = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ por_pagina: '200' });
    if (search) params.set('busca', search);
    fetch(`/api/admin/produtos?${params}`)
      .then(r => r.json())
      .then((data: { produtos?: ApiProduto[]; total?: number }) => {
        if (!Array.isArray(data.produtos)) return;
        setProducts(data.produtos.map(apiToManaged));
        setTotal(data.total ?? data.produtos.length);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search]);

  // eslint-disable-next-line react-compiler/react-compiler
  useEffect(() => { loadProducts(); }, [loadProducts]);

  // Carrega lista de produtos para seleção de componentes de kit
  useEffect(() => {
    if (form.tipo !== 'KIT') return;
    fetch('/api/admin/produtos?por_pagina=200')
      .then(r => r.json())
      .then((d: { produtos?: ApiProduto[] }) => {
        setProdListKit((d.produtos ?? [])
          .filter(p => p.tipo === 'SIMPLES' && p.ativo)
          .map(p => ({ id: p.id, nome: p.nome, preco: p.preco })));
      })
      .catch(() => {});
  }, [form.tipo]);

  const filtered = useMemo(() => {
    const term = searchInput.trim().toLowerCase();
    return products.filter(p => {
      const matchSearch = !term || [p.name, p.slug, p.brand, p.sku].some(v => v.toLowerCase().includes(term));
      const matchStatus = statusFilter === 'todos' || p.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [products, searchInput, statusFilter]);

  const activeCount     = products.filter(p => p.status === 'ativo').length;
  const lowStockCount   = products.filter(p => p.stock > 0 && p.stock <= 8).length;
  const inventoryValue  = products.reduce((t, p) => t + (p.salePrice || p.price) * p.stock, 0);
  const kitCount        = products.filter(p => p.tipo === 'KIT').length;

  function updateField<K extends keyof ProductForm>(key: K, value: ProductForm[K]) {
    setForm(cur => ({ ...cur, [key]: value }));
  }

  function openCreate() {
    setEditingId(null);
    setForm({ ...emptyForm, sku: `MTL-${String(products.length + 1).padStart(4, '0')}` });
    setSaveError('');
    setModalMode('create');
  }

  async function openEdit(product: ManagedProduct) {
    setEditingId(product.id);
    // Re-fetch para pegar kitItens atualizados
    const res = await fetch(`/api/produtos/${product.id}`).catch(() => null);
    if (res?.ok) {
      const data: ApiProduto = await res.json();
      setForm(productToForm(apiToManaged(data)));
    } else {
      setForm(productToForm(product));
    }
    setSaveError('');
    setModalMode('edit');
  }

  function closeModal() { setModalMode(null); setEditingId(null); setSaveError(''); }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setSaveError('');

    const tags = form.tagsText.split(',').map(t => t.trim()).filter(Boolean);

    const payload: Record<string, unknown> = {
      nome:          form.name,
      slug:          form.slug || slugify(form.name),
      sku:           form.sku || `MTL-${Date.now()}`,
      ean:           form.ean || null,
      marca:         form.brand,
      categoriaId:   form.categoriaId || null,
      tipo:          form.tipo,
      preco:         form.salePrice > 0 ? form.salePrice : form.price,
      precoOriginal: form.salePrice > 0 ? form.price : null,
      estoque:       form.stock,
      descricaoCurta: form.description || null,
      composicao:    form.composicao || null,
      modoDeUso:     form.modoDeUso || null,
      pesoGramas:    form.pesoGramas || null,
      alturaCm:      form.alturaCm || null,
      larguraCm:     form.larguraCm || null,
      comprimentoCm: form.comprimentoCm || null,
      tags,
      corPrincipal:  form.color || null,
      imagemUrl:     form.image || null,
      ativo:         form.status !== 'inativo',
      destaque:      false,
    };

    if (form.tipo === 'KIT') {
      payload.kitItens = form.kitItens.map((k, i) => ({
        produtoId: k.produtoId, quantidade: k.quantidade, ordem: i,
      }));
    } else {
      payload.kitItens = [];
    }

    try {
      const url    = modalMode === 'create' ? '/api/produtos' : `/api/produtos/${editingId}`;
      const method = modalMode === 'create' ? 'POST' : 'PUT';
      const res    = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data   = await res.json();

      if (!res.ok) { setSaveError(data.erro ?? 'Erro ao salvar produto.'); setSaving(false); return; }

      loadProducts();
      closeModal();
    } catch {
      setSaveError('Erro de conexão. Tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(product: ManagedProduct) {
    const newAtivo = product.status === 'inativo';
    const res = await fetch(`/api/produtos/${product.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ativo: newAtivo }),
    });
    if (res.ok) loadProducts();
  }

  async function deleteProduct(id: string) {
    if (!confirm('Desativar este produto?')) return;
    const res = await fetch(`/api/produtos/${id}`, { method: 'DELETE' });
    if (res.ok) loadProducts();
  }

  async function duplicateProduct(product: ManagedProduct) {
    const payload = {
      nome: `${product.name} Cópia`, slug: `${product.slug}-copia-${Date.now()}`,
      sku: `${product.sku}-CP`, marca: product.brand,
      tipo: 'SIMPLES' as TipoProduto,
      preco: product.salePrice || product.price, estoque: 0,
      descricaoCurta: product.description, imagemUrl: product.image,
      corPrincipal: product.color, tags: product.tags, ativo: false,
    };
    const res = await fetch('/api/produtos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (res.ok) loadProducts();
  }

  async function handleImageUpload(file: File) {
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res  = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) { setSaveError(data.erro ?? 'Erro no upload'); return; }
      updateField('image', data.url);
    } catch {
      setSaveError('Erro de conexão no upload.');
    } finally {
      setUploading(false);
    }
  }

  // ─── Kit items ──────────────────────────────────────────────────────────────

  function addKitItem(produtoId: string) {
    const prod = prodListKit.find(p => p.id === produtoId);
    if (!prod) return;
    if (form.kitItens.some(k => k.produtoId === produtoId)) return;
    updateField('kitItens', [
      ...form.kitItens,
      { produtoId: prod.id, produtoNome: prod.nome, precoUnit: prod.preco, quantidade: 1, ordem: form.kitItens.length },
    ]);
  }

  function updateKitItemQty(produtoId: string, qty: number) {
    updateField('kitItens', form.kitItens.map(k => k.produtoId === produtoId ? { ...k, quantidade: Math.max(1, qty) } : k));
  }

  function removeKitItem(produtoId: string) {
    updateField('kitItens', form.kitItens.filter(k => k.produtoId !== produtoId));
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-purple-400">Catálogo administrativo</p>
          <h2 className="mt-1 text-xl font-black text-white">Produtos</h2>
          <p className="mt-1 text-xs text-slate-500">{total} produtos no banco de dados</p>
        </div>
        <button onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-purple-950/20 transition-all hover:brightness-110"
          style={{ background: 'linear-gradient(135deg, #6b21a8, #7c3aed)' }}>
          <Plus className="h-4 w-4" strokeWidth={1.9} />
          Novo produto
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-3 md:grid-cols-4">
        {[
          { label: 'Ativos', value: activeCount },
          { label: 'Estoque baixo', value: lowStockCount },
          { label: 'Kits cadastrados', value: kitCount },
          { label: 'Valor em estoque', value: fmtCurrency(inventoryValue) },
        ].map(item => (
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
          <input value={searchInput} onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') setSearch(searchInput); }}
            placeholder="Buscar por nome, slug, SKU..."
            className="w-full bg-transparent text-sm text-slate-300 outline-none placeholder:text-slate-600" />
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2">
          <SlidersHorizontal className="h-4 w-4 text-slate-500" strokeWidth={1.8} />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as ProductStatus | 'todos')}
            className="bg-transparent text-xs text-slate-300 outline-none">
            {statusOptions.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
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
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">Tipo / Tags</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500">Preço</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500">Estoque</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500">Status</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}><td colSpan={6} className="px-5 py-3">
                      <div className="h-10 rounded-lg bg-slate-700/40 animate-pulse" />
                    </td></tr>
                  ))
                : filtered.length === 0
                ? <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-500">
                    {products.length === 0 ? 'Nenhum produto cadastrado. Crie o primeiro!' : 'Nenhum produto encontrado.'}
                  </td></tr>
                : filtered.map((product, index) => {
                    const statusColor = productStatusColors[product.status];
                    return (
                      <tr key={product.id}
                        className={`transition-colors hover:bg-slate-700/30 ${index < filtered.length - 1 ? 'border-b border-slate-700/30' : ''}`}>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 flex-shrink-0 rounded-xl border border-white/10 bg-contain bg-center bg-no-repeat"
                              style={{ backgroundColor: `${product.color}22`, backgroundImage: product.image ? `url(${product.image})` : undefined }}>
                              {!product.image && <Package className="h-5 w-5 m-auto mt-3 text-slate-600" />}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold text-slate-100">{product.name}</p>
                              <p className="truncate text-xs text-slate-500">{product.sku}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${product.tipo === 'KIT' ? 'bg-blue-500/10 text-blue-300' : 'bg-purple-500/10 text-purple-300'}`}>
                            {product.tipo}
                          </span>
                          {product.tags.slice(0, 2).map(t => (
                            <span key={t} className="ml-1 inline-block rounded-full bg-slate-700 px-1.5 py-0.5 text-[10px] text-slate-400">{t}</span>
                          ))}
                        </td>
                        <td className="px-5 py-4 text-right">
                          {product.salePrice > 0 && <p className="text-xs text-slate-500 line-through">{fmtCurrency(product.price)}</p>}
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
                              className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-purple-300 transition-all hover:bg-purple-600/10" title="Editar">
                              <Pencil className="h-4 w-4" strokeWidth={1.8} />
                            </button>
                            <button onClick={() => duplicateProduct(product)}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-slate-700 hover:text-white" title="Duplicar">
                              <Copy className="h-4 w-4" strokeWidth={1.8} />
                            </button>
                            <button onClick={() => toggleStatus(product)}
                              className={`inline-flex h-9 px-3 items-center justify-center rounded-xl text-xs font-semibold transition-all ${product.status !== 'inativo' ? 'text-red-300 hover:bg-red-600/10' : 'text-emerald-300 hover:bg-emerald-600/10'}`}>
                              {product.status !== 'inativo' ? 'Desativar' : 'Ativar'}
                            </button>
                            <button onClick={() => deleteProduct(product.id)}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition-all hover:bg-red-600/10 hover:text-red-300" title="Excluir">
                              <Trash2 className="h-4 w-4" strokeWidth={1.8} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal open={modalMode !== null} onClose={closeModal}
        title={modalMode === 'create' ? 'Adicionar produto' : `Editar — ${form.name}`}
        maxWidth="max-w-6xl">
        <form onSubmit={saveProduct} className="max-h-[78vh] overflow-y-auto pr-1">
          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-5">

              {/* 1. Dados principais */}
              <section className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
                <div className="mb-4 flex items-center gap-2">
                  <PackagePlus className="h-4 w-4 text-purple-300" strokeWidth={1.8} />
                  <h3 className="text-sm font-black text-white">Dados principais</h3>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Nome">
                    <input value={form.name} required
                      onChange={e => { updateField('name', e.target.value); if (!form.slug) updateField('slug', slugify(e.target.value)); }}
                      className={inputCls} />
                  </Field>
                  <Field label="Slug">
                    <input value={form.slug} required onChange={e => updateField('slug', e.target.value)} className={inputCls} />
                  </Field>
                  <Field label="SKU">
                    <input value={form.sku} required onChange={e => updateField('sku', e.target.value)} className={inputCls} />
                  </Field>
                  <Field label="EAN / Código de barras">
                    <input value={form.ean} onChange={e => updateField('ean', e.target.value)} className={inputCls} placeholder="Opcional" />
                  </Field>
                  <Field label="Marca">
                    <input value={form.brand} onChange={e => updateField('brand', e.target.value)} className={inputCls} />
                  </Field>
                  <Field label="Categoria">
                    {categorias.length > 0
                      ? <select value={form.categoriaId} onChange={e => updateField('categoriaId', e.target.value)} className={inputCls}>
                          <option value="">— Sem categoria —</option>
                          {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                        </select>
                      : <input value="" disabled className={`${inputCls} opacity-50`} placeholder="Nenhuma categoria cadastrada" />}
                  </Field>
                  <Field label="Tipo de produto">
                    <select value={form.tipo} onChange={e => updateField('tipo', e.target.value as TipoProduto)} className={inputCls}>
                      <option value="SIMPLES">Simples</option>
                      <option value="KIT">Kit (composto por outros produtos)</option>
                    </select>
                  </Field>
                  <Field label="Status">
                    <select value={form.status} onChange={e => updateField('status', e.target.value as ProductStatus)} className={inputCls}>
                      <option value="ativo">Ativo</option>
                      <option value="inativo">Inativo</option>
                      <option value="sem_estoque">Sem estoque</option>
                    </select>
                  </Field>
                  <Field label="Preço (R$)">
                    <input type="number" min={0} step="0.01" value={form.price}
                      onChange={e => updateField('price', Number(e.target.value))} className={inputCls} />
                  </Field>
                  <Field label="Preço promocional (R$)">
                    <input type="number" min={0} step="0.01" value={form.salePrice}
                      onChange={e => updateField('salePrice', Number(e.target.value))} className={inputCls} />
                  </Field>
                  <Field label="Estoque">
                    <input type="number" min={0} value={form.stock}
                      onChange={e => updateField('stock', Number(e.target.value))} className={inputCls} />
                  </Field>
                  <Field label="Cor do produto (hex)">
                    <input value={form.color} onChange={e => updateField('color', e.target.value)} className={inputCls} placeholder="#6b21a8" />
                  </Field>
                </div>
              </section>

              {/* 2. Informações do suplemento */}
              <section className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
                <div className="mb-4 flex items-center gap-2">
                  <Filter className="h-4 w-4 text-purple-300" strokeWidth={1.8} />
                  <h3 className="text-sm font-black text-white">Informações do suplemento</h3>
                </div>
                <div className="space-y-4">
                  <Field label="Descrição curta">
                    <textarea value={form.description} onChange={e => updateField('description', e.target.value)} className={textareaCls} />
                  </Field>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Composição">
                      <textarea value={form.composicao} onChange={e => updateField('composicao', e.target.value)}
                        className={textareaCls} placeholder="Ex: Whey Protein Concentrado, Cacau, Estévia..." />
                    </Field>
                    <Field label="Modo de uso">
                      <textarea value={form.modoDeUso} onChange={e => updateField('modoDeUso', e.target.value)}
                        className={textareaCls} placeholder="Ex: Misturar 1 dose (30g) com 200ml de água ou leite..." />
                    </Field>
                  </div>
                </div>
              </section>

              {/* 3. Logística */}
              <section className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
                <div className="mb-4 flex items-center gap-2">
                  <Box className="h-4 w-4 text-purple-300" strokeWidth={1.8} />
                  <h3 className="text-sm font-black text-white">Logística</h3>
                  <span className="text-xs text-slate-500">(usado pelo Melhor Envio para calcular frete)</span>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Field label="Peso (g)">
                    <input type="number" min={1} value={form.pesoGramas ?? ''}
                      onChange={e => updateField('pesoGramas', e.target.value ? Number(e.target.value) : null)}
                      className={inputCls} placeholder="Ex: 500" />
                  </Field>
                  <Field label="Altura (cm)">
                    <input type="number" min={1} value={form.alturaCm ?? ''}
                      onChange={e => updateField('alturaCm', e.target.value ? Number(e.target.value) : null)}
                      className={inputCls} placeholder="Ex: 20" />
                  </Field>
                  <Field label="Largura (cm)">
                    <input type="number" min={1} value={form.larguraCm ?? ''}
                      onChange={e => updateField('larguraCm', e.target.value ? Number(e.target.value) : null)}
                      className={inputCls} placeholder="Ex: 10" />
                  </Field>
                  <Field label="Comprimento (cm)">
                    <input type="number" min={1} value={form.comprimentoCm ?? ''}
                      onChange={e => updateField('comprimentoCm', e.target.value ? Number(e.target.value) : null)}
                      className={inputCls} placeholder="Ex: 10" />
                  </Field>
                </div>
              </section>

              {/* 4. Mídia */}
              <section className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
                <div className="mb-4 flex items-center gap-2">
                  <ImagePlus className="h-4 w-4 text-purple-300" strokeWidth={1.8} />
                  <h3 className="text-sm font-black text-white">Mídia</h3>
                </div>
                <Field label="Imagem principal">
                  <div className="flex gap-2">
                    <input value={form.image} onChange={e => updateField('image', e.target.value)}
                      className={`${inputCls} flex-1`} placeholder="URL ou faça upload →" />
                    <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                      onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); e.target.value = ''; }} />
                    <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-600 bg-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 transition-all hover:bg-slate-600 disabled:opacity-50">
                      <ImagePlus className="h-3.5 w-3.5" strokeWidth={1.8} />
                      {uploading ? 'Enviando…' : 'Upload'}
                    </button>
                  </div>
                </Field>
              </section>

              {/* 5. Tags */}
              <section className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
                <div className="mb-4 flex items-center gap-2">
                  <Tag className="h-4 w-4 text-purple-300" strokeWidth={1.8} />
                  <h3 className="text-sm font-black text-white">Tags e descoberta</h3>
                </div>
                <Field label="Tags (separadas por vírgula)">
                  <input value={form.tagsText}
                    onChange={e => {
                      updateField('tagsText', e.target.value);
                      updateField('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean));
                    }}
                    className={inputCls} placeholder="whey, proteína, baunilha, ganho muscular" />
                </Field>
                {form.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {form.tags.map(t => (
                      <span key={t} className="flex items-center gap-1 rounded-full bg-purple-600/20 px-2.5 py-1 text-xs text-purple-300">
                        {t}
                        <button type="button" onClick={() => {
                          const newTags = form.tags.filter(tag => tag !== t);
                          updateField('tags', newTags);
                          updateField('tagsText', newTags.join(', '));
                        }}><X className="h-3 w-3" /></button>
                      </span>
                    ))}
                  </div>
                )}
              </section>

              {/* 6. Componentes do Kit — só quando tipo=KIT */}
              {form.tipo === 'KIT' && (
                <section className="rounded-2xl border border-blue-500/30 bg-slate-900/60 p-4">
                  <div className="mb-4 flex items-center gap-2">
                    <Box className="h-4 w-4 text-blue-300" strokeWidth={1.8} />
                    <h3 className="text-sm font-black text-white">Componentes do Kit</h3>
                    <span className="text-xs text-slate-500">(produtos que compõem este kit)</span>
                  </div>

                  {/* Adicionar componente */}
                  <div className="mb-4">
                    <label className="mb-1 block text-xs text-slate-400">Adicionar produto ao kit</label>
                    <select onChange={e => { if (e.target.value) { addKitItem(e.target.value); e.target.value = ''; } }}
                      className={inputCls} defaultValue="">
                      <option value="" disabled>Selecione um produto simples...</option>
                      {prodListKit.filter(p => !form.kitItens.some(k => k.produtoId === p.id)).map(p => (
                        <option key={p.id} value={p.id}>{p.nome} — {fmtCurrency(p.preco)}</option>
                      ))}
                    </select>
                  </div>

                  {/* Lista de componentes */}
                  {form.kitItens.length === 0
                    ? <p className="text-xs text-slate-500">Nenhum componente adicionado ainda.</p>
                    : (
                      <div className="space-y-2">
                        {form.kitItens.map(k => (
                          <div key={k.produtoId} className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3">
                            <div className="flex-1 min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-200">{k.produtoNome}</p>
                              <p className="text-xs text-slate-500">{fmtCurrency(k.precoUnit)} / un.</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <label className="text-xs text-slate-400">Qtd:</label>
                              <input type="number" min={1} value={k.quantidade}
                                onChange={e => updateKitItemQty(k.produtoId, Number(e.target.value))}
                                className="w-16 rounded-lg border border-slate-600 bg-slate-700 px-2 py-1 text-sm text-slate-200 outline-none focus:border-purple-500" />
                              <p className="text-xs text-emerald-400 w-20 text-right">{fmtCurrency(k.precoUnit * k.quantidade)}</p>
                              <button type="button" onClick={() => removeKitItem(k.produtoId)}
                                className="text-red-400 hover:text-red-300 transition-colors">
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                        <div className="flex justify-end pt-1">
                          <p className="text-sm font-bold text-white">
                            Total componentes: {fmtCurrency(form.kitItens.reduce((s, k) => s + k.precoUnit * k.quantidade, 0))}
                          </p>
                        </div>
                      </div>
                    )
                  }
                </section>
              )}

            </div>

            {/* Aside — Preview + Salvar */}
            <aside className="space-y-4 xl:sticky xl:top-0 xl:self-start">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Eye className="h-4 w-4 text-purple-300" strokeWidth={1.8} />
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Preview card</p>
                </div>
                <ProductCardPreview product={form} />
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
