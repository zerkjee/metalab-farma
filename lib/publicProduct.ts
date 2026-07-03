/**
 * Maior quantidade que a vitrine oferece por pedido (seletor de desconto por
 * volume na PDP vai até "3 unidades" — ver components/ProductDetailHero.tsx).
 * O carrinho usa o estoque público como teto de quantidade adicionável, então
 * esse teto precisa acompanhar a maior faixa vendável, ou selecionar "2/3
 * unidades" fica truncado para 1 mesmo com estoque real suficiente.
 */
const MAX_PUBLIC_STOCK = 3

/**
 * Esconde a quantidade REAL de estoque do cliente.
 *
 * A vitrine só precisa saber se há estoque, e o suficiente para cobrir as
 * faixas de quantidade vendidas (até MAX_PUBLIC_STOCK). A contagem exata
 * além disso é informação interna/administrativa, então nas respostas
 * públicas (páginas e API) o estoque é "clampado" para 0..MAX_PUBLIC_STOCK —
 * o número real (ex.: 100) nunca sai do servidor. As rotas de /api/admin
 * mantêm o valor real. A validação definitiva contra sobrevenda acontece no
 * checkout (/api/pedidos), que sempre lê o estoque real do banco.
 */
export function publicStock(estoque: number | null | undefined): number {
  return Math.min(Math.max(estoque ?? 0, 0), MAX_PUBLIC_STOCK)
}
