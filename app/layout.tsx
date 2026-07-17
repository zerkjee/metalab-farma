import type { Metadata, Viewport } from "next";
import { Fredoka, Nunito_Sans } from "next/font/google";
import CartDrawer from "@/components/cart/CartDrawer";
import { CartProvider } from "@/context/CartContext";
import SessionProviderWrapper from "@/components/providers/SessionProviderWrapper";
import ErrorBoundary from "@/components/ErrorBoundary";
import ScrollToTop from "@/components/ScrollToTop";
import Analytics from "@/components/analytics/Analytics";
import CookieBanner from "@/components/cookies/CookieBanner";
import { safeJsonLd } from "@/lib/json-ld";
import "./globals.css";

const themeInitializationScript = `
  (function () {
    try {
      var saved = window.localStorage.getItem('metalab-theme');
      var theme = saved === 'light' || saved === 'dark'
        ? saved
        : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      document.documentElement.dataset.theme = theme;
      document.documentElement.style.colorScheme = theme;
    } catch (_) {
      document.documentElement.dataset.theme = 'light';
    }
  })();
`;

// Display (headings, nomes de produto, números de destaque)
const fredoka = Fredoka({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

// Body / UI (resto do texto)
const nunitoSans = Nunito_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const BASE = process.env.NEXT_PUBLIC_URL || "https://metalab-farma.vercel.app";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FBFBFA" },
    { media: "(prefers-color-scheme: dark)", color: "#0B1120" },
  ],
}

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
      className={`${fredoka.variable} ${nunitoSans.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitializationScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(orgJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(websiteJsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors">
        <ScrollToTop />
        <SessionProviderWrapper>
          <CartProvider>
            <ErrorBoundary section="Aplicação">
              {children}
              <CartDrawer />
            </ErrorBoundary>
          </CartProvider>
        </SessionProviderWrapper>
        <Analytics />
        <CookieBanner />
      </body>
    </html>
  );
}
