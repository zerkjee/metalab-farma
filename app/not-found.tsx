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
        <div
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl text-white shadow-xl shadow-purple-200"
          style={{ background: 'linear-gradient(135deg, #6b21a8, #7c3aed)' }}
        >
          <span className="text-3xl font-black">404</span>
        </div>
        <h1 className="text-2xl font-black text-gray-950">Página não encontrada</h1>
        <p className="mt-3 max-w-sm text-sm leading-6 text-gray-500">
          O endereço que você acessou não existe ou foi movido. Confira a URL ou volte para a loja.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="rounded-xl bg-[#6b21a8] px-6 py-3 text-sm font-black text-white transition-all hover:opacity-90"
          >
            Ir para a loja
          </Link>
          <Link
            href="/#produtos"
            className="rounded-xl border border-gray-200 px-6 py-3 text-sm font-bold text-gray-600 transition-all hover:border-[#6b21a8]/30 hover:text-[#6b21a8]"
          >
            Ver produtos
          </Link>
        </div>
      </main>
      <Footer />
    </>
  )
}
