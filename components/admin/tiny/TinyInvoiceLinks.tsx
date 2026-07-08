import { ExternalLink, FileCode2 } from 'lucide-react'

type TinyInvoiceLinksProps = {
  danfeUrl?: string | null
  xmlUrl?: string | null
}

export default function TinyInvoiceLinks({ danfeUrl, xmlUrl }: TinyInvoiceLinksProps) {
  if (!danfeUrl && !xmlUrl) return null

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {danfeUrl && (
        <a
          href={danfeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-100"
        >
          <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.8} />
          Ver DANFE
        </a>
      )}
      {xmlUrl && (
        <a
          href={xmlUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full bg-surface-card px-3 py-2 text-xs font-semibold text-ink-secondary transition-colors hover:bg-surface-sunken"
        >
          <FileCode2 className="h-3.5 w-3.5" strokeWidth={1.8} />
          Baixar XML
        </a>
      )}
    </div>
  )
}
