'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown, ArrowRight, X } from 'lucide-react';
import { fmtCurrency } from '@/utils/formatters';

interface Categoria { id: string; nome: string; slug: string; totalProdutos: number }
interface PreviewProduto { id: string; nome: string; slug: string; preco: number; imagemUrl?: string | null; estoque: number }
interface Preview { produtos: PreviewProduto[]; total: number }

export default function CategoryMenu() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [active, setActive] = useState<string | null>(null);   // slug em hover (desktop)
  const [alignRight, setAlignRight] = useState(false);         // popover alinhado à direita quando próximo da borda
  const [drawer, setDrawer] = useState<Categoria | null>(null); // mobile
  const [cache, setCache] = useState<Record<string, Preview>>({});
  const loadedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    let alive = true;
    fetch('/api/categorias')
      .then((r) => r.json())
      .then((d) => { if (alive && Array.isArray(d.categorias)) setCategorias(d.categorias); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const loadPreview = useCallback(async (slug: string) => {
    if (loadedRef.current.has(slug)) return;
    loadedRef.current.add(slug);
    try {
      const r = await fetch(`/api/categorias/${slug}?limit=4`);
      if (!r.ok) { loadedRef.current.delete(slug); return; }
      const d = await r.json();
      setCache((c) => ({ ...c, [slug]: { produtos: d.produtos ?? [], total: d.total ?? 0 } }));
    } catch { loadedRef.current.delete(slug); }
  }, []);

  if (categorias.length === 0) return null;

  return (
    <>
      {/* ─── Desktop: nav com mini-janela ─── */}
      <nav className="hidden lg:flex items-center justify-center gap-7 border-t border-gray-100 py-2.5">
        {categorias.map((cat) => {
          const preview = cache[cat.slug];
          return (
            <div
              key={cat.id}
              className="relative"
              onMouseEnter={(e) => {
                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                setAlignRight(rect.left + 160 > window.innerWidth - 24);
                setActive(cat.slug);
                loadPreview(cat.slug);
              }}
              onMouseLeave={() => setActive(null)}
            >
              <Link
                href={`/categoria/${cat.slug}`}
                className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-[#0f2756] transition-colors py-1"
              >
                {cat.nome}
                <ChevronDown size={14} className={`transition-transform ${active === cat.slug ? 'rotate-180' : ''}`} />
              </Link>

              {active === cat.slug && (
                <div className={`absolute top-full z-[70] w-80 pt-2 ${alignRight ? 'right-0' : 'left-1/2 -translate-x-1/2'}`}>
                  <div className="rounded-2xl border border-gray-100 bg-white p-3 shadow-2xl">
                    <p className="px-1 pb-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">{cat.nome}</p>
                    {!preview ? (
                      <p className="px-1 py-4 text-sm text-gray-400">Carregando…</p>
                    ) : (
                      <ul className="flex flex-col gap-1">
                        {preview.produtos.map((p) => {
                          const semEstoque = !(p.estoque > 0);
                          return (
                            <li key={p.id}>
                              <Link
                                href={`/produtos/${p.slug}`}
                                className={`flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition-colors ${semEstoque ? 'bg-gray-100 hover:bg-gray-200/70' : 'hover:bg-gray-50'}`}
                              >
                                <div className={`relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50 ${semEstoque ? 'opacity-50 grayscale' : ''}`}>
                                  {p.imagemUrl
                                    ? <Image src={p.imagemUrl} alt={p.nome} fill sizes="40px" className="object-contain p-0.5" />
                                    : <span className="flex h-full items-center justify-center text-[8px] text-gray-300">—</span>}
                                </div>
                                <span className={`min-w-0 flex-1 truncate text-xs font-semibold ${semEstoque ? 'text-gray-400' : 'text-gray-800'}`}>{p.nome}</span>
                                <span className={`text-xs font-black ${semEstoque ? 'text-gray-400' : 'text-[#0f2756]'}`}>{fmtCurrency(p.preco)}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                    <Link
                      href={`/categoria/${cat.slug}`}
                      className="mt-2 flex items-center justify-center gap-1.5 rounded-xl bg-[#0f2756] px-3 py-2 text-xs font-bold text-white transition-opacity hover:opacity-90"
                    >
                      Ver categoria completa{preview ? ` (${preview.total})` : ''}
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* ─── Mobile: chips roláveis ─── */}
      <div className="lg:hidden border-t border-gray-100">
        <div className="flex gap-2 overflow-x-auto px-4 py-2.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {categorias.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setDrawer(cat); loadPreview(cat.slug); }}
              className="flex-shrink-0 whitespace-nowrap rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 active:scale-95 transition-transform"
            >
              {cat.nome}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Mobile: drawer (bottom sheet) ─── */}
      {drawer && (
        <div className="fixed inset-0 z-[80] lg:hidden" role="dialog" aria-modal="true" aria-label={drawer.nome}>
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawer(null)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[75vh] overflow-y-auto rounded-t-3xl bg-white p-4 pb-8 shadow-2xl">
            <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-gray-200" />
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-black text-gray-900">{drawer.nome}</h3>
              <button onClick={() => setDrawer(null)} aria-label="Fechar" className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>
            {!cache[drawer.slug] ? (
              <p className="py-6 text-center text-sm text-gray-400">Carregando…</p>
            ) : (
              <ul className="flex flex-col gap-1.5">
                {cache[drawer.slug].produtos.map((p) => {
                  const semEstoque = !(p.estoque > 0);
                  return (
                    <li key={p.id}>
                      <Link
                        href={`/produtos/${p.slug}`}
                        onClick={() => setDrawer(null)}
                        className={`flex items-center gap-3 rounded-xl px-2 py-2 ${semEstoque ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                      >
                        <div className={`relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50 ${semEstoque ? 'opacity-50 grayscale' : ''}`}>
                          {p.imagemUrl
                            ? <Image src={p.imagemUrl} alt={p.nome} fill sizes="48px" className="object-contain p-1" />
                            : <span className="flex h-full items-center justify-center text-[9px] text-gray-300">sem foto</span>}
                        </div>
                        <span className={`min-w-0 flex-1 text-sm font-semibold ${semEstoque ? 'text-gray-400' : 'text-gray-900'}`}>{p.nome}</span>
                        <span className={`text-sm font-black ${semEstoque ? 'text-gray-400' : 'text-[#0f2756]'}`}>{fmtCurrency(p.preco)}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
            <Link
              href={`/categoria/${drawer.slug}`}
              onClick={() => setDrawer(null)}
              className="mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-[#0f2756] px-3 py-3 text-sm font-bold text-white"
            >
              Ver categoria completa
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
