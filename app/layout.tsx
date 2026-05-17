import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import CartDrawer from "@/components/cart/CartDrawer";
import { CartProvider } from "@/context/CartContext";
import SessionProviderWrapper from "@/components/providers/SessionProviderWrapper";
import ErrorBoundary from "@/components/ErrorBoundary";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Metalab Store | Suplementos Alimentares com Qualidade e Procedência",
  description:
    "Suplementos alimentares com tecnologia, cuidado e confiança em cada fórmula. Produtos para complementar sua rotina alimentar. Sem indicação terapêutica.",
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
      <body className="min-h-full flex flex-col bg-[#fafafa]">
        <SessionProviderWrapper>
          <CartProvider>
            <ErrorBoundary section="Aplicação">
              {children}
              <CartDrawer />
            </ErrorBoundary>
          </CartProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
