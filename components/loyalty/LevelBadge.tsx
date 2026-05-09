import { LevelId } from '@/types/loyalty';
import { getLevelConfig } from '@/data/loyalty';

interface LevelBadgeProps {
  level: LevelId;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showName?: boolean;
  animated?: boolean;
}

const sizes = {
  sm: { outer: 'w-8 h-8 text-base', text: 'text-xs font-bold ml-1.5' },
  md: { outer: 'w-11 h-11 text-xl', text: 'text-sm font-bold ml-2' },
  lg: { outer: 'w-16 h-16 text-3xl', text: 'text-base font-black ml-3' },
  xl: { outer: 'w-24 h-24 text-5xl', text: 'text-xl font-black ml-4' },
};

export default function LevelBadge({ level, size = 'md', showName = false, animated = false }: LevelBadgeProps) {
  const cfg = getLevelConfig(level);
  const sz = sizes[size];

  return (
    <div className="inline-flex items-center">
      <div
        className={`${sz.outer} rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ${animated ? 'animate-pulse' : ''}`}
        style={{ background: cfg.gradient }}
      >
        {cfg.emoji}
      </div>
      {showName && (
        <span className={`${sz.text} uppercase tracking-widest`} style={{ color: cfg.color }}>
          {cfg.name}
        </span>
      )}
    </div>
  );
}
