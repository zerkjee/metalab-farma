import { tinyBadgeMeta } from '@/utils/adminOrders'

type TinyStatusBadgeProps = {
  status: string | null
}

export default function TinyStatusBadge({ status }: TinyStatusBadgeProps) {
  const badge = tinyBadgeMeta(status)

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-bold ${badge.cls}`}>
      {badge.spinner && <span className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />}
      {badge.label}
    </span>
  )
}
