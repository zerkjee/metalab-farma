'use client';

import { useEffect, useState } from 'react';

interface AdminAvaliacao {
  id: string;
  nota: number;
  titulo: string | null;
  texto: string | null;
  aprovada: boolean;
  criadoEm: string;
  usuario: { nome: string; email: string };
  produto: { nome: string; slug: string };
}

type Tab = 'pendentes' | 'aprovadas' | 'todas';

export default function AdminAvaliacoesPage() {
  const [tab, setTab] = useState<Tab>('pendentes');
  const [avaliacoes, setAvaliacoes] = useState<AdminAvaliacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    try {
      const res = await fetch(`/api/admin/avaliacoes?status=${tab}`);
      if (res.ok) {
        const data = await res.json();
        setAvaliacoes(data.avaliacoes);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/admin/avaliacoes?status=${tab}`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (!cancelled && d?.avaliacoes) setAvaliacoes(d.avaliacoes); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [tab]);

  async function setAprovada(id: string, aprovada: boolean) {
    setBusy(id);
    await fetch('/api/admin/avaliacoes', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, aprovada }),
    });
    await load();
    setBusy(null);
  }

  async function deletar(id: string) {
    if (!confirm('Excluir esta avaliação?')) return;
    setBusy(id);
    await fetch(`/api/admin/avaliacoes?id=${id}`, { method: 'DELETE' });
    await load();
    setBusy(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-navy font-display text-lg">Moderação de avaliações</h2>
        <p className="text-ink-muted text-xs">Aprove, despublique ou exclua avaliações enviadas pelos clientes</p>
      </div>

      <div className="flex gap-2 border-b border-line">
        {(['pendentes', 'aprovadas', 'todas'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-semibold capitalize border-b-2 transition-colors ${
              tab === t ? 'border-brand text-navy' : 'border-transparent text-ink-muted hover:text-navy'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-ink-secondary">Carregando...</p>
      ) : avaliacoes.length === 0 ? (
        <p className="text-ink-muted text-center py-12">Nenhuma avaliação nesta lista.</p>
      ) : (
        <div className="space-y-3">
          {avaliacoes.map((a) => (
            <div key={a.id} className="bg-surface-card border border-line shadow-sm rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-gold-500 text-lg">{'★'.repeat(a.nota)}<span className="text-neutral-200">{'★'.repeat(5 - a.nota)}</span></span>
                    {a.aprovada ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-success-subtle text-success border border-success/20">Aprovada</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-warning-subtle text-warning border border-warning/20">Pendente</span>
                    )}
                  </div>
                  {a.titulo && <p className="text-navy font-bold text-sm mb-1">{a.titulo}</p>}
                  {a.texto && <p className="text-ink-secondary text-sm leading-relaxed">{a.texto}</p>}
                </div>
                <div className="text-right text-xs text-ink-muted flex-shrink-0">
                  {new Date(a.criadoEm).toLocaleDateString('pt-BR')}
                </div>
              </div>
              <div className="flex items-center justify-between gap-4 pt-3 border-t border-line">
                <div className="text-xs text-ink-secondary">
                  <span className="text-ink">{a.usuario.nome}</span> · {a.usuario.email}
                  <br />
                  <span className="text-brand-700">{a.produto.nome}</span>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {!a.aprovada && (
                    <button
                      onClick={() => setAprovada(a.id, true)}
                      disabled={busy === a.id}
                      className="px-3 py-1.5 rounded-full text-xs font-bold bg-success text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      Aprovar
                    </button>
                  )}
                  {a.aprovada && (
                    <button
                      onClick={() => setAprovada(a.id, false)}
                      disabled={busy === a.id}
                      className="px-3 py-1.5 rounded-full text-xs font-bold bg-warning text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      Despublicar
                    </button>
                  )}
                  <button
                    onClick={() => deletar(a.id)}
                    disabled={busy === a.id}
                    className="px-3 py-1.5 rounded-full text-xs font-bold bg-danger-subtle text-danger border border-danger/20 hover:bg-danger/15 transition-colors disabled:opacity-50"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
