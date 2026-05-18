import type { Metadata } from 'next'
import VipPageClient from './VipPageClient'

const BASE = process.env.NEXT_PUBLIC_URL ?? 'https://metalab-farma.vercel.app'

export const metadata: Metadata = {
  title: 'Programa VIP — Metalab Store',
  description: 'Faça parte do programa de fidelidade Metalab. Acumule pontos a cada compra e troque por cupons exclusivos.',
  alternates: { canonical: `${BASE}/vip` },
  openGraph: {
    title: 'Programa VIP — Metalab Store',
    description: 'Acumule pontos e troque por descontos exclusivos.',
    url: `${BASE}/vip`,
    type: 'website',
  },
}

export default function VipPage() {
  return <VipPageClient />
}
