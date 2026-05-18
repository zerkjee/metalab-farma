import crypto from 'crypto'

export type CupomTipo = 'PERCENTUAL' | 'VALOR_FIXO' | 'FRETE_GRATIS'

export interface CupomLike {
  id: string
  ativo: boolean
  tipo: CupomTipo
  valor: number | { toNumber(): number }
  usoMaximo: number | null
  usoAtual: number
  validade: Date | null
}

function toNum(v: number | { toNumber(): number }): number {
  return typeof v === 'number' ? v : v.toNumber()
}

export function gerarNumeroPedido(): string {
  const ano = new Date().getFullYear()
  const seq = crypto.randomBytes(4).readUInt32BE(0).toString(36).toUpperCase().slice(0, 6).padEnd(6, '0')
  return `MTL-${ano}-${seq}`
}

export function cupomValido(cupom: CupomLike | null): cupom is CupomLike {
  if (!cupom || !cupom.ativo) return false
  if (cupom.validade && new Date(cupom.validade) < new Date()) return false
  if (cupom.usoMaximo !== null && cupom.usoAtual >= cupom.usoMaximo) return false
  return true
}

export function calcularDesconto(
  cupom: CupomLike,
  subtotal: number,
): { desconto: number; freteGratis: boolean } {
  const valor = toNum(cupom.valor)
  if (cupom.tipo === 'PERCENTUAL') return { desconto: (subtotal * valor) / 100, freteGratis: false }
  if (cupom.tipo === 'VALOR_FIXO') return { desconto: Math.min(valor, subtotal), freteGratis: false }
  return { desconto: 0, freteGratis: true }
}

export function calcularTotal(params: {
  subtotal: number
  desconto: number
  freteGratis: boolean
  fretePrco: number
}): { valorFrete: number; total: number } {
  const valorFrete = params.freteGratis ? 0 : params.fretePrco
  const total = params.subtotal - params.desconto + valorFrete
  return { valorFrete, total }
}
