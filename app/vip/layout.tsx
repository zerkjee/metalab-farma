import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Área VIP',
  robots: { index: false, follow: false },
}

export default function VipLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
