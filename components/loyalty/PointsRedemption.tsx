'use client';

import { useEffect, useState } from 'react';

interface Option { pontos: number; valor: number }
interface LevelCfg { color: string; cashbackPct: number }
interface Stats {
  points: number;
  pontosAcumulados: number;
  pontosResgatados: number;
}

export default function PointsRedemption({
  stats,
  levelCfg,
  onRedeemed,
}: {
  stats: Stats | null;
  levelCfg: LevelCfg;
  onRedeemed: () => void;
}) {
  const [options, setOptions] = useState<Option[]>([]);
  const [busy, setBusy] = useState<number | null>(null);
  const [result, setResult] = useState<{ ok: boolean; text: string; codigo?: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/user/resgatar-pontos')
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (!cancelled && d?.opcoes) setOptions(d.opcoes); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  async function resgatar(pontos: number) {
    setBusy(pontos);
    setResult(null);
    try {
      const res = await fetch('/api/user/resgatar-pontos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pontos }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult({ ok: true, text: data.mensagem, codigo: data.codigo });
        onRedeemed();
      } else {
        setResult({ ok: false, text: data.erro ?? 'Erro ao resgatar' });
      }
    } catch {
      setResult({ ok: false, text: 'Erro de conexão' });
    } finally {
      setBusy(null);
    }
  }

  const saldo = stats?.points ?? 0;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-line bg-surface-card shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-display text-lg text-navy">Resgate de Pontos</h2>
          <p className="text-ink-muted text-xs mt-0.5">Troque seus pontos por cupons de desconto</p>
        </div>
        <div className="text-right">
          <p className="font-display text-2xl" style={{ color: levelCfg.color }}>{saldo.toLocaleString('pt-BR')}</p>
          <p className="text-ink-muted text-xs">pontos disponíveis</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {options.map((opt) => {
          const podeResgatar = saldo >= opt.pontos;
          return (
            <button
              key={opt.pontos}
              onClick={() => resgatar(opt.pontos)}
              disabled={!podeResgatar || busy !== null}
              className={`relative rounded-xl border p-4 text-left transition-all ${
                podeResgatar
                  ? 'border-line-default bg-surface-sunken hover:border-navy cursor-pointer'
                  : 'border-line bg-surface-sunken opacity-50 cursor-not-allowed'
              }`}
            >
              <p className="text-[10px] uppercase tracking-widest text-ink-muted mb-1">Cupom</p>
              <p className="font-display text-2xl text-success">R$ {opt.valor}</p>
              <p className="text-ink-muted text-xs mt-1.5">por {opt.pontos.toLocaleString('pt-BR')} pts</p>
              {busy === opt.pontos && (
                <p className="text-brand-600 text-xs mt-1 animate-pulse">Resgatando...</p>
              )}
            </button>
          );
        })}
      </div>

      {result && (
        <div className={`mt-4 rounded-xl px-4 py-3 text-sm ${result.ok ? 'bg-success-subtle text-success border border-success/20' : 'bg-danger-subtle text-danger border border-danger/20'}`}>
          {result.codigo && (
            <p className="font-mono font-bold text-base mb-1">{result.codigo}</p>
          )}
          <p className="text-xs">{result.text}</p>
        </div>
      )}

      {saldo < (options[0]?.pontos ?? 100) && (
        <p className="text-ink-muted text-xs text-center mt-4">
          Compre mais para acumular pontos e desbloquear resgates.
        </p>
      )}
    </div>
  );
}
