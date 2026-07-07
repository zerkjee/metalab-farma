/**
 * Cliente isolado para o ERP Tiny (Olist) — API v2.
 *
 * ⚠️ WAVE 1 (Fundação): este módulo NÃO é invocado por nenhum fluxo de produção.
 * O webhook do Mercado Pago, os jobs e o admin permanecem inalterados.
 * A integração só passa a enviar pedidos reais quando:
 *   1. TINY_API_TOKEN estiver configurado no ambiente, E
 *   2. um job/gatilho (Wave 2/3) chamar estas funções.
 *
 * Particularidades da API Tiny v2 tratadas aqui:
 *   - Sempre responde HTTP 200; o erro vem em `retorno.status === "Erro"`.
 *   - Aceita corpo `application/x-www-form-urlencoded` com `token`, `formato=json`
 *     e o recurso serializado como JSON string.
 */

import { logger } from '@/lib/logger'

const TINY_API_BASE = 'https://api.tiny.com.br/api2'

// ─── Tipos de entrada ─────────────────────────────────────────────────────────

export interface TinyItemInput {
  sku: string
  nome: string
  quantidade: number
  precoUnit: number
}

export interface TinyPedidoInput {
  numero: string
  compradorNome: string
  compradorCpf: string
  compradorEmail: string
  compradorTelefone?: string | null
  enderecoSnap?: string | null
  subtotal: number
  desconto: number
  frete: number
  total: number
  itens: TinyItemInput[]
}

// ─── Tipos de saída ─────────────────────────────────────────────────────────

export type TinyOutcome =
  | { ok: true; tinyPedidoId: string; jaExistia: boolean; raw: string }
  | { ok: false; erro: string; codigoErro?: string; raw: string }

export interface TinyConsultaOutcome {
  ok: boolean
  tinyStatus?: string
  erro?: string
  raw: string
}

// Razões de bloqueio que não são erro de rede/API, mas guard-rails locais.
export const TINY_DISABLED = 'TINY_DISABLED'

// ─── Configuração / guard ─────────────────────────────────────────────────────

/** True somente quando o token está presente. Sem token → nenhuma chamada real é feita. */
export function tinyConfigurado(): boolean {
  return Boolean(process.env.TINY_API_TOKEN)
}

// ─── Camada de transporte (interna) ────────────────────────────────────────────

interface TinyRetornoRegistro {
  registro?: {
    id?: string | number
    numero?: string
    status?: string
    erros?: Array<{ erro?: string }>
  }
}

interface TinyRetorno {
  retorno?: {
    status?: 'OK' | 'Erro'
    codigo_erro?: string | number
    erros?: Array<{ erro?: string }>
    registros?: TinyRetornoRegistro[]
    pedidos?: Array<{ pedido?: { id?: string | number; numero?: string; situacao?: string } }>
  }
}

/**
 * Executa uma chamada à API Tiny v2. Trata o padrão "HTTP 200 + retorno.status".
 * Lança apenas em falha de transporte (rede); erros de negócio voltam no objeto.
 */
async function tinyRequest(
  recurso: string,
  params: Record<string, string>,
): Promise<{ httpOk: boolean; body: TinyRetorno; raw: string }> {
  const token = process.env.TINY_API_TOKEN
  if (!token) {
    // Defesa em profundidade: nunca chega aqui se o chamador respeitar tinyConfigurado().
    throw new Error(TINY_DISABLED)
  }

  const form = new URLSearchParams({ token, formato: 'json', ...params })
  const res = await fetch(`${TINY_API_BASE}/${recurso}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
  })

  const raw = await res.text()
  let body: TinyRetorno = {}
  try {
    body = JSON.parse(raw) as TinyRetorno
  } catch {
    // Tiny devolveu algo não-JSON — tratado como erro de negócio pelo chamador.
    body = {}
  }
  return { httpOk: res.ok, body, raw }
}

// Formato do snapshot serializado em Pedido.enderecoSnap (ver lib/validations.ts
// enderecoSchema): { cep, logradouro, numero, complemento?, bairro, cidade, estado }.
interface EnderecoSnap {
  cep?: string
  logradouro?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade?: string
  estado?: string
}

/**
 * Converte o `enderecoSnap` (JSON string) nos campos de endereço do nó `cliente`
 * do payload Tiny v2 (`pedido.incluir.php`). Retorna `{}` quando o snapshot está
 * ausente ou malformado — o pedido ainda é criado, apenas sem endereço. Corrige
 * a pendência de docs/tiny-architecture.md §7.2 (endereço não era enviado ao Tiny).
 */
function mapearEnderecoTiny(enderecoSnap?: string | null): Record<string, string> {
  if (!enderecoSnap) return {}
  let snap: EnderecoSnap
  try {
    snap = JSON.parse(enderecoSnap) as EnderecoSnap
  } catch {
    return {}
  }
  if (!snap || typeof snap !== 'object') return {}

  const campos: Record<string, string> = {}
  if (snap.logradouro) campos.endereco = snap.logradouro
  if (snap.numero) campos.numero = snap.numero
  if (snap.complemento) campos.complemento = snap.complemento
  if (snap.bairro) campos.bairro = snap.bairro
  if (snap.cep) campos.cep = snap.cep
  if (snap.cidade) campos.cidade = snap.cidade
  if (snap.estado) campos.uf = snap.estado
  return campos
}

function extrairErros(retorno?: TinyRetorno['retorno']): string {
  if (!retorno) return 'resposta vazia do Tiny'
  const errosTopo = (retorno.erros ?? []).map((e) => e.erro).filter(Boolean)
  const errosRegistro = (retorno.registros ?? [])
    .flatMap((r) => r.registro?.erros ?? [])
    .map((e) => e.erro)
    .filter(Boolean)
  const todos = [...errosTopo, ...errosRegistro]
  return todos.length > 0 ? todos.join('; ') : 'erro não especificado pelo Tiny'
}

// ─── Funções públicas ──────────────────────────────────────────────────────────

/**
 * Localiza um pedido no Tiny pelo número interno da loja (idempotência).
 * Retorna o tinyPedidoId se já existir, ou null se não encontrado.
 */
export async function localizarPedidoTiny(numero: string): Promise<string | null> {
  const { body } = await tinyRequest('pedidos.pesquisa.php', { pesquisa: numero })
  const lista = body.retorno?.pedidos ?? []
  for (const item of lista) {
    if (item.pedido?.numero === numero && item.pedido?.id != null) {
      return String(item.pedido.id)
    }
  }
  return null
}

/**
 * Cria o pedido no Tiny, ou retorna o ID existente se o número já estiver lá.
 * Idempotente: busca antes de criar.
 */
export async function criarOuLocalizarPedidoTiny(input: TinyPedidoInput): Promise<TinyOutcome> {
  if (!tinyConfigurado()) {
    logger.warn('Tiny: chamada ignorada — TINY_API_TOKEN ausente', { numero: input.numero })
    return { ok: false, erro: TINY_DISABLED, raw: '' }
  }

  try {
    // 1) Idempotência: já existe no Tiny?
    const existente = await localizarPedidoTiny(input.numero)
    if (existente) {
      return { ok: true, tinyPedidoId: existente, jaExistia: true, raw: '' }
    }

    // 2) Monta o payload no formato Tiny v2.
    const pedidoTiny = {
      pedido: {
        numero_pedido_ecommerce: input.numero,
        cliente: {
          nome: input.compradorNome,
          tipo_pessoa: 'F',
          cpf_cnpj: input.compradorCpf,
          email: input.compradorEmail,
          fone: input.compradorTelefone ?? '',
          ...mapearEnderecoTiny(input.enderecoSnap),
        },
        itens: input.itens.map((it) => ({
          item: {
            codigo: it.sku,
            descricao: it.nome,
            quantidade: it.quantidade,
            valor_unitario: it.precoUnit,
          },
        })),
        valor_frete: input.frete,
        valor_desconto: input.desconto,
      },
    }

    const { body, raw } = await tinyRequest('pedido.incluir.php', {
      pedido: JSON.stringify(pedidoTiny),
    })

    const retorno = body.retorno
    if (retorno?.status !== 'OK') {
      return {
        ok: false,
        erro: extrairErros(retorno),
        codigoErro: retorno?.codigo_erro != null ? String(retorno.codigo_erro) : undefined,
        raw,
      }
    }

    const idCriado = retorno.registros?.[0]?.registro?.id
    if (idCriado == null) {
      return { ok: false, erro: 'Tiny retornou OK sem id de pedido', raw }
    }

    return { ok: true, tinyPedidoId: String(idCriado), jaExistia: false, raw }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    logger.error('Tiny: falha de transporte ao criar pedido', { numero: input.numero, err: msg })
    return { ok: false, erro: msg, raw: '' }
  }
}

/** Consulta a situação atual de um pedido já existente no Tiny. */
export async function consultarPedidoTiny(tinyPedidoId: string): Promise<TinyConsultaOutcome> {
  if (!tinyConfigurado()) {
    return { ok: false, erro: TINY_DISABLED, raw: '' }
  }

  try {
    const { body, raw } = await tinyRequest('pedido.obter.php', { id: tinyPedidoId })
    const retorno = body.retorno
    if (retorno?.status !== 'OK') {
      return { ok: false, erro: extrairErros(retorno), raw }
    }
    const situacao = retorno.registros?.[0]?.registro?.status
    return { ok: true, tinyStatus: situacao, raw }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return { ok: false, erro: msg, raw: '' }
  }
}
