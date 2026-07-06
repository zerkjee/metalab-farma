import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'Página não encontrada',
}

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-24 text-center">
        <p className="font-display text-6xl text-brand-200">404</p>
        <h1 className="mt-2 font-display text-2xl text-navy">Página não encontrada</h1>
        <p className="mt-3 max-w-sm text-sm leading-6 text-ink-secondary">
          O endereço que você acessou não existe ou foi movido. Confira a URL ou volte para a loja.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="rounded-full bg-brand px-6 py-3 text-sm font-bold text-on-brand transition-all hover:bg-brand-hover"
          >
            Ir para a loja
          </Link>
          <Link
            href="/#produtos"
            className="rounded-full border border-line-default px-6 py-3 text-sm font-bold text-ink-secondary transition-all hover:border-brand hover:text-navy"
          >
            Ver produtos
          </Link>
        </div>
      </main>
      <Footer />
    </>
  )
}
