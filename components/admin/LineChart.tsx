'use client';

import { useMemo, useState } from 'react';

interface DataPoint {
  label: string;
  value: number;
}

interface LineChartProps {
  data: DataPoint[];
  height?: number;
  color?: string;
  showDots?: boolean;
  formatValue?: (v: number) => string;
}

export default function LineChart({
  data,
  height = 190,
  color = '#7c3aed',
  showDots = true,
  formatValue,
}: LineChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const xLabels = useMemo(() => {
    if (!data.length) return [];

    const maxLabels = data.length > 10 ? 4 : 5;
    const indexes = new Set<number>();

    for (let i = 0; i < maxLabels; i += 1) {
      indexes.add(Math.round((i / (maxLabels - 1)) * (data.length - 1)));
    }

    return Array.from(indexes)
      .sort((a, b) => a - b)
      .map((index) => ({ ...data[index], index }));
  }, [data]);

  if (!data.length) return null;

  const W = 100;
  const H = 100;
  const pad = { top: 10, right: 3, bottom: 10, left: 3 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;

  const values = data.map((d) => d.value);
  const minV = Math.min(...values);
  const maxV = Math.max(...values);
  const rawRange = maxV - minV || 1;
  const yPadding = rawRange * 0.12;
  const minY = Math.max(0, minV - yPadding);
  const maxY = maxV + yPadding;
  const range = maxY - minY || 1;

  const toX = (i: number) =>
    pad.left + (data.length === 1 ? 0 : (i / (data.length - 1)) * innerW);
  const toY = (v: number) =>
    pad.top + innerH - ((v - minY) / range) * innerH;

  const points = data.map((d, i) => `${toX(i)},${toY(d.value)}`).join(' ');

  const firstX = toX(0);
  const lastX = toX(data.length - 1);
  const bottomY = pad.top + innerH;
  const area =
    `M${firstX},${toY(data[0].value)} ` +
    data.slice(1).map((d, i) => `L${toX(i + 1)},${toY(d.value)}`).join(' ') +
    ` L${lastX},${bottomY} L${firstX},${bottomY} Z`;

  const gradId = `grad-${color.replace('#', '')}`;

  const ticks = [maxY, minY + range / 2, minY];

  const activePoint = activeIndex === null ? null : data[activeIndex];
  const activeX = activeIndex === null ? 0 : toX(activeIndex);
  const activeY = activePoint ? toY(activePoint.value) : 0;

  function formattedValue(value: number) {
    return formatValue ? formatValue(value) : Math.round(value).toLocaleString('pt-BR');
  }

  return (
    <div className="w-full min-w-0">
      <div
        className="grid min-w-0 grid-cols-[52px_minmax(0,1fr)] gap-3"
        style={{ height: `${height}px` }}
      >
        <div className="flex flex-col justify-between py-2 text-right text-[11px] font-medium tabular-nums text-slate-500">
          {ticks.map((tick) => (
            <span key={tick}>{formattedValue(tick)}</span>
          ))}
        </div>

        <div
          className="relative min-w-0 rounded-xl"
          onMouseLeave={() => setActiveIndex(null)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              setActiveIndex(null);
            }
          }}
        >
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full overflow-hidden"
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="none"
            role="img"
            aria-label="Grafico de desempenho"
          >
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.32" />
                <stop offset="100%" stopColor={color} stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {ticks.map((tick) => (
              <line
                key={tick}
                x1={pad.left}
                y1={toY(tick)}
                x2={pad.left + innerW}
                y2={toY(tick)}
                stroke="#334155"
                strokeWidth="0.45"
                strokeDasharray="2 2"
                vectorEffect="non-scaling-stroke"
              />
            ))}

            <path d={area} fill={`url(#${gradId})`} />

            <polyline
              points={points}
              fill="none"
              stroke={color}
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />

            {showDots &&
              data.map((d, i) => (
                <circle
                  key={`${d.label}-${i}`}
                  cx={toX(i)}
                  cy={toY(d.value)}
                  r={activeIndex === i ? 1.9 : 1.25}
                  fill={color}
                  stroke="#1e293b"
                  strokeWidth="0.8"
                  vectorEffect="non-scaling-stroke"
                />
              ))}

            {activePoint && (
              <line
                x1={activeX}
                y1={pad.top}
                x2={activeX}
                y2={bottomY}
                stroke="#cbd5e1"
                strokeOpacity="0.28"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            )}
          </svg>

          <div className="absolute inset-0 flex">
            {data.map((point, index) => (
              <button
                key={`${point.label}-${index}`}
                type="button"
                aria-label={`${point.label}: ${formattedValue(point.value)}`}
                className="h-full flex-1 cursor-crosshair outline-none"
                onMouseEnter={() => setActiveIndex(index)}
                onFocus={() => setActiveIndex(index)}
              />
            ))}
          </div>

          {activePoint && (
            <div
              className="pointer-events-none absolute z-10 min-w-28 rounded-lg border border-slate-700 bg-slate-950/95 px-3 py-2 text-xs shadow-xl shadow-slate-950/30"
              style={{
                left: `${activeX}%`,
                top: `${activeY}%`,
                transform: `translate(${activeX > 78 ? '-100%' : '-50%'}, -115%)`,
              }}
            >
              <p className="font-semibold text-slate-300">{activePoint.label}</p>
              <p className="mt-0.5 font-black text-white">{formattedValue(activePoint.value)}</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-2 grid grid-cols-[52px_minmax(0,1fr)] gap-3">
        <div />
        <div className="relative h-5 min-w-0 text-[11px] font-medium text-slate-500">
          {xLabels.map((item) => (
            <span
              key={`${item.label}-${item.index}`}
              className="absolute top-0 -translate-x-1/2 whitespace-nowrap"
              style={{ left: `${toX(item.index)}%` }}
            >
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
