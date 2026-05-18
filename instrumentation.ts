export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
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
