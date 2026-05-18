'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import RatingDistribution from './RatingDistribution';
import ReviewCard from './ReviewCard';
import type { Review, RatingSummary } from '@/types/review';

interface ProductReviewsProps {
  productId: string;
  color?: string;
}

interface ApiAvaliacao {
  id: string;
  nota: number;
  titulo: string;
  texto: string;
  data: string;
  cliente: { primeiroNome: string; iniciais: string; cidade: string; estado: string };
  verificada: boolean;
}

interface ApiResponse {
  avaliacoes: ApiAvaliacao[];
  resumo: { total: number; media: number; distribuicao: Record<1 | 2 | 3 | 4 | 5, number> };
}

type FilterRating = 'all' | 5 | 4 | 3 | 2 | 1;
type SortKey = 'recent' | 'highest' | 'lowest';

const AVATAR_COLORS = ['#7c3aed', '#6b21a8', '#9333ea', '#a855f7', '#581c87'];

function toReview(a: ApiAvaliacao, productId: string): Review {
  const colorIdx = (a.cliente.primeiroNome.charCodeAt(0) || 0) % AVATAR_COLORS.length;
  return {
    id: a.id,
    productId,
    productName: '',
    productColor: '#7c3aed',
    customerName: a.cliente.primeiroNome,
    customerCity: a.cliente.cidade,
    customerState: a.cliente.estado,
    customerInitials: a.cliente.iniciais,
    avatarColor: AVATAR_COLORS[colorIdx],
    rating: a.nota,
    title: a.titulo || (a.nota >= 4 ? 'Recomendo' : 'Minha experiência'),
    comment: a.texto || '',
    date: a.data,
    verified: a.verificada,
    helpfulCount: 0,
    totalVotes: 0,
  };
}

export default function ProductReviews({ productId, color = '#6b21a8' }: ProductReviewsProps) {
  const { data: session } = useSession();
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterRating>('all');
  const [sort, setSort] = useState<SortKey>('recent');
  const [visible, setVisible] = useState(4);
  const [showForm, setShowForm] = useState(false);
  const [nota, setNota] = useState(5);
  const [titulo, setTitulo] = useState('');
  const [texto, setTexto] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/avaliacoes?produtoId=${productId}`)
      .then((r) => r.ok ? r.json() : null)
      .then((d: ApiResponse | null) => {
        if (!cancelled && d) setData(d);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [productId]);

  useEffect(() => {
    if (!showForm || submitting) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowForm(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [showForm, submitting]);

  const reviews = (data?.avaliacoes ?? []).map((a) => toReview(a, productId));
  const filtered = reviews
    .filter((r) => filter === 'all' || r.rating === filter)
    .sort((a, b) => {
      if (sort === 'recent') return b.date.localeCompare(a.date);
      if (sort === 'highest') return b.rating - a.rating;
      return a.rating - b.rating;
    });

  const displayed = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;

  const summary: RatingSummary | null = data?.resumo
    ? {
        productId: 0,
        averageRating: data.resumo.media,
        totalReviews: data.resumo.total,
        distribution: {
          5: data.resumo.distribuicao[5],
          4: data.resumo.distribuicao[4],
          3: data.resumo.distribuicao[3],
          2: data.resumo.distribuicao[2],
          1: data.resumo.distribuicao[1],
        },
      }
    : null;

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch('/api/avaliacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ produtoId: productId, nota, titulo: titulo || undefined, texto: texto || undefined }),
      });
      const json = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: json.mensagem ?? 'Avaliação enviada! Aguardando moderação.' });
        setTitulo('');
        setTexto('');
        setNota(5);
        setTimeout(() => { setShowForm(false); setMessage(null); }, 2500);
      } else {
        setMessage({ type: 'error', text: json.erro ?? 'Erro ao enviar avaliação' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Erro de conexão' });
    } finally {
      setSubmitting(false);
    }
  }

  const filterLabels: { value: FilterRating; label: string }[] = [
    { value: 'all', label: 'Todas' },
    { value: 5, label: '5 ★' },
    { value: 4, label: '4 ★' },
    { value: 3, label: '3 ★' },
    { value: 2, label: '2 ★' },
    { value: 1, label: '1 ★' },
  ];

  return (
    <section className="py-16 border-t border-gray-100 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color }}>
            O que dizem nossos clientes
          </p>
          <h2 className="text-3xl font-black text-gray-900">Avaliações do Produto</h2>
        </div>

        {summary && summary.totalReviews > 0 && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 mb-8 shadow-sm">
            <RatingDistribution summary={summary} color={color} />
          </div>
        )}

        {summary && summary.totalReviews > 0 && (
          <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
            <div className="flex flex-wrap gap-2">
              {filterLabels.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => { setFilter(value); setVisible(4); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all duration-200 ${
                    filter === value ? 'text-white border-transparent' : 'text-gray-600 border-gray-200 bg-white hover:border-[#6b21a8] hover:text-[#6b21a8]'
                  }`}
                  style={filter === value ? { backgroundColor: color, borderColor: color } : {}}
                >
                  {label}
                </button>
              ))}
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="text-xs font-medium text-gray-600 border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': color } as React.CSSProperties}
            >
              <option value="recent">Mais recentes</option>
              <option value="highest">Maior nota</option>
              <option value="lowest">Menor nota</option>
            </select>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-400">Carregando avaliações...</div>
        ) : displayed.length > 0 ? (
          <>
            <div className="flex flex-col gap-4">
              {displayed.map((review) => <ReviewCard key={review.id} review={review} />)}
            </div>
            {hasMore && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => setVisible((n) => n + 4)}
                  className="px-8 py-3 rounded-xl border-2 font-bold text-sm transition-all duration-200 hover:bg-gray-100"
                  style={{ borderColor: color, color }}
                >
                  Ver mais avaliações
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <p className="font-medium">Seja o primeiro a avaliar este produto.</p>
          </div>
        )}

        <div className="mt-10 p-6 bg-white rounded-2xl border border-gray-100 text-center shadow-sm">
          <p className="font-bold text-gray-900 mb-1">Já comprou este produto?</p>
          <p className="text-sm text-gray-500 mb-4">Sua opinião ajuda outros clientes a escolher melhor.</p>
          {session?.user ? (
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:opacity-90 active:scale-95"
              style={{ backgroundColor: color }}
            >
              Escrever avaliação
            </button>
          ) : (
            <Link
              href="/login"
              className="inline-block px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:opacity-90 active:scale-95"
              style={{ backgroundColor: color }}
            >
              Faça login para avaliar
            </Link>
          )}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => !submitting && setShowForm(false)}>
          <form
            onSubmit={submitReview}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl"
          >
            <h3 className="text-xl font-black text-gray-900 mb-1">Avaliar produto</h3>
            <p className="text-sm text-gray-500 mb-6">Sua avaliação passa por moderação antes de ser publicada.</p>

            <div className="mb-5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">Sua nota</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setNota(n)}
                    className="text-3xl transition-transform hover:scale-110"
                    style={{ color: n <= nota ? '#f59e0b' : '#e5e7eb' }}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">Título</label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                maxLength={120}
                placeholder="Resumo da sua experiência"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="mb-5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">Comentário</label>
              <textarea
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                maxLength={2000}
                rows={4}
                placeholder="Conte sua experiência com o produto"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
            </div>

            {message && (
              <div className={`mb-4 px-4 py-2.5 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                {message.text}
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                disabled={submitting}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
                style={{ backgroundColor: color }}
              >
                {submitting ? 'Enviando...' : 'Enviar avaliação'}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
