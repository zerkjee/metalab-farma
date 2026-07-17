import { AlertTriangle, CheckCircle2, FileSearch } from 'lucide-react'
import { informativeStatusLabel } from '@/data/informativos'
import type { InformativeStatus } from '@/types/product-informative'

export default function InfoStatusNotice({ status }: { status: InformativeStatus }) {
  const published = status === 'published'
  const extracted = status === 'ocr-extracted'
  const Icon = published ? CheckCircle2 : extracted ? FileSearch : AlertTriangle

  return (
    <div
      className={`rounded-2xl border p-4 sm:p-5 ${
        published
          ? 'border-success/30 bg-success-subtle'
          : extracted
            ? 'border-warning/30 bg-warning-subtle'
            : 'border-line bg-surface-sunken'
      }`}
      role="status"
    >
      <div className="flex items-start gap-3">
        <Icon
          className={`mt-0.5 h-5 w-5 shrink-0 ${published ? 'text-success' : extracted ? 'text-warning' : 'text-ink-muted'}`}
          aria-hidden="true"
        />
        <div>
          <p className="text-sm font-bold text-navy">{informativeStatusLabel(status)}</p>
          <p className="mt-1 text-sm leading-relaxed text-ink-secondary">
            {published
              ? 'Conteúdo conciliado com a ficha técnica e aprovado para publicação.'
              : extracted
                ? 'O texto abaixo foi extraído por OCR de uma ficha identificada, mas ainda precisa ser conferido contra o rótulo comercial vigente antes de publicação definitiva.'
                : 'Ainda não há uma ficha técnica conciliada com este SKU. Para evitar informação incorreta, composição, tabela e modo de uso permanecem ocultos.'}
          </p>
        </div>
      </div>
    </div>
  )
}
