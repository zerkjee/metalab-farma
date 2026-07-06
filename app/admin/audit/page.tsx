'use client';

import { useEffect, useState } from 'react';
import { fmtDate } from '@/utils/formatters';

interface AuditLog {
  id: string;
  criadoEm: string;
  adminEmail: string;
  acao: string;
  recurso: string;
  recursoId: string | null;
  detalhe: string | null;
  ip: string | null;
}

interface AuditResponse {
  logs: AuditLog[];
  total: number;
  pagina: number;
  totalPaginas: number;
}

// Cor semântica por ação (design system). Verde = criação, azul = atualização,
// vermelho = remoção, âmbar = reprovação, navy = ações neutras/administrativas.
const acaoCor: Record<string, string> = {
  'cupom.criado':         'text-success',
  'cupom.atualizado':     'text-brand-700',
  'cupom.deletado':       'text-danger',
  'admin.criado':         'text-navy-600',
  'admin.removido':       'text-warning',
  'produto.criado':       'text-success',
  'produto.atualizado':   'text-brand-700',
  'produto.desativado':   'text-danger',
  'banner.criado':        'text-success',
  'banner.atualizado':    'text-brand-700',
  'banner.deletado':      'text-danger',
  'avaliacao.aprovada':   'text-success',
  'avaliacao.reprovada':  'text-warning',
  'avaliacao.deletada':   'text-danger',
  'pedido.atualizado':    'text-brand-700',
  'pedido.reembolsado':   'text-warning',
  'upload.criado':        'text-navy-600',
};

export default function AuditPage() {
  const [data, setData] = useState<AuditResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [pagina, setPagina] = useState(1);
  const [filtroAcao, setFiltroAcao] = useState('');
  const [filtroAplicado, setFiltroAplicado] = useState('');

  useEffect(() => {
    let cancelled = false;
    const q = filtroAplicado ? `&acao=${encodeURIComponent(filtroAplicado)}` : '';
    fetch(`/api/admin/audit?pagina=${pagina}${q}`)
      .then((r) => r.json())
      .then((d) => { if (!cancelled && !d.erro) setData(d); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [pagina, filtroAplicado]);

  function aplicarFiltro(e: React.FormEvent) {
    e.preventDefault();
    setPagina(1);
    setFiltroAplicado(filtroAcao.trim());
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-navy font-display text-lg">Auditoria</h2>
        <p className="text-ink-muted text-xs">Ações administrativas registradas — visível apenas para SUPER_ADMIN</p>
      </div>

      {/* Busca por ação */}
      <form onSubmit={aplicarFiltro} className="flex items-center gap-2">
        <input
          type="text"
          value={filtroAcao}
          onChange={(e) => setFiltroAcao(e.target.value)}
          placeholder="Filtrar por ação (ex: cupom, produto, banner)"
          className="flex-1 max-w-md px-3 py-2 rounded-full bg-surface-card border border-line text-ink text-xs placeholder-ink-muted focus:outline-none focus:border-brand"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-full bg-brand hover:bg-brand-hover text-on-brand text-xs font-bold transition-colors"
        >
          Buscar
        </button>
        {filtroAplicado && (
          <button
            type="button"
            onClick={() => { setFiltroAcao(''); setFiltroAplicado(''); setPagina(1); }}
            className="px-3 py-2 rounded-full bg-surface-card border border-line hover:bg-surface-sunken text-ink-secondary text-xs transition-colors"
          >
            Limpar
          </button>
        )}
      </form>

      {/* Contagem */}
      {data && (
        <p className="text-ink-secondary text-xs">
          {data.total} registro{data.total !== 1 ? 's' : ''}
          {filtroAplicado && ` (filtro: "${filtroAplicado}")`}
        </p>
      )}

      {/* Tabela */}
      <div className="rounded-2xl border border-line bg-surface-card shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col gap-1 p-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 rounded-xl bg-surface-sunken animate-pulse" />
            ))}
          </div>
        ) : data?.logs.length === 0 ? (
          <p className="text-ink-muted text-sm text-center py-12">Nenhum evento de auditoria ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-line">
                  {['Data/hora', 'Admin', 'Ação', 'Recurso', 'ID', 'IP'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-ink-muted font-semibold uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {data?.logs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-surface-sunken transition-colors"
                    title={log.detalhe ? `Detalhe: ${log.detalhe}` : undefined}
                  >
                    <td className="px-4 py-3 text-ink-secondary whitespace-nowrap">{fmtDate(log.criadoEm)}</td>
                    <td className="px-4 py-3 text-ink max-w-[160px] truncate">{log.adminEmail}</td>
                    <td className="px-4 py-3">
                      <span className={`font-semibold ${acaoCor[log.acao] ?? 'text-ink-secondary'}`}>
                        {log.acao}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink-secondary">{log.recurso}</td>
                    <td className="px-4 py-3 text-ink-muted font-mono text-[11px] max-w-[100px] truncate">
                      {log.recursoId ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-ink-muted">{log.ip ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Paginação */}
      {data && data.totalPaginas > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPagina((p) => Math.max(1, p - 1))}
            disabled={pagina === 1}
            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-surface-card border border-line text-ink-secondary disabled:opacity-40 hover:bg-surface-sunken transition-colors"
          >
            Anterior
          </button>
          <span className="text-ink-muted text-xs">
            {pagina} / {data.totalPaginas}
          </span>
          <button
            onClick={() => setPagina((p) => Math.min(data.totalPaginas, p + 1))}
            disabled={pagina === data.totalPaginas}
            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-surface-card border border-line text-ink-secondary disabled:opacity-40 hover:bg-surface-sunken transition-colors"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
}
