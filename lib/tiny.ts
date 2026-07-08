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

const DEFAULT_TINY_API_BASE = 'https://api.tiny.com.br/api2'
const TINY_REQUEST_TIMEOUT_MS = 15000

function tinyApiBase(): string {
  return (process.env.TINY_API_BASE_URL || DEFAULT_TINY_API_BASE).replace(/\/+$/, '')
}

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
  | { ok: true; tinyPedidoId: string; tinyNumero?: string; jaExistia: boolean; raw: string }
  | { ok: false; erro: string; codigoErro?: string; raw: string }

export interface TinyConsultaOutcome {
  ok: boolean
  tinyStatus?: string
  tinyNumero?: string
  erro?: string
  raw: string
}

export interface TinyTestConnectionResult {
  ok: boolean
  message: string
  raw?: string
}

export interface TinyNotaFiscalResumo {
  id: string
  numero?: string
  numeroEcommerce?: string
  chaveAcesso?: string
  situacao?: string
  descricaoSituacao?: string
  dataEmissao?: string
}

export interface TinyNotaFiscalOutcome {
  ok: boolean
  nota?: TinyNotaFiscalResumo
  erro?: string
  raw: string
}

export interface TinyNotaFiscalLinkOutcome {
  ok: boolean
  link?: string
  erro?: string
  raw: string
}

export interface TinyNotaFiscalXmlOutcome {
  ok: boolean
  xml?: string
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
    registros?: TinyRetornoRegistro[] | TinyRetornoRegistro
    pedidos?: Array<{ pedido?: { id?: string | number; numero?: string; numero_ecommerce?: string; situacao?: string } }>
    notas_fiscais?: Array<{ nota_fiscal?: Record<string, unknown> }>
    nota_fiscal?: Record<string, unknown>
    link_nfe?: string
    xml_nfe?: string
    xml_cancelamento?: string
  }
}

function normalizarRegistros(registros?: TinyRetornoRegistro[] | TinyRetornoRegistro): TinyRetornoRegistro[] {
  if (!registros) return []
  return Array.isArray(registros) ? registros : [registros]
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
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TINY_REQUEST_TIMEOUT_MS)
  try {
    const res = await fetch(`${tinyApiBase()}/${recurso}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
      signal: controller.signal,
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
  } finally {
    clearTimeout(timeout)
  }
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
  const errosRegistro = normalizarRegistros(retorno.registros)
    .flatMap((r) => r.registro?.erros ?? [])
    .map((e) => e.erro)
    .filter(Boolean)
  const todos = [...errosTopo, ...errosRegistro]
  return todos.length > 0 ? todos.join('; ') : 'erro não especificado pelo Tiny'
}

function pickString(obj: Record<string, unknown> | undefined, keys: string[]): string | undefined {
  if (!obj) return undefined
  for (const key of keys) {
    const value = obj[key]
    if (value != null && String(value).trim() !== '') return String(value)
  }
  return undefined
}

function normalizarNotaFiscal(nota: Record<string, unknown> | undefined): TinyNotaFiscalResumo | null {
  const id = pickString(nota, ['id'])
  if (!id) return null

  return {
    id,
    numero: pickString(nota, ['numero']),
    numeroEcommerce: pickString(nota, ['numero_ecommerce', 'numeroEcommerce']),
    chaveAcesso: pickString(nota, ['chave_acesso', 'chaveAcesso']),
    situacao: pickString(nota, ['situacao']),
    descricaoSituacao: pickString(nota, ['descricao_situacao', 'descricaoSituacao']),
    dataEmissao: pickString(nota, ['data_emissao', 'dataEmissao']),
  }
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
    if ((item.pedido?.numero === numero || item.pedido?.numero_ecommerce === numero) && item.pedido?.id != null) {
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

    const registroCriado = normalizarRegistros(retorno.registros).find((item) => item.registro?.id != null)?.registro
    const idCriado = registroCriado?.id
    if (idCriado == null) {
      return { ok: false, erro: 'Tiny retornou OK sem id de pedido', raw }
    }

    const tinyNumero = registroCriado?.numero
    return { ok: true, tinyPedidoId: String(idCriado), tinyNumero, jaExistia: false, raw }
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
    const registro = normalizarRegistros(retorno.registros)[0]?.registro
    const situacao = registro?.status
    const tinyNumero = registro?.numero
    return { ok: true, tinyStatus: situacao, tinyNumero, raw }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return { ok: false, erro: msg, raw: '' }
  }
}

/** Testa token/base URL com uma pesquisa inofensiva de pedidos. */
export async function testarConexaoTiny(): Promise<TinyTestConnectionResult> {
  if (!tinyConfigurado()) {
    return { ok: false, message: 'TINY_API_TOKEN não configurado.' }
  }

  try {
    const hoje = new Date()
    const dd = String(hoje.getDate()).padStart(2, '0')
    const mm = String(hoje.getMonth() + 1).padStart(2, '0')
    const yyyy = hoje.getFullYear()
    const data = `${dd}/${mm}/${yyyy}`
    const { body, raw } = await tinyRequest('pedidos.pesquisa.php', { dataInicial: data, dataFinal: data, pagina: '1' })
    const retorno = body.retorno

    if (retorno?.status !== 'OK') {
      return { ok: false, message: extrairErros(retorno), raw }
    }

    return { ok: true, message: 'Conexão com o Tiny validada com sucesso.', raw }
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : String(err) }
  }
}

/** Pesquisa NF-e de saída vinculada ao número interno do pedido da loja. */
export async function pesquisarNotaFiscalTiny(numeroEcommerce: string): Promise<TinyNotaFiscalOutcome> {
  if (!tinyConfigurado()) {
    return { ok: false, erro: TINY_DISABLED, raw: '' }
  }

  try {
    const { body, raw } = await tinyRequest('notas.fiscais.pesquisa.php', {
      tipoNota: 'S',
      numeroEcommerce,
      pagina: '1',
    })
    const retorno = body.retorno
    if (retorno?.status !== 'OK') {
      return { ok: false, erro: extrairErros(retorno), raw }
    }

    const nota = (retorno.notas_fiscais ?? [])
      .map((item) => normalizarNotaFiscal(item.nota_fiscal))
      .find((item): item is TinyNotaFiscalResumo => !!item)

    return { ok: true, nota, raw }
  } catch (err) {
    return { ok: false, erro: err instanceof Error ? err.message : String(err), raw: '' }
  }
}

export async function obterNotaFiscalTiny(id: string): Promise<TinyNotaFiscalOutcome> {
  if (!tinyConfigurado()) {
    return { ok: false, erro: TINY_DISABLED, raw: '' }
  }

  try {
    const { body, raw } = await tinyRequest('nota.fiscal.obter.php', { id })
    const retorno = body.retorno
    if (retorno?.status !== 'OK') {
      return { ok: false, erro: extrairErros(retorno), raw }
    }

    return { ok: true, nota: normalizarNotaFiscal(retorno?.nota_fiscal) ?? undefined, raw }
  } catch (err) {
    return { ok: false, erro: err instanceof Error ? err.message : String(err), raw: '' }
  }
}

export async function obterLinkNotaFiscalTiny(id: string): Promise<TinyNotaFiscalLinkOutcome> {
  if (!tinyConfigurado()) {
    return { ok: false, erro: TINY_DISABLED, raw: '' }
  }

  try {
    const { body, raw } = await tinyRequest('nota.fiscal.obter.link.php', { id })
    const retorno = body.retorno
    if (retorno?.status !== 'OK') {
      return { ok: false, erro: extrairErros(retorno), raw }
    }

    return { ok: true, link: retorno?.link_nfe, raw }
  } catch (err) {
    return { ok: false, erro: err instanceof Error ? err.message : String(err), raw: '' }
  }
}

export async function obterXmlNotaFiscalTiny(id: string): Promise<TinyNotaFiscalXmlOutcome> {
  if (!tinyConfigurado()) {
    return { ok: false, erro: TINY_DISABLED, raw: '' }
  }

  try {
    const { body, raw } = await tinyRequest('nota.fiscal.obter.xml.php', { id })
    const retorno = body.retorno
    if (retorno?.status !== 'OK') {
      return { ok: false, erro: extrairErros(retorno), raw }
    }

    return { ok: true, xml: retorno?.xml_nfe ?? retorno?.xml_cancelamento, raw }
  } catch (err) {
    return { ok: false, erro: err instanceof Error ? err.message : String(err), raw: '' }
  }
}
