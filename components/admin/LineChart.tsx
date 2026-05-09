'use client';

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
  height = 160,
  color = '#7c3aed',
  showDots = true,
  formatValue,
}: LineChartProps) {
  if (!data.length) return null;

  const W = 100; // viewBox percentage units
  const H = height;
  const pad = { top: 8, right: 4, bottom: 24, left: 48 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;

  const values = data.map((d) => d.value);
  const minV = Math.min(...values);
  const maxV = Math.max(...values);
  const range = maxV - minV || 1;

  const toX = (i: number) =>
    pad.left + (i / (data.length - 1)) * innerW;
  const toY = (v: number) =>
    pad.top + innerH - ((v - minV) / range) * innerH;

  const points = data.map((d, i) => `${toX(i)},${toY(d.value)}`).join(' ');

  // Area fill: close path going down-right and back along bottom
  const firstX = toX(0);
  const lastX = toX(data.length - 1);
  const bottomY = pad.top + innerH;
  const area =
    `M${firstX},${toY(data[0].value)} ` +
    data.slice(1).map((d, i) => `L${toX(i + 1)},${toY(d.value)}`).join(' ') +
    ` L${lastX},${bottomY} L${firstX},${bottomY} Z`;

  const gradId = `grad-${color.replace('#', '')}`;

  // Y-axis labels (3 ticks)
  const ticks = [minV, minV + range / 2, maxV];

  // X-axis: show ~5 evenly-spaced labels
  const step = Math.max(1, Math.floor(data.length / 5));
  const xLabels = data.filter((_, i) => i % step === 0 || i === data.length - 1);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      style={{ width: '100%', height: `${H}px` }}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Y grid lines */}
      {ticks.map((t, i) => (
        <g key={i}>
          <line
            x1={pad.left}
            y1={toY(t)}
            x2={pad.left + innerW}
            y2={toY(t)}
            stroke="#334155"
            strokeWidth="0.5"
            strokeDasharray="2,2"
          />
          <text
            x={pad.left - 3}
            y={toY(t) + 1}
            textAnchor="end"
            dominantBaseline="middle"
            fill="#64748b"
            style={{ fontSize: '4px' }}
          >
            {formatValue ? formatValue(t) : Math.round(t)}
          </text>
        </g>
      ))}

      {/* Area */}
      <path d={area} fill={`url(#${gradId})`} />

      {/* Line */}
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Dots */}
      {showDots &&
        data.map((d, i) => (
          <circle
            key={i}
            cx={toX(i)}
            cy={toY(d.value)}
            r="1.5"
            fill={color}
            stroke="#1e293b"
            strokeWidth="0.8"
          />
        ))}

      {/* X labels */}
      {xLabels.map((d, _) => {
        const idx = data.indexOf(d);
        return (
          <text
            key={idx}
            x={toX(idx)}
            y={H - 4}
            textAnchor="middle"
            fill="#64748b"
            style={{ fontSize: '3.5px' }}
          >
            {d.label}
          </text>
        );
      })}
    </svg>
  );
}
