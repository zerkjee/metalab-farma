import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import CartDrawer from "@/components/cart/CartDrawer";
import { CartProvider } from "@/context/CartContext";
import SessionProviderWrapper from "@/components/providers/SessionProviderWrapper";
import ErrorBoundary from "@/components/ErrorBoundary";
import Analytics from "@/components/analytics/Analytics";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE = process.env.NEXT_PUBLIC_URL ?? "https://metalab-farma.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: {
    default: "Metalab Store | Suplementos Alimentares com Qualidade e Procedência",
    template: "%s | Metalab Store",
  },
  description:
    "Suplementos alimentares com tecnologia, cuidado e confiança em cada fórmula. Produtos para complementar sua rotina alimentar. Sem indicação terapêutica.",
  keywords: ["suplementos alimentares", "metalab", "whey protein", "creatina", "pré-treino", "vitaminas"],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: BASE,
    siteName: "Metalab Store",
    title: "Metalab Store | Suplementos Alimentares",
    description:
      "Suplementos alimentares com tecnologia, cuidado e confiança em cada fórmula.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Metalab Store | Suplementos Alimentares",
    description: "Suplementos alimentares com qualidade e procedência garantida.",
  },
  robots: { index: true, follow: true },
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Metalab Store",
  url: BASE,
  description: "Suplementos alimentares com tecnologia, cuidado e confiança em cada fórmula.",
  email: "mlmetalab@gmail.com",
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Metalab Store",
  url: BASE,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#fafafa]">
        <SessionProviderWrapper>
          <CartProvider>
            <ErrorBoundary section="Aplicação">
              {children}
              <CartDrawer />
            </ErrorBoundary>
          </CartProvider>
        </SessionProviderWrapper>
        <Analytics />
      </body>
    </html>
  );
}
