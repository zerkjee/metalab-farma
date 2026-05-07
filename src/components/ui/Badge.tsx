"use client"

import { cn } from "@/lib/utils"

const variantMap = {
  bestseller: { label: "Mais Vendido", className: "bg-brand-500 text-white" },
  new:        { label: "Novo",         className: "bg-navy-900 text-white" },
  sale:       { label: "Oferta",       className: "bg-red-500 text-white" },
  popular:    { label: "Popular",      className: "bg-amber-500 text-white" },
} as const

interface BadgeProps {
  variant: keyof typeof variantMap
  className?: string
}

export function ProductBadge({ variant, className }: BadgeProps) {
  const { label, className: variantClass } = variantMap[variant]
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-700 tracking-wide uppercase leading-none",
        variantClass,
        className,
      )}
    >
      {label}
    </span>
  )
}

interface TrustBadgeProps {
  icon: React.ReactNode
  label: string
  className?: string
}

export function TrustBadge({ icon, label, className }: TrustBadgeProps) {
  return (
    <div className={cn("flex items-center gap-2 text-sm text-gray-600", className)}>
      <span className="text-brand-500">{icon}</span>
      <span className="font-medium">{label}</span>
    </div>
  )
}
