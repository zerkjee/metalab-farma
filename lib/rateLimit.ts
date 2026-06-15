import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { logger } from "@/lib/logger"

// Fallback sem Redis: sempre permite a requisição (fail-open).
const noopLimiter = { limit: async () => ({ success: true }) }

// Loga a ausência do Upstash apenas uma vez por processo (evita spam dos vários limiters).
let avisouUpstashAusente = false

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function makeRatelimit(limiter: any, prefix: string): { limit: (key: string) => Promise<{ success: boolean }> } {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) {
    if (process.env.NODE_ENV === 'production' && !avisouUpstashAusente) {
      avisouUpstashAusente = true
      // Erro estruturado e acionável (não-silencioso). Mantém fail-open por decisão:
      // não retornar 503 nas rotas para não derrubar a loja enquanto o Upstash não é provisionado.
      logger.error('[rateLimit] DESATIVADO em produção — UPSTASH_REDIS_REST_URL/TOKEN ausentes. Rotas sensíveis estão SEM rate limit. Provisionar Upstash.')
    }
    return noopLimiter
  }

  const redis = new Redis({ url, token })
  return new Ratelimit({ redis, limiter, prefix })
}

export const loginRatelimit     = makeRatelimit(Ratelimit.slidingWindow(5,  "15 m"), "rl:login")
export const registroRatelimit  = makeRatelimit(Ratelimit.slidingWindow(3,  "1 h"),  "rl:registro")
export const pagamentoRatelimit = makeRatelimit(Ratelimit.slidingWindow(10, "10 m"), "rl:pagamento")
export const cupomRatelimit     = makeRatelimit(Ratelimit.slidingWindow(30, "10 m"), "rl:cupom")
export const pedidoRatelimit    = makeRatelimit(Ratelimit.slidingWindow(10, "10 m"), "rl:pedido")
export const cartRatelimit      = makeRatelimit(Ratelimit.slidingWindow(20, "10 m"), "rl:cart")
export const cepRatelimit       = makeRatelimit(Ratelimit.slidingWindow(60, "10 m"), "rl:cep")
export const freteRatelimit     = makeRatelimit(Ratelimit.slidingWindow(60, "10 m"), "rl:frete")
export const avaliacaoRatelimit = makeRatelimit(Ratelimit.slidingWindow(5,  "1 h"),  "rl:avaliacao")
export const resgateRatelimit   = makeRatelimit(Ratelimit.slidingWindow(5,  "1 h"),  "rl:resgate")
export const pollingRatelimit   = makeRatelimit(Ratelimit.slidingWindow(60, "1 m"),  "rl:polling")
export const produtosRatelimit  = makeRatelimit(Ratelimit.slidingWindow(120,"10 m"), "rl:produtos")

export function getIp(request: { headers: { get: (k: string) => string | null } }): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous"
}
