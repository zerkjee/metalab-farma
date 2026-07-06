"use client";

import * as Sentry from "@sentry/nextjs";
import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body>
        <main className="flex min-h-screen items-center justify-center bg-surface-page px-4">
          <div className="mx-auto max-w-md text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-danger-subtle text-2xl font-bold text-danger">
              !
            </div>
            <h1 className="font-display text-2xl text-navy">Algo deu errado na aplicação</h1>
            <p className="mt-3 text-sm leading-6 text-ink-secondary">
              Nossa equipe já foi notificada automaticamente. Tente recarregar a página.
            </p>
            {error.digest && (
              <p className="mt-2 font-mono text-xs text-ink-muted">#{error.digest}</p>
            )}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/"
                className="rounded-full bg-brand px-6 py-3 text-sm font-bold text-on-brand transition-all hover:bg-brand-hover"
              >
                Voltar para a loja
              </Link>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
