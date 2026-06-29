import { logger } from './logger'

/**
 * Validação fail-fast de variáveis de ambiente.
 *
 * Regras (decisão do dono — fail-fast em camadas):
 * - CRÍTICAS: faltando em produção → lança erro e derruba o boot (falha clara).
 * - OPERACIONAIS: faltando em produção → loga erro acionável, mas NÃO derruba a loja
 *   (algumas podem ainda não estar provisionadas; cada rota já trata sua ausência).
 * - Em desenvolvimento: nunca lança (fallback controlado).
 * - NUNCA imprime valores/segredos — apenas os nomes das variáveis.
 *
 * Um item pode ser uma string (nome único) ou um array de nomes, caso em que
 * basta UMA das alternativas estar presente (ex.: AUTH_SECRET ou NEXTAUTH_SECRET).
 */

type EnvRequirement = string | string[]

const CRITICAS: EnvRequirement[] = [
  'DATABASE_URL',
  ['AUTH_SECRET', 'NEXTAUTH_SECRET'],
  ['NEXTAUTH_URL', 'NEXT_PUBLIC_URL'],
  'MERCADOPAGO_ACCESS_TOKEN',
  'MP_WEBHOOK_SECRET',
  'RESEND_API_KEY',
  'EMAIL_FROM',
  // Tiny ERP ativo: sem estas, o job endpoint fica sem autenticação
  'QSTASH_CURRENT_SIGNING_KEY',
  'QSTASH_TOKEN',
]

const OPERACIONAIS: EnvRequirement[] = [
  'MELHOR_ENVIO_TOKEN',
  'MELHOR_ENVIO_ORIGIN_CEP',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
]

function presente(nome: string): boolean {
  const v = process.env[nome]
  return typeof v === 'string' && v.trim().length > 0
}

/** Retorna os rótulos das exigências ausentes (sem valores). */
function ausentes(reqs: EnvRequirement[]): string[] {
  const faltando: string[] = []
  for (const req of reqs) {
    if (Array.isArray(req)) {
      if (!req.some(presente)) faltando.push(req.join(' ou '))
    } else if (!presente(req)) {
      faltando.push(req)
    }
  }
  return faltando
}

export interface EnvReport {
  criticasAusentes: string[]
  operacionaisAusentes: string[]
}

/** Avalia o ambiente sem efeitos colaterais (útil em testes). */
export function checkEnv(): EnvReport {
  return {
    criticasAusentes: ausentes(CRITICAS),
    operacionaisAusentes: ausentes(OPERACIONAIS),
  }
}

/**
 * Valida o ambiente. Chamado no boot via instrumentation.ts.
 *
 * O hard-fail (derrubar o boot) só ocorre em PRODUÇÃO REAL (deploy de produção na Vercel,
 * VERCEL_ENV === 'production'). Em previews da Vercel, CI/E2E e builds o NODE_ENV também é
 * 'production', mas esses contextos legitimamente não têm os secrets de runtime — ali apenas
 * logamos o erro (sem derrubar), para não inviabilizar previews e testes.
 */
export function validateEnv(): void {
  const isProd = process.env.NODE_ENV === 'production'
  // Produção real = deploy de produção na Vercel. Previews/CI não setam isso como 'production'.
  const isRealProd = process.env.VERCEL_ENV === 'production'
  const { criticasAusentes, operacionaisAusentes } = checkEnv()

  if (!isProd) {
    if (criticasAusentes.length || operacionaisAusentes.length) {
      logger.debug('[env] variáveis ausentes (dev — ignorado)', {
        criticas: criticasAusentes,
        operacionais: operacionaisAusentes,
      })
    }
    return
  }

  if (operacionaisAusentes.length) {
    logger.error('[env] variáveis OPERACIONAIS ausentes em produção — funcionalidade degradada', {
      ausentes: operacionaisAusentes,
    })
  }

  if (criticasAusentes.length) {
    // Mensagem clara, somente nomes — nunca valores.
    const msg = `[env] variáveis CRÍTICAS ausentes em produção: ${criticasAusentes.join(', ')}`
    logger.error(msg)
    // Fail-fast apenas em produção real; em preview/CI segue (degradado) para não quebrar testes.
    if (isRealProd) throw new Error(msg)
    return
  }

  logger.info('[env] validação OK')
}
