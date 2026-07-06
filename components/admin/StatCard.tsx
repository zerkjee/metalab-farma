'use client';

interface StatCardProps {
  label: string;
  value: string;
  change: number;
  icon: string;
  sparkline?: number[];
}

export default function StatCard({ label, value, change, icon, sparkline }: StatCardProps) {
  const isUp = change >= 0;

  const mini = sparkline && sparkline.length > 1;
  let polyline = '';
  if (mini) {
    const w = 80, h = 32;
    const min = Math.min(...sparkline);
    const max = Math.max(...sparkline);
    const range = max - min || 1;
    polyline = sparkline
      .map((v, i) => {
        const x = (i / (sparkline.length - 1)) * w;
        const y = h - ((v - min) / range) * (h - 4) - 2;
        return `${x},${y}`;
      })
      .join(' ');
  }

  return (
    <div className="rounded-2xl p-5 flex flex-col gap-3 border border-line bg-surface-card shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        {mini && (
          <svg width="80" height="32" className="overflow-visible">
            <polyline
              points={polyline}
              fill="none"
              stroke={isUp ? '#79BDE3' : '#C64B4B'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>

      <div>
        <p className="font-display text-2xl text-navy leading-none">{value}</p>
        <p className="text-ink-muted text-xs mt-1">{label}</p>
      </div>

      <div className={`flex items-center gap-1 text-xs font-semibold ${isUp ? 'text-success' : 'text-danger'}`}>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
            d={isUp ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
        </svg>
        {Math.abs(change)}% vs mês anterior
      </div>
    </div>
  );
}
