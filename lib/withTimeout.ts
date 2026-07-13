/**
 * Utilitários de timeout para chamadas a serviços externos.
 *
 * Objetivo: impedir que uma função serverless fique pendurada indefinidamente
 * quando um provedor externo (Melhor Envio, Mercado Pago, Resend, Cloudinary)
 * não responde. NÃO altera nenhum caminho feliz — apenas adiciona um limite
 * superior de tempo, transformando um "pendura para sempre" em um erro claro
 * que cai no tratamento de erro já existente de cada chamador.
 */

/**
 * Corre `promise` contra um timer de `ms` milissegundos.
 * - Se a promise resolver/rejeitar antes do prazo, repassa o resultado tal e qual.
 * - Se o prazo estourar, rejeita com Error(`${label} timed out after ${ms}ms`).
 *
 * O timer é sempre limpo (nunca vaza), inclusive no caminho de sucesso, via finally.
 */
export function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`${label} timed out after ${ms}ms`))
    }, ms)
  })
  return Promise.race([promise, timeout]).finally(() => {
    if (timer) clearTimeout(timer)
  }) as Promise<T>
}

/**
 * fetch com limite de tempo via AbortController.
 * No timeout, aborta a requisição e o `fetch` rejeita (AbortError), que deve
 * fluir para o tratamento de erro já existente do chamador.
 */
export async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  ms: number,
): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ms)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}
