import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

// Fallback sem Redis: sempre permite a requisição
const noopLimiter = { limit: async (_key: string) => ({ success: true }) }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function makeRatelimit(limiter: any, prefix: string): { limit: (key: string) => Promise<{ success: boolean }> } {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return noopLimiter

  const redis = new Redis({ url, token })
  return new Ratelimit({ redis, limiter, prefix })
}

export const loginRatelimit    = makeRatelimit(Ratelimit.slidingWindow(5,  "15 m"), "rl:login")
export const registroRatelimit = makeRatelimit(Ratelimit.slidingWindow(3,  "1 h"),  "rl:registro")
export const pagamentoRatelimit= makeRatelimit(Ratelimit.slidingWindow(10, "10 m"), "rl:pagamento")
export const cupomRatelimit    = makeRatelimit(Ratelimit.slidingWindow(30, "10 m"), "rl:cupom")
