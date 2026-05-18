'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[GlobalError]', error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-red-50 text-4xl">
            ⚠️
          </div>
          <h1 className="text-2xl font-black text-gray-950">Algo deu errado</h1>
          <p className="mt-3 text-sm leading-6 text-gray-500">
            Ocorreu um erro inesperado. Você pode tentar novamente ou voltar para a loja.
          </p>
          {error.digest && (
            <p className="mt-2 font-mono text-xs text-gray-400">#{error.digest}</p>
          )}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={reset}
              className="rounded-xl bg-[#6b21a8] px-6 py-3 text-sm font-black text-white transition-all hover:opacity-90"
            >
              Tentar novamente
            </button>
            <Link
              href="/"
              className="rounded-xl border border-gray-200 px-6 py-3 text-sm font-bold text-gray-600 transition-all hover:border-[#6b21a8]/30 hover:text-[#6b21a8]"
            >
              Voltar para a loja
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
