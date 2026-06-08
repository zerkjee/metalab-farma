/**
 * Esconde a quantidade REAL de estoque do cliente.
 *
 * A vitrine só precisa saber se há ou não estoque (boolean). A contagem
 * exata é informação interna/administrativa, então nas respostas públicas
 * (páginas e API) o estoque é "clampado" para 0 ou 1 — o número real (ex.: 100)
 * nunca sai do servidor. As rotas de /api/admin mantêm o valor real.
 */
export function publicStock(estoque: number | null | undefined): number {
  return (estoque ?? 0) > 0 ? 1 : 0
}
