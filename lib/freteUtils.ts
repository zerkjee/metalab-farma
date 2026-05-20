import { logger } from "@/lib/logger"

// Dimensões conservadoras para produtos sem dados logísticos cadastrados
export const FALLBACK_DIMS = {
  pesoGramas: 500,
  alturaCm: 10,
  larguraCm: 12,
  comprimentoCm: 15,
} as const

// Dimensões mínimas aceitas pelos Correios
const CORREIOS_MIN = { alturaCm: 2, larguraCm: 11, comprimentoCm: 16 }

export type ProdutoDims = {
  id: string
  sku?: string | null
  tipo: "SIMPLES" | "KIT"
  pesoGramas?: number | null
  alturaCm?: number | null
  larguraCm?: number | null
  comprimentoCm?: number | null
  kitItens?: {
    quantidade: number
    produto: {
      pesoGramas?: number | null
      alturaCm?: number | null
      larguraCm?: number | null
      comprimentoCm?: number | null
    }
  }[]
}

export type CartItemRef = { produtoId: string; quantidade: number }

export type PackageDims = {
  weightKg: number
  heightCm: number
  widthCm: number
  lengthCm: number
}

type ResolvedDims = {
  pesoGramas: number
  alturaCm: number
  larguraCm: number
  comprimentoCm: number
  usedFallback: boolean
}

// Resolve as dimensões de um produto individual.
// KIT com dimensões próprias → usa as próprias.
// KIT sem dimensões → soma dos componentes.
// SIMPLES sem dimensões → fallback.
export function resolveProductDims(produto: ProdutoDims): ResolvedDims {
  const ownComplete =
    produto.pesoGramas != null &&
    produto.alturaCm != null &&
    produto.larguraCm != null &&
    produto.comprimentoCm != null

  if (ownComplete) {
    return {
      pesoGramas: produto.pesoGramas!,
      alturaCm: produto.alturaCm!,
      larguraCm: produto.larguraCm!,
      comprimentoCm: produto.comprimentoCm!,
      usedFallback: false,
    }
  }

  // Kit sem dimensões próprias: calcula pela soma dos componentes
  if (produto.tipo === "KIT" && produto.kitItens && produto.kitItens.length > 0) {
    let totalPeso = 0
    let maxAltura = 0
    let maxLargura = 0
    let maxComprimento = 0
    let usedFallback = false

    for (const ki of produto.kitItens) {
      const c = ki.produto
      const qty = ki.quantidade
      const compComplete =
        c.pesoGramas != null && c.alturaCm != null && c.larguraCm != null && c.comprimentoCm != null

      if (!compComplete) usedFallback = true

      totalPeso += (c.pesoGramas ?? FALLBACK_DIMS.pesoGramas) * qty
      maxAltura = Math.max(maxAltura, c.alturaCm ?? FALLBACK_DIMS.alturaCm)
      maxLargura = Math.max(maxLargura, c.larguraCm ?? FALLBACK_DIMS.larguraCm)
      maxComprimento = Math.max(maxComprimento, c.comprimentoCm ?? FALLBACK_DIMS.comprimentoCm)
    }

    return {
      pesoGramas: totalPeso || FALLBACK_DIMS.pesoGramas,
      alturaCm: maxAltura || FALLBACK_DIMS.alturaCm,
      larguraCm: maxLargura || FALLBACK_DIMS.larguraCm,
      comprimentoCm: maxComprimento || FALLBACK_DIMS.comprimentoCm,
      usedFallback,
    }
  }

  // Sem dimensões → fallback total
  return { ...FALLBACK_DIMS, usedFallback: true }
}

/**
 * Calcula as dimensões consolidadas do pacote para um carrinho.
 *
 * Lógica:
 * - Peso: soma de (pesoGramas × quantidade) de cada item
 * - Altura/Largura/Comprimento: máximo entre todos os itens (assume que cabem em caixa única)
 * - Respeita mínimos dos Correios
 *
 * Produtos com IDs locais (mock) ou não encontrados no banco usam fallback.
 */
export function calcularPacote(
  itens: CartItemRef[],
  produtos: ProdutoDims[],
): { pacote: PackageDims; semDimensoes: string[] } {
  const semDimensoes: string[] = []
  let totalPesoGramas = 0
  let maxAltura = 0
  let maxLargura = 0
  let maxComprimento = 0

  for (const item of itens) {
    // Produtos locais (mock) nunca estão no banco
    const isLocal = item.produtoId.startsWith("local-")
    const produto = isLocal ? undefined : produtos.find((p) => p.id === item.produtoId)

    if (!produto) {
      if (!isLocal) semDimensoes.push(item.produtoId)
      totalPesoGramas += FALLBACK_DIMS.pesoGramas * item.quantidade
      maxAltura = Math.max(maxAltura, FALLBACK_DIMS.alturaCm)
      maxLargura = Math.max(maxLargura, FALLBACK_DIMS.larguraCm)
      maxComprimento = Math.max(maxComprimento, FALLBACK_DIMS.comprimentoCm)
      continue
    }

    const dims = resolveProductDims(produto)

    if (dims.usedFallback) {
      semDimensoes.push(produto.sku ?? produto.id)
    }

    totalPesoGramas += dims.pesoGramas * item.quantidade
    maxAltura = Math.max(maxAltura, dims.alturaCm)
    maxLargura = Math.max(maxLargura, dims.larguraCm)
    maxComprimento = Math.max(maxComprimento, dims.comprimentoCm)
  }

  // Garante dimensões mínimas dos Correios
  const heightCm = Math.max(maxAltura || FALLBACK_DIMS.alturaCm, CORREIOS_MIN.alturaCm)
  const widthCm = Math.max(maxLargura || FALLBACK_DIMS.larguraCm, CORREIOS_MIN.larguraCm)
  const lengthCm = Math.max(maxComprimento || FALLBACK_DIMS.comprimentoCm, CORREIOS_MIN.comprimentoCm)
  const weightKg = (totalPesoGramas || FALLBACK_DIMS.pesoGramas) / 1000

  if (semDimensoes.length > 0) {
    logger.warn("Frete: produtos sem dimensões — usando fallback", { semDimensoes })
  }

  return {
    pacote: { weightKg, heightCm, widthCm, lengthCm },
    semDimensoes,
  }
}
