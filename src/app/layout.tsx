import type { Metadata } from "next"
import { DM_Sans, Playfair_Display } from "next/font/google"
import "./globals.css"

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
})

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "METALAB Farma — Suplementos e Nutracêuticos Premium",
    template: "%s | METALAB Farma",
  },
  description:
    "Formulações desenvolvidas com rigor científico e matérias-primas certificadas. Suplementos nutricionais de alto padrão com qualidade laboratorial comprovada.",
  keywords: ["suplementos", "nutracêuticos", "vitaminas", "minerais", "saúde", "bem-estar", "ANVISA", "qualidade"],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "METALAB Farma",
    title: "METALAB Farma — Suplementos e Nutracêuticos Premium",
    description: "Formulações desenvolvidas com rigor científico e matérias-primas certificadas.",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${dmSans.variable} ${playfair.variable}`}>
      <body className="min-h-screen bg-white text-gray-900 font-body antialiased">
        {children}
      </body>
    </html>
  )
}
