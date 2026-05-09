interface StatusBadgeProps {
  label: string;
  color: string; // tailwind bg class like 'bg-emerald-500/20 text-emerald-400'
  dot?: boolean;
}

export default function StatusBadge({ label, color, dot = true }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${color}`}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />}
      {label}
    </span>
  );
}
