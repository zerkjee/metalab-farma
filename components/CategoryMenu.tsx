'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown, ArrowRight, X } from 'lucide-react';

interface Categoria { id: string; nome: string; slug: string; totalProdutos: number }
interface PreviewProduto { id: string; nome: string; slug: string; preco: number; imagemUrl?: string | null; estoque: number }
interface Preview { produtos: PreviewProduto[]; total: number }

type PopoverAlign = 'left' | 'center' | 'right';

export default function CategoryMenu() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [popoverAlign, setPopoverAlign] = useState<PopoverAlign>('center');
  const [drawer, setDrawer] = useState<Categoria | null>(null);
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

  // Preload all category previews after categories load (staggered to avoid hammering the API)
  useEffect(() => {
    if (categorias.length === 0) return;
    const timers = categorias.map((cat, i) =>
      setTimeout(() => loadPreview(cat.slug), i * 80)
    );
    return () => timers.forEach(clearTimeout);
  }, [categorias, loadPreview]);

  if (categorias.length === 0) return null;

  // Largura do popover de fotos: 220px (w-[220px])
  const POPOVER_HALF = 110;
  const MARGIN = 16;

  function computeAlign(e: React.MouseEvent<HTMLDivElement>): PopoverAlign {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const mid = rect.left + rect.width / 2;
    if (mid + POPOVER_HALF > window.innerWidth - MARGIN) return 'right';
    if (mid - POPOVER_HALF < MARGIN) return 'left';
    return 'center';
  }

  const popoverPositionClass: Record<PopoverAlign, string> = {
    left:   'left-0',
    center: 'left-1/2 -translate-x-1/2',
    right:  'right-0',
  };

  return (
    <>
      {/* ─── Desktop: nav com mini-janela de fotos ─── */}
      <nav className="hidden lg:flex items-center justify-center gap-7 border-t border-gray-100 py-2.5">
        {categorias.map((cat) => {
          const preview = cache[cat.slug];
          return (
            <div
              key={cat.id}
              className="relative"
              onMouseEnter={(e) => { setPopoverAlign(computeAlign(e)); setActive(cat.slug); loadPreview(cat.slug); }}
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
                <div className={`absolute top-full z-[70] w-[220px] pt-2 ${popoverPositionClass[popoverAlign]}`}>
                  <div className="rounded-2xl border border-gray-100 bg-white p-3 shadow-2xl">
                    {!preview ? (
                      <div className="grid grid-cols-2 gap-2">
                        {[0,1,2,3].map((i) => (
                          <div key={i} className="aspect-square rounded-xl bg-gray-100 animate-pulse" />
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {preview.produtos.map((p) => (
                          <Link
                            key={p.id}
                            href={`/produtos/${p.slug}`}
                            className={`relative aspect-square rounded-xl overflow-hidden border transition-all duration-150 hover:scale-[1.03] hover:shadow-md ${
                              p.estoque > 0 ? 'border-gray-100 bg-gray-50' : 'border-gray-200 bg-gray-100 opacity-60 grayscale'
                            }`}
                          >
                            {p.imagemUrl
                              ? <Image src={p.imagemUrl} alt={p.nome} fill sizes="96px" className="object-contain p-2" />
                              : <span className="flex h-full items-center justify-center text-[8px] text-gray-300">—</span>}
                          </Link>
                        ))}
                      </div>
                    )}
                    <Link
                      href={`/categoria/${cat.slug}`}
                      className="mt-2.5 flex items-center justify-center gap-1.5 rounded-xl bg-[#0f2756] px-3 py-2 text-xs font-bold text-white transition-opacity hover:opacity-90"
                    >
                      Ver todos{preview ? ` (${preview.total})` : ''}
                      <ArrowRight size={13} />
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
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-black text-gray-900">{drawer.nome}</h3>
              <button onClick={() => setDrawer(null)} aria-label="Fechar" className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>
            {!cache[drawer.slug] ? (
              <div className="grid grid-cols-3 gap-3">
                {[0,1,2,3,4,5].map((i) => (
                  <div key={i} className="aspect-square rounded-xl bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {cache[drawer.slug].produtos.map((p) => (
                  <Link
                    key={p.id}
                    href={`/produtos/${p.slug}`}
                    onClick={() => setDrawer(null)}
                    className={`relative aspect-square rounded-xl overflow-hidden border ${
                      p.estoque > 0 ? 'border-gray-100 bg-gray-50' : 'border-gray-200 bg-gray-100 opacity-60 grayscale'
                    }`}
                  >
                    {p.imagemUrl
                      ? <Image src={p.imagemUrl} alt={p.nome} fill sizes="120px" className="object-contain p-2" />
                      : <span className="flex h-full items-center justify-center text-[9px] text-gray-300">—</span>}
                  </Link>
                ))}
              </div>
            )}
            <Link
              href={`/categoria/${drawer.slug}`}
              onClick={() => setDrawer(null)}
              className="mt-4 flex items-center justify-center gap-1.5 rounded-xl bg-[#0f2756] px-3 py-3 text-sm font-bold text-white"
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
