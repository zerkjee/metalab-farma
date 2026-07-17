import type { NutritionRow } from '@/types/product-informative'

interface NutritionTableProps {
  productName: string
  serving?: string
  rows: NutritionRow[]
  compact?: boolean
}

export default function NutritionTable({ productName, serving, rows, compact = false }: NutritionTableProps) {
  return (
    <div className={`overflow-hidden border border-line bg-surface-card print:shadow-none ${compact ? 'rounded-lg' : 'rounded-2xl shadow-sm'}`}>
      <div className={`border-b border-line ${compact ? 'bg-surface-sunken px-4 py-3 text-navy' : 'bg-navy px-5 py-4 text-on-navy'}`}>
        <h2 className={`font-black ${compact ? 'text-sm uppercase tracking-[0.14em]' : 'font-display text-xl'}`}>Informação nutricional</h2>
        {serving && <p className={`mt-1 text-sm ${compact ? 'text-ink-secondary' : 'text-on-navy/80'}`}>Porção de referência: {serving}</p>}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-left text-sm">
          <caption className="sr-only">Tabela nutricional de {productName}</caption>
          <thead>
            <tr className="border-b border-line bg-surface-sunken text-xs uppercase tracking-wider text-ink-muted">
              <th scope="col" className={`${compact ? 'px-4 py-2' : 'px-5 py-3'} font-bold`}>Componente</th>
              <th scope="col" className={`${compact ? 'px-4 py-2' : 'px-5 py-3'} font-bold`}>Quantidade por porção</th>
              <th scope="col" className={`${compact ? 'px-4 py-2' : 'px-5 py-3'} font-bold`}>%VD</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.nutrient}-${row.amount}`} className="border-b border-line last:border-0">
                <th scope="row" className={`${compact ? 'px-4 py-2.5' : 'px-5 py-4'} font-semibold text-navy`}>{row.nutrient}</th>
                <td className={`${compact ? 'px-4 py-2.5' : 'px-5 py-4'} text-ink-secondary`}>{row.amount}</td>
                <td className={`${compact ? 'px-4 py-2.5' : 'px-5 py-4'} text-ink-secondary`}>{row.dailyValue ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
