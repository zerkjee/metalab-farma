import clsx from "clsx";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: string; up: boolean };
  color?: "blue" | "green" | "yellow" | "red";
}

const colorMap = {
  blue: { bg: "bg-blue-50", icon: "text-blue-600", border: "border-blue-100" },
  green: { bg: "bg-green-50", icon: "text-green-600", border: "border-green-100" },
  yellow: { bg: "bg-yellow-50", icon: "text-yellow-600", border: "border-yellow-100" },
  red: { bg: "bg-red-50", icon: "text-red-600", border: "border-red-100" },
};

export default function StatsCard({ title, value, subtitle, icon: Icon, trend, color = "blue" }: StatsCardProps) {
  const c = colorMap[color];
  return (
    <div className={clsx("bg-white rounded-xl border p-5 flex items-start gap-4", c.border)}>
      <div className={clsx("p-2.5 rounded-lg", c.bg)}>
        <Icon className={c.icon} size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        {trend && (
          <span className={clsx("text-xs font-medium", trend.up ? "text-green-600" : "text-red-600")}>
            {trend.up ? "▲" : "▼"} {trend.value}
          </span>
        )}
      </div>
    </div>
  );
}
