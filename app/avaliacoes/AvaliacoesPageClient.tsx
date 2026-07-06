'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ReviewCard from '@/components/reviews/ReviewCard';
import StarRating from '@/components/reviews/StarRating';

interface ApiReview {
  id: string;
  productId: string;
  productSlug: string;
  productName: string;
  productImage: string | null;
  productColor: string;
  customerName: string;
  customerCity: string;
  customerState: string;
  customerInitials: string;
  avatarColor: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  verified: boolean;
}

interface Resumo {
  total: number;
  media: number;
  distribuicao: Record<1 | 2 | 3 | 4 | 5, number>;
}

type FilterRating = 'all' | 1 | 2 | 3 | 4 | 5;
type SortKey = 'recent' | 'highest' | 'lowest';

const PAGE_SIZE = 10;

export default function AvaliacoesPageClient() {
  const [allReviews, setAllReviews] = useState<ApiReview[]>([]);
  const [resumo, setResumo] = useState<Resumo | null>(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterRating>('all');
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [sort, setSort] = useState<SortKey>('recent');
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/avaliacoes/all')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled && d?.avaliacoes) {
          setAllReviews(d.avaliacoes);
          setResumo(d.resumo);
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    return allReviews
      .filter((r) => {
        if (filter !== 'all' && r.rating !== filter) return false;
        if (onlyVerified && !r.verified) return false;
        if (search.trim()) {
          const q = search.toLowerCase();
          return (
            r.comment.toLowerCase().includes(q) ||
            r.title.toLowerCase().includes(q) ||
            r.customerName.toLowerCase().includes(q) ||
            r.productName.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (sort === 'recent') return b.date.localeCompare(a.date);
        if (sort === 'highest') return b.rating - a.rating;
        return a.rating - b.rating;
      });
  }, [allReviews, search, filter, onlyVerified, sort]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function changeFilter(val: FilterRating) { setFilter(val); setPage(1); }
  function changeSearch(val: string) { setSearch(val); setPage(1); }

  const overallAvg = resumo?.media ?? 0;
  const totalCount = resumo?.total ?? 0;
  const dist = ([5, 4, 3, 2, 1] as const).map((star) => ({
    star,
    count: resumo?.distribuicao[star] ?? 0,
    pct: totalCount > 0 ? Math.round(((resumo?.distribuicao[star] ?? 0) / totalCount) * 100) : 0,
  }));

  // Adapts API review to the shape ReviewCard expects
  function toCardReview(r: ApiReview) {
    return {
      id: r.id,
      productId: r.productId,
      productName: r.productName,
      productImage: r.productImage ?? undefined,
      productColor: r.productColor,
      customerName: r.customerName,
      customerCity: r.customerCity,
      customerState: r.customerState,
      customerInitials: r.customerInitials,
      avatarColor: r.avatarColor,
      rating: r.rating,
      title: r.title,
      comment: r.comment,
      date: r.date,
      verified: r.verified,
      helpfulCount: 0,
      totalVotes: 0,
    };
  }

  return (
    <>
      <Header />

      {/* Hero */}
      <section className="bg-navy py-16 sm:py-20 text-on-navy">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-8 text-center">
          <p className="text-xs font-bold text-brand-300 uppercase tracking-wide mb-3">Prova Social</p>
          <h1 className="font-display text-4xl sm:text-5xl mb-4">Avaliações dos Clientes</h1>
          <p className="text-navy-100 text-lg max-w-xl mx-auto mb-10">
            Transparência total — veja o que nossos clientes reais dizem sobre os suplementos Metalab.
          </p>

          {/* Hero stats */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
            {loading ? (
              <div className="h-24 w-48 bg-white/10 rounded-2xl animate-pulse" />
            ) : totalCount === 0 ? (
              <p className="text-brand-200 text-lg">Seja o primeiro a avaliar!</p>
            ) : (
              <>
                <div className="flex flex-col items-center">
                  <span className="font-display text-6xl">{overallAvg}</span>
                  <StarRating rating={overallAvg} size="lg" />
                  <span className="text-navy-100 text-sm mt-2">{totalCount} avaliações</span>
                </div>

                <div className="hidden sm:block w-px h-24 bg-white/15" />

                <div className="flex flex-col gap-2 w-56">
                  {dist.map(({ star, count, pct }) => (
                    <div key={star} className="flex items-center gap-2.5">
                      <span className="text-xs text-navy-100 w-3">{star}</span>
                      <svg className="w-3 h-3 flex-shrink-0 text-gold-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gold-400 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-navy-100 w-5 text-right">{count}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Filters + Reviews */}
      <section className="py-16 bg-surface-page min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Search */}
          <div className="relative mb-6">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar por produto, cliente ou comentário..."
              value={search}
              onChange={(e) => changeSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-line-default bg-surface-card text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-navy transition-all shadow-sm"
            />
          </div>

          {/* Filter bar */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between mb-8">
            <div className="flex flex-wrap gap-2 items-center">
              {(['all', 5, 4, 3, 2, 1] as FilterRating[]).map((val) => (
                <button
                  key={val}
                  onClick={() => changeFilter(val)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all duration-200 ${
                    filter === val
                      ? 'bg-navy text-on-navy border-navy'
                      : 'bg-surface-card text-ink-secondary border-line-default hover:border-navy hover:text-navy'
                  }`}
                >
                  {val === 'all' ? 'Todas' : `${val} ★`}
                </button>
              ))}

              <button
                onClick={() => { setOnlyVerified((v) => !v); setPage(1); }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all duration-200 flex items-center gap-1.5 ${
                  onlyVerified
                    ? 'bg-success text-white border-success'
                    : 'bg-surface-card text-ink-secondary border-line-default hover:border-success hover:text-success'
                }`}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Verificadas
              </button>
            </div>

            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value as SortKey); setPage(1); }}
              className="text-xs font-medium text-ink-secondary border border-line-default rounded-xl px-3 py-2 bg-surface-card focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-navy shadow-sm"
            >
              <option value="recent">Mais recentes</option>
              <option value="highest">Maior nota</option>
              <option value="lowest">Menor nota</option>
            </select>
          </div>

          {/* Loading skeleton */}
          {loading && (
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 rounded-2xl bg-surface-sunken animate-pulse" />
              ))}
            </div>
          )}

          {/* Result count */}
          {!loading && (
            <p className="text-sm text-ink-muted mb-6 font-medium">
              {filtered.length} avaliação{filtered.length !== 1 ? 'ões' : ''} encontrada{filtered.length !== 1 ? 's' : ''}
            </p>
          )}

          {/* Cards */}
          {!loading && paginated.length > 0 && (
            <div className="flex flex-col gap-4">
              {paginated.map((r) => (
                <div key={r.id}>
                  <div className="mb-1 px-1">
                    <Link
                      href={`/produtos/${r.productSlug}`}
                      className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide transition-opacity hover:opacity-80"
                      style={{ color: r.productColor }}
                    >
                      <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: r.productColor }} />
                      {r.productName}
                    </Link>
                  </div>
                  <ReviewCard review={toCardReview(r)} />
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && paginated.length === 0 && (
            <div className="text-center py-20 text-ink-muted">
              <svg className="w-14 h-14 mx-auto mb-4 text-line-default" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {allReviews.length === 0 ? (
                <>
                  <p className="font-semibold text-navy text-lg">Nenhuma avaliação ainda</p>
                  <p className="text-sm mt-1">Compre um produto e deixe sua opinião!</p>
                </>
              ) : (
                <>
                  <p className="font-semibold text-navy text-lg">Nenhuma avaliação encontrada</p>
                  <p className="text-sm mt-1">Tente outros filtros ou limpe a busca</p>
                  <button
                    onClick={() => { setSearch(''); setFilter('all'); setOnlyVerified(false); setPage(1); }}
                    className="mt-6 px-5 py-2.5 rounded-full bg-navy text-on-navy text-sm font-bold hover:opacity-90 transition-opacity"
                  >
                    Limpar filtros
                  </button>
                </>
              )}
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="w-10 h-10 rounded-full border border-line-default bg-surface-card flex items-center justify-center text-ink-secondary hover:border-navy hover:text-navy transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-10 h-10 rounded-full text-sm font-bold border transition-all duration-200 shadow-sm ${
                    p === page
                      ? 'bg-navy text-on-navy border-navy'
                      : 'bg-surface-card text-ink-secondary border-line-default hover:border-navy hover:text-navy'
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="w-10 h-10 rounded-full border border-line-default bg-surface-card flex items-center justify-center text-ink-secondary hover:border-navy hover:text-navy transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}
