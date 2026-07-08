import { normalizeCep, normalizeCpfCnpj, normalizeMoney, normalizeUf } from './tiny-normalizers'
import type { FullOrderForTiny, TinyAddressSnapshot, TinyValidationResult } from './tiny-types'

export function parseTinyAddressSnapshot(enderecoSnap: string | null | undefined): TinyAddressSnapshot {
  if (!enderecoSnap) return {}
  try {
    const parsed = JSON.parse(enderecoSnap)
    return parsed && typeof parsed === 'object' ? parsed as TinyAddressSnapshot : {}
  } catch {
    return {}
  }
}

function hasValue(value: unknown): boolean {
  return String(value ?? '').trim().length > 0
}

function productLabel(nome: string | null | undefined): string {
  return hasValue(nome) ? `Produto "${String(nome).trim()}"` : 'Produto'
}

export function validateOrderBeforeTiny(order: FullOrderForTiny | null): TinyValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (!order) {
    return { valid: false, errors: ['Pedido não encontrado.'], warnings }
  }

  const address = parseTinyAddressSnapshot(order.enderecoSnap)
  const document = normalizeCpfCnpj(String(order.compradorCpf ?? ''))

  if (!order.pago || order.status === 'AGUARDANDO_PAGAMENTO') errors.push('Pedido ainda não está pago.')
  if (order.tinyPedidoId || order.tinySyncStatus === 'TINY_ORDER_CREATED') errors.push('Pedido já enviado para o Tiny.')
  if (normalizeMoney(order.total) <= 0) errors.push('Pedido com valor total inválido.')
  if (!order.itens.length) errors.push('Pedido sem itens.')

  if (!hasValue(order.compradorNome)) errors.push('Cliente sem nome.')
  if (!hasValue(order.compradorEmail)) errors.push('Cliente sem e-mail.')
  if (!document) errors.push('Cliente sem CPF/CNPJ.')
  if (document && document.length !== 11 && document.length !== 14) errors.push('CPF/CNPJ do cliente inválido.')

  if (!normalizeCep(String(address.cep ?? ''))) errors.push('Endereço do cliente sem CEP.')
  if (!hasValue(address.logradouro)) errors.push('Endereço do cliente sem rua.')
  if (!hasValue(address.numero)) errors.push('Endereço do cliente sem número.')
  if (!hasValue(address.bairro)) errors.push('Endereço do cliente sem bairro.')
  if (!hasValue(address.cidade)) errors.push('Endereço do cliente sem cidade.')
  if (!normalizeUf(String(address.estado ?? ''))) errors.push('Endereço do cliente sem UF.')

  for (const item of order.itens) {
    const label = productLabel(item.produtoNome)
    if (!hasValue(item.produtoSku)) errors.push(`${label} está sem SKU.`)
    if (!hasValue(item.produtoNome)) errors.push('Produto sem nome.')
    if (item.quantidade <= 0) errors.push(`${label} está com quantidade inválida.`)
    if (normalizeMoney(item.precoUnit) <= 0) errors.push(`${label} está com preço unitário inválido.`)

    if (!hasValue(item.produto?.ean)) warnings.push(`${label} está sem EAN cadastrado.`)
    if (item.produto?.pesoGramas == null) warnings.push(`${label} está sem peso cadastrado.`)
  }

  return { valid: errors.length === 0, errors, warnings }
}
