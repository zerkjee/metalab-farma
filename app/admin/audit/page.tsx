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

const acaoCor: Record<string, string> = {
  'cupom.criado':         'text-emerald-400',
  'cupom.atualizado':     'text-sky-400',
  'cupom.deletado':       'text-red-400',
  'admin.criado':         'text-violet-400',
  'admin.removido':       'text-orange-400',
  'produto.criado':       'text-emerald-400',
  'produto.atualizado':   'text-sky-400',
  'produto.desativado':   'text-red-400',
  'banner.criado':        'text-emerald-400',
  'banner.atualizado':    'text-sky-400',
  'banner.deletado':      'text-red-400',
  'avaliacao.aprovada':   'text-emerald-400',
  'avaliacao.reprovada':  'text-amber-400',
  'avaliacao.deletada':   'text-red-400',
  'pedido.atualizado':    'text-sky-400',
  'pedido.reembolsado':   'text-orange-400',
  'upload.criado':        'text-violet-400',
};

export default function AuditPage() {
  const [data, setData] = useState<AuditResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [pagina, setPagina] = useState(1);
  const [filtroAcao, setFiltroAcao] = useState('');
  const [filtroAplicado, setFiltroAplicado] = useState('');

  useEffect(() => {
    setLoading(true);
    const q = filtroAplicado ? `&acao=${encodeURIComponent(filtroAplicado)}` : '';
    fetch(`/api/admin/audit?pagina=${pagina}${q}`)
      .then((r) => r.json())
      .then((d) => { if (!d.erro) setData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [pagina, filtroAplicado]);

  function aplicarFiltro(e: React.FormEvent) {
    e.preventDefault();
    setPagina(1);
    setFiltroAplicado(filtroAcao.trim());
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-white font-black text-lg">Auditoria</h2>
        <p className="text-slate-500 text-xs">Ações administrativas registradas — visível apenas para SUPER_ADMIN</p>
      </div>

      {/* Busca por ação */}
      <form onSubmit={aplicarFiltro} className="flex items-center gap-2">
        <input
          type="text"
          value={filtroAcao}
          onChange={(e) => setFiltroAcao(e.target.value)}
          placeholder="Filtrar por ação (ex: cupom, produto, banner)"
          className="flex-1 max-w-md px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs placeholder-slate-500 focus:outline-none focus:border-purple-500"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors"
        >
          Buscar
        </button>
        {filtroAplicado && (
          <button
            type="button"
            onClick={() => { setFiltroAcao(''); setFiltroAplicado(''); setPagina(1); }}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
          >
            Limpar
          </button>
        )}
      </form>

      {/* Contagem */}
      {data && (
        <p className="text-slate-400 text-xs">
          {data.total} registro{data.total !== 1 ? 's' : ''}
          {filtroAplicado && ` (filtro: "${filtroAplicado}")`}
        </p>
      )}

      {/* Tabela */}
      <div className="rounded-2xl border border-slate-700/50 overflow-hidden" style={{ background: '#1e293b' }}>
        {loading ? (
          <div className="flex flex-col gap-1 p-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 rounded-xl bg-slate-700/50 animate-pulse" />
            ))}
          </div>
        ) : data?.logs.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-12">Nenhum evento de auditoria ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-700">
                  {['Data/hora', 'Admin', 'Ação', 'Recurso', 'ID', 'IP'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-slate-500 font-semibold uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {data?.logs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-800/50 transition-colors"
                    title={log.detalhe ? `Detalhe: ${log.detalhe}` : undefined}
                  >
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{fmtDate(log.criadoEm)}</td>
                    <td className="px-4 py-3 text-slate-300 max-w-[160px] truncate">{log.adminEmail}</td>
                    <td className="px-4 py-3">
                      <span className={`font-semibold ${acaoCor[log.acao] ?? 'text-slate-300'}`}>
                        {log.acao}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{log.recurso}</td>
                    <td className="px-4 py-3 text-slate-600 font-mono text-[11px] max-w-[100px] truncate">
                      {log.recursoId ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{log.ip ?? '—'}</td>
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
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-700 transition-colors"
          >
            Anterior
          </button>
          <span className="text-slate-500 text-xs">
            {pagina} / {data.totalPaginas}
          </span>
          <button
            onClick={() => setPagina((p) => Math.min(data.totalPaginas, p + 1))}
            disabled={pagina === data.totalPaginas}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-700 transition-colors"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
}
