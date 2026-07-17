import { CircleHelp } from 'lucide-react'
import type { ProductFaqItem } from '@/data/informativos/product-experience'

export default function ProductFaq({ items }: { items: ProductFaqItem[] }) {
  return (
    <div className="mt-5 space-y-3">
      {items.map((item) => (
        <details key={item.question} className="group rounded-lg border border-line bg-surface-sunken px-4 py-4 open:border-brand/50 sm:px-5">
          <summary className="flex cursor-pointer list-none items-start gap-3 font-bold text-ink marker:content-none">
            <CircleHelp className="mt-0.5 h-5 w-5 shrink-0 text-brand-700" aria-hidden="true" />
            <span className="flex-1">{item.question}</span>
            <span className="text-lg leading-none text-brand-700 transition-transform group-open:rotate-45" aria-hidden="true">+</span>
          </summary>
          <p className="ml-8 mt-3 text-sm leading-relaxed text-ink-secondary">{item.answer}</p>
        </details>
      ))}
    </div>
  )
}
