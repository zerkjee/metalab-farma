import { Prisma } from "@prisma/client"

/**
 * Campos do pedido seguros para expor ao cliente dono do pedido.
 * Exclui deliberadamente os campos internos da integração Tiny/ERP
 * (tinyPayload, tinyErro, tinySyncStatus etc.) — são debug/plumbing
 * interno, não informação de compra do cliente.
 */
export const CUSTOMER_ORDER_SELECT = {
  id: true,
  numero: true,
  status: true,
  subtotal: true,
  desconto: true,
  frete: true,
  total: true,
  metodoPagamento: true,
  pagamentoId: true,
  pixQrCode: true,
  pixQrCodeBase64: true,
  pago: true,
  pagoEm: true,
  codigoRastreio: true,
  enviadoEm: true,
  compradorNome: true,
  compradorEmail: true,
  compradorCpf: true,
  compradorTelefone: true,
  enderecoSnap: true,
  criadoEm: true,
  atualizadoEm: true,
  nfNumero: true,
  nfChave: true,
  nfUrl: true,
  usuarioId: true,
  itens: {
    include: { produto: { select: { nome: true, imagemUrl: true, slug: true } } },
  },
  cupom: { select: { codigo: true } },
} satisfies Prisma.PedidoSelect
