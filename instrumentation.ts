export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Fail-fast de env: derruba o boot de RUNTIME em produção se faltar variável crítica.
    // Durante o build (phase-production-build) as envs de runtime podem não existir — não validar aí.
    if (process.env.NEXT_PHASE !== 'phase-production-build') {
      const { validateEnv } = await import('./lib/env')
      validateEnv()
    }
    await import('./sentry.server.config')
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config')
  }
}

export async function onRequestError(
  err: Error & { digest?: string },
  request: { path: string; method: string; headers: Headers },
  context: { routerKind: string; routePath: string; routeType: string },
) {
  const { captureRequestError } = await import('@sentry/nextjs')
  const headers: Record<string, string> = {}
  request.headers.forEach((v: string, k: string) => { headers[k] = v })
  captureRequestError(err, { ...request, headers }, context)
}
