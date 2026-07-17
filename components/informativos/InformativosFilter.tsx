'use client'

import { useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
import InformativoCard from './InformativoCard'
import type { InformativeProduct } from '@/types/product-informative'

export default function InformativosFilter({ products }: { products: InformativeProduct[] }) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'all' | 'with-source' | 'pending'>('all')

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('pt-BR')
    return products.filter((product) => {
      if (normalized && !`${product.nome} ${product.marca}`.toLocaleLowerCase('pt-BR').includes(normalized)) return false
      if (status === 'with-source' && product.status === 'pending') return false
      if (status === 'pending' && product.status !== 'pending') return false
      return true
    })
  }, [products, query, status])

  return (
    <div>
      <div className="mb-8 rounded-lg border border-line bg-surface-card p-4 shadow-sm sm:p-5">
        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
          <label className="relative block">
            <span className="sr-only">Buscar produto</span>
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por nome do produto"
              className="w-full rounded-lg border border-line bg-surface-page py-3 pl-11 pr-11 text-sm text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-ink-muted hover:bg-surface-sunken hover:text-navy"
                aria-label="Limpar busca"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </label>
          <div className="flex flex-wrap gap-2" aria-label="Filtrar por status">
            {[
              ['all', 'Todos'],
              ['with-source', 'Com ficha localizada'],
              ['pending', 'Pendentes'],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setStatus(value as typeof status)}
                className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                  status === value ? 'bg-navy text-on-navy' : 'border border-line bg-surface-card text-ink-secondary hover:border-brand'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-4 text-xs text-ink-muted">{filtered.length} produto(s) encontrado(s)</p>
      </div>

      {filtered.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((product) => <InformativoCard key={product.slug} product={product} />)}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-line bg-surface-card px-6 py-16 text-center">
          <p className="font-display text-xl font-black text-navy">Nenhum produto encontrado</p>
          <p className="mt-2 text-sm text-ink-secondary">Tente outro nome ou limpe os filtros.</p>
        </div>
      )}
    </div>
  )
}
