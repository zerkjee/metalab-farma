import Link from 'next/link'
import { ArrowRight, FileSearch } from 'lucide-react'
import { informativeStatusLabel } from '@/data/informativos'
import ProductImage from '@/components/ProductImage'
import type { InformativeProduct } from '@/types/product-informative'

export default function InformativoCard({ product }: { product: InformativeProduct }) {
  const hasOcr = product.status !== 'pending'
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-line bg-surface-card shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-brand/50 hover:shadow-md">
      <Link href={`/informativos/${product.slug}`} className="flex h-full flex-col">
        <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-surface-sunken p-7">
          {product.imagemUrl ? (
            <ProductImage
              src={product.imagemUrl}
              alt={product.nome}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              frameClassName="h-full max-w-full"
              imageClassName="drop-shadow-[0_12px_18px_rgba(8,18,38,0.18)] transition-transform duration-300 group-hover:scale-[1.04]"
            />
          ) : (
            <FileSearch className="h-16 w-16 text-ink-muted" aria-hidden="true" />
          )}
        </div>
        <div className="flex flex-1 flex-col p-5">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-brand-700">{product.marca}</p>
          <h2 className="mt-2 font-display text-xl font-black leading-tight text-navy">{product.nome}</h2>
          <p className={`mt-3 text-xs font-bold ${hasOcr ? 'text-warning' : 'text-ink-muted'}`}>
            {informativeStatusLabel(product.status)}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-ink-muted">Origem visual, leitura técnica e perguntas rápidas em um só folheto.</p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-brand-700">
            Ver folheto <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </span>
        </div>
      </Link>
    </article>
  )
}
