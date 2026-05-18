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
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-white font-black text-lg">Resgate de Pontos</h2>
          <p className="text-white/40 text-xs mt-0.5">Troque seus pontos por cupons de desconto</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black" style={{ color: levelCfg.color }}>{saldo.toLocaleString('pt-BR')}</p>
          <p className="text-white/30 text-xs">pontos disponíveis</p>
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
                  ? 'border-white/15 bg-white/[0.06] hover:bg-white/10 hover:border-white/25 cursor-pointer'
                  : 'border-white/5 bg-white/[0.02] opacity-50 cursor-not-allowed'
              }`}
            >
              <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Cupom</p>
              <p className="text-2xl font-black text-emerald-400">R$ {opt.valor}</p>
              <p className="text-white/50 text-xs mt-1.5">por {opt.pontos.toLocaleString('pt-BR')} pts</p>
              {busy === opt.pontos && (
                <p className="text-purple-400 text-xs mt-1 animate-pulse">Resgatando...</p>
              )}
            </button>
          );
        })}
      </div>

      {result && (
        <div className={`mt-4 rounded-xl px-4 py-3 text-sm ${result.ok ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-red-500/10 text-red-300 border border-red-500/20'}`}>
          {result.codigo && (
            <p className="font-mono font-black text-base mb-1">{result.codigo}</p>
          )}
          <p className="text-xs">{result.text}</p>
        </div>
      )}

      {saldo < (options[0]?.pontos ?? 100) && (
        <p className="text-white/30 text-xs text-center mt-4">
          Compre mais para acumular pontos e desbloquear resgates.
        </p>
      )}
    </div>
  );
}
