import type { ErrorEvent } from '@sentry/nextjs'

const PII_KEYS = new Set([
  'email', 'cpf', 'cnpj', 'senha', 'password', 'telefone', 'phone',
  'pixqrcode', 'pixqrcodebase64', 'logradouro', 'complemento', 'bairro',
  'enderecosmap', 'enderecosnap', 'token', 'authorization', 'cookie', 'cookies',
  'x-api-key', 'x-auth-token',
])

const BLOCKED_HEADERS = ['authorization', 'cookie', 'x-api-key', 'x-auth-token', 'x-session-token']

const IGNORED_PATTERNS = [
  /ResizeObserver loop/i,
  /Non-Error promise rejection/i,
  /Load failed/i,
  /Failed to fetch/i,
  /NetworkError/i,
  /Loading chunk \d+ failed/i,
  /Importing a module script failed/i,
  /cancelled/i,
]

function sanitize(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) =>
      PII_KEYS.has(k.toLowerCase()) ? [k, '[redacted]'] : [k, v],
    ),
  )
}

export function sentryBeforeSend(event: ErrorEvent): ErrorEvent | null {
  const message = event.exception?.values?.[0]?.value ?? event.message ?? ''
  if (IGNORED_PATTERNS.some((re) => re.test(message))) return null

  if (event.request?.headers) {
    const headers = event.request.headers as Record<string, string>
    for (const h of BLOCKED_HEADERS) delete headers[h]
  }

  if (event.request) {
    const req = event.request as Record<string, unknown>
    delete req.cookies
    delete req.data
  }

  if (event.extra && typeof event.extra === 'object') {
    event.extra = sanitize(event.extra as Record<string, unknown>)
  }

  if (event.contexts) {
    for (const [k, v] of Object.entries(event.contexts)) {
      if (v && typeof v === 'object') {
        event.contexts[k] = sanitize(v as Record<string, unknown>)
      }
    }
  }

  return event
}
