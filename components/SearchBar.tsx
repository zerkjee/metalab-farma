'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Loader2 } from 'lucide-react';
import { fmtCurrency } from '@/utils/formatters';
import ProductImage from '@/components/ProductImage';

interface SearchHit {
  id: string;
  nome: string;
  slug: string;
  preco: number;
  precoOriginal?: number | null;
  estoque: number;
  imagemUrl?: string | null;
  corPrincipal?: string | null;
  categoria?: { nome: string; slug: string } | null;
}

interface SearchBarProps {
  compact?: boolean;
  onNavigate?: () => void;
}

export default function SearchBar({ compact = false, onNavigate }: SearchBarProps) {
  const [term, setTerm] = useState('');
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Fecha ao clicar fora
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // Busca com debounce (todo setState é deferido p/ não rodar no corpo do effect)
  useEffect(() => {
    const q = term.trim();
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      if (q.length < 2) { setHits([]); setLoading(false); return; }
      setLoading(true);
      try {
        const res = await fetch(`/api/produtos?busca=${encodeURIComponent(q)}&por_pagina=6`, { signal: ctrl.signal });
        if (!res.ok) throw new Error('busca falhou');
        const data = await res.json();
        setHits(Array.isArray(data.produtos) ? data.produtos : []);
        setOpen(true);
      } catch (e) {
        if (!(e instanceof DOMException && e.name === 'AbortError')) setHits([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [term]);

  const go = useCallback((href: string) => {
    setOpen(false);
    setTerm('');
    onNavigate?.();
    router.push(href);
  }, [router, onNavigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (term.trim()) go(`/produtos?busca=${encodeURIComponent(term.trim())}`);
  };

  return (
    <div ref={boxRef} className={`relative ${compact ? 'w-full' : 'flex-1 max-w-xl'}`}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <input
            type="text"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            onFocus={() => { if (hits.length) setOpen(true); }}
            placeholder="Buscar suplementos, vitaminas, minerais..."
            aria-label="Buscar produtos"
            className={`w-full bg-surface-sunken rounded-full text-sm placeholder-ink-muted focus:outline-none focus:ring-2 focus:ring-brand ${compact ? 'px-4 py-2.5 pr-10' : 'px-5 py-2.5 pr-11'}`}
          />
          <button type="submit" aria-label="Buscar"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-brand transition-colors">
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
          </button>
        </div>
      </form>

      {open && term.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full mt-2 z-[70] rounded-lg border border-line bg-surface-card shadow-lg overflow-hidden">
          {hits.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-ink-muted">
              {loading ? 'Buscando…' : 'Nenhum produto encontrado'}
            </p>
          ) : (
            <ul className="max-h-[70vh] overflow-y-auto py-1">
              {hits.map((p) => {
                const semEstoque = !(p.estoque > 0);
                const cor = p.corPrincipal ?? 'var(--navy-500)';
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => go(`/produtos/${p.slug}`)}
                      className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                        semEstoque
                          ? 'bg-surface-sunken hover:bg-neutral-100'   /* sem estoque: box mais escuro */
                          : 'hover:bg-surface-sunken'
                      }`}
                    >
                      <div className={`relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border border-line bg-surface-sunken p-1 ${semEstoque ? 'opacity-50 grayscale' : ''}`}>
                        {p.imagemUrl ? (
                          <ProductImage src={p.imagemUrl} alt={p.nome} sizes="48px" frameClassName="h-full w-full" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[9px] text-ink-muted">sem foto</div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`truncate text-sm font-semibold ${semEstoque ? 'text-ink-muted' : 'text-ink'}`}>
                          {p.nome}
                        </p>
                        <div className="flex items-center gap-2">
                          {p.categoria && (
                            <span className={`text-[11px] ${semEstoque ? 'text-ink-muted' : 'text-ink-muted'}`}>
                              {p.categoria.nome}
                            </span>
                          )}
                          {semEstoque && (
                            <span className="rounded-full bg-neutral-200 px-1.5 text-[10px] font-bold text-ink-secondary">Esgotado</span>
                          )}
                        </div>
                      </div>
                      <span className={`text-sm font-black ${semEstoque ? 'text-ink-muted' : ''}`} style={semEstoque ? undefined : { color: cor }}>
                        {fmtCurrency(p.preco)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          <Link
            href={`/produtos?busca=${encodeURIComponent(term.trim())}`}
            onClick={() => { setOpen(false); setTerm(''); onNavigate?.(); }}
            className="block border-t border-line px-4 py-2.5 text-center text-xs font-bold text-brand hover:bg-surface-sunken transition-colors"
          >
            Ver todos os resultados
          </Link>
        </div>
      )}
    </div>
  );
}
