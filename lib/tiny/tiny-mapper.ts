import {
  normalizeCep,
  normalizeCpfCnpj,
  normalizeDateToTiny,
  normalizeMoney,
  normalizePhone,
  normalizeUf,
} from './tiny-normalizers'
import { parseTinyAddressSnapshot } from './tiny-validation'
import type { FullOrderForTiny, TinyCreateOrderPayload, TinyPersonType } from './tiny-types'

function tipoPessoa(cpfCnpj: string): TinyPersonType | undefined {
  if (cpfCnpj.length === 11) return 'F'
  if (cpfCnpj.length === 14) return 'J'
  return undefined
}

function paymentLabel(value: string | null): string {
  if (value === 'CARTAO_CREDITO') return 'Cartao de credito'
  if (value === 'CARTAO_DEBITO') return 'Cartao de debito'
  if (value === 'BOLETO') return 'Boleto'
  return 'Pix'
}

export function mapOrderToTinyPayload(order: FullOrderForTiny): TinyCreateOrderPayload {
  const address = parseTinyAddressSnapshot(order.enderecoSnap)
  const document = normalizeCpfCnpj(String(order.compradorCpf ?? ''))
  const phone = normalizePhone(order.compradorTelefone)
  const payment = paymentLabel(order.metodoPagamento)

  return {
    pedido: {
      numero_ecommerce: order.numero,
      numero_pedido_ecommerce: order.numero,
      data_pedido: normalizeDateToTiny(order.criadoEm),
      cliente: {
        nome: String(order.compradorNome ?? '').trim(),
        tipo_pessoa: tipoPessoa(document),
        cpf_cnpj: document,
        endereco: String(address.logradouro ?? '').trim(),
        numero: String(address.numero ?? '').trim(),
        complemento: String(address.complemento ?? '').trim() || undefined,
        bairro: String(address.bairro ?? '').trim(),
        cep: normalizeCep(String(address.cep ?? '')),
        cidade: String(address.cidade ?? '').trim(),
        uf: normalizeUf(String(address.estado ?? '')),
        fone: phone,
        email: String(order.compradorEmail ?? '').trim(),
      },
      itens: order.itens.map((item) => ({
        item: {
          codigo: String(item.produtoSku ?? '').trim(),
          descricao: String(item.produtoNome ?? '').trim(),
          unidade: 'UN',
          quantidade: item.quantidade,
          valor_unitario: normalizeMoney(item.precoUnit),
        },
      })),
      parcelas: [
        {
          parcela: {
            dias: 0,
            valor: normalizeMoney(order.total),
            forma_pagamento: payment,
            meio_pagamento: payment,
          },
        },
      ],
      valor_frete: normalizeMoney(order.frete),
      valor_desconto: normalizeMoney(order.desconto),
      obs: [
        'Pedido originado na loja propria Metalab.',
        `Pedido interno: ${order.id}`,
        `Numero interno: ${order.numero}`,
        `Pagamento: ${payment}`,
        `Status pagamento: ${order.status}`,
      ].join('\n'),
      obs_interna: [
        'Integracao automatica Metalab -> Tiny.',
        'Nao emitir NF-e automaticamente nesta fase sem conferencia operacional.',
      ].join('\n'),
    },
  }
}
