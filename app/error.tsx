'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[GlobalError]', error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body className="min-h-screen flex items-center justify-center bg-surface-page px-4">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-danger-subtle text-2xl font-bold text-danger">
            !
          </div>
          <h1 className="font-display text-2xl text-navy">Algo deu errado</h1>
          <p className="mt-3 text-sm leading-6 text-ink-secondary">
            Ocorreu um erro inesperado. Você pode tentar novamente ou voltar para a loja.
          </p>
          {error.digest && (
            <p className="mt-2 font-mono text-xs text-ink-muted">#{error.digest}</p>
          )}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={reset}
              className="rounded-full bg-brand px-6 py-3 text-sm font-bold text-on-brand transition-all hover:bg-brand-hover"
            >
              Tentar novamente
            </button>
            <Link
              href="/"
              className="rounded-full border border-line-default px-6 py-3 text-sm font-bold text-ink-secondary transition-all hover:border-brand hover:text-navy"
            >
              Voltar para a loja
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
