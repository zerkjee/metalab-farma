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
    <div className="p-6 space-y-6">
      <div className="flex gap-2 border-b border-slate-800">
        {(['pendentes', 'aprovadas', 'todas'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-bold capitalize border-b-2 transition-colors ${
              tab === t ? 'border-purple-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-slate-400">Carregando...</p>
      ) : avaliacoes.length === 0 ? (
        <p className="text-slate-500 text-center py-12">Nenhuma avaliação nesta lista.</p>
      ) : (
        <div className="space-y-3">
          {avaliacoes.map((a) => (
            <div key={a.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-yellow-400 text-lg">{'★'.repeat(a.nota)}<span className="text-slate-700">{'★'.repeat(5 - a.nota)}</span></span>
                    {a.aprovada ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Aprovada</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">Pendente</span>
                    )}
                  </div>
                  {a.titulo && <p className="text-white font-bold text-sm mb-1">{a.titulo}</p>}
                  {a.texto && <p className="text-slate-300 text-sm leading-relaxed">{a.texto}</p>}
                </div>
                <div className="text-right text-xs text-slate-500 flex-shrink-0">
                  {new Date(a.criadoEm).toLocaleDateString('pt-BR')}
                </div>
              </div>
              <div className="flex items-center justify-between gap-4 pt-3 border-t border-slate-800">
                <div className="text-xs text-slate-400">
                  <span className="text-slate-300">{a.usuario.nome}</span> · {a.usuario.email}
                  <br />
                  <span className="text-purple-400">{a.produto.nome}</span>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {!a.aprovada && (
                    <button
                      onClick={() => setAprovada(a.id, true)}
                      disabled={busy === a.id}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors disabled:opacity-50"
                    >
                      Aprovar
                    </button>
                  )}
                  {a.aprovada && (
                    <button
                      onClick={() => setAprovada(a.id, false)}
                      disabled={busy === a.id}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 text-white hover:bg-amber-600 transition-colors disabled:opacity-50"
                    >
                      Despublicar
                    </button>
                  )}
                  <button
                    onClick={() => deletar(a.id)}
                    disabled={busy === a.id}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors disabled:opacity-50"
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
