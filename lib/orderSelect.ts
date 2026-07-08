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

/**
 * Campos do pedido para a área ADMIN. Estende o select do cliente com os campos
 * de plumbing da integração Tiny/ERP (sincronização, id do pedido no Tiny, NF-e
 * e campos de reconciliação). Esses campos NUNCA devem ser expostos ao cliente
 * dono do pedido — use este select apenas em rotas protegidas por requireAdmin /
 * isAdminRole. Corrige o gap de leitura descrito em docs/tiny-architecture.md §7.1
 * (o badge Tiny da tela de detalhe sempre renderizava "Não iniciado" porque o
 * endpoint devolvia o CUSTOMER_ORDER_SELECT, que omite estes campos).
 */
export const ADMIN_ORDER_SELECT = {
  ...CUSTOMER_ORDER_SELECT,
  tinyPedidoId: true,
  tinyStatus: true,
  tinySyncStatus: true,
  tinySyncAt: true,
  tinyErro: true,
  tinyLastWebhookAt: true,
  tinyNumero: true,
  nfTinyId: true,
  nfSerie: true,
  nfStatus: true,
  nfXmlUrl: true,
  nfErro: true,
  nfEmitidaEm: true,
} satisfies Prisma.PedidoSelect
