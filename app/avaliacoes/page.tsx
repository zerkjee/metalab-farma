import type { Metadata } from 'next'
import AvaliacoesPageClient from './AvaliacoesPageClient'

const BASE = process.env.NEXT_PUBLIC_URL ?? 'https://metalab-farma.vercel.app'

export const metadata: Metadata = {
  title: 'Avaliações dos Clientes — Metalab Store',
  description: 'Veja o que nossos clientes estão dizendo sobre os produtos Metalab. Avaliações verificadas de quem comprou e aprovou.',
  alternates: { canonical: `${BASE}/avaliacoes` },
  openGraph: {
    title: 'Avaliações dos Clientes — Metalab Store',
    description: 'Avaliações verificadas de quem comprou e aprovou.',
    url: `${BASE}/avaliacoes`,
    type: 'website',
  },
}

export default function AvaliacoesPage() {
  return <AvaliacoesPageClient />
}
