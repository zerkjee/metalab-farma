import { logger } from "@/lib/logger"
import { maskCep } from "@/lib/mask"
import { prisma } from "@/lib/prisma"
import { calcularPacote } from "@/lib/freteUtils"

export const MELHOR_ENVIO_URL = "https://melhorenvio.com.br/api/v2/me/shipment/calculate"

// PAC = 1, SEDEX = 2
export const SERVICE_MAP: Record<number, { id: string; label: string; description: string }> = {
  1: { id: "standard", label: "PAC / Correios",   description: "Envio econômico com rastreio via Correios." },
  2: { id: "express",  label: "SEDEX / Correios", description: "Entrega expressa com rastreio via Correios." },
}

export interface FreteOpcao {
  id: string
  label: string
  description: string
  price: number
  estimate: string
  _semDimensoes?: string[]
}

export type FreteItem = { produtoId: string; quantidade: number }

export type CotarFreteResult =
  | { ok: true; opcoes: FreteOpcao[] }
  | { ok: false; status: number; erro: string }

/**
 * Cota o frete no Melhor Envio a partir do CEP e dos itens.
 * Dimensões/peso vêm SEMPRE do banco (via calcularPacote) — nunca do cliente.
 * Fonte única usada tanto pela rota /api/frete quanto pelo recálculo em /api/pedidos.
 */
export async function cotarFrete({ cep, itens }: { cep: string; itens: FreteItem[] }): Promise<CotarFreteResult> {
  const token = process.env.MELHOR_ENVIO_TOKEN
  const originCep = process.env.MELHOR_ENVIO_ORIGIN_CEP
  if (!token || !originCep) {
    return { ok: false, status: 503, erro: "Serviço de frete não configurado" }
  }

  // Busca apenas IDs reais do banco (ignora produtos locais/mock do cliente)
  const produtoIds = itens
    .map((i) => i.produtoId)
    .filter((id) => !id.startsWith("local-"))

  const produtos = produtoIds.length > 0
    ? await prisma.produto.findMany({
        where: { id: { in: produtoIds }, ativo: true },
        select: {
          id: true,
          sku: true,
          tipo: true,
          pesoGramas: true,
          alturaCm: true,
          larguraCm: true,
          comprimentoCm: true,
          kitItens: {
            select: {
              quantidade: true,
              produto: {
                select: {
                  pesoGramas: true,
                  alturaCm: true,
                  larguraCm: true,
                  comprimentoCm: true,
                },
              },
            },
          },
        },
      })
    : []

  const { pacote, semDimensoes } = calcularPacote(itens, produtos as Parameters<typeof calcularPacote>[1])

  const body = {
    from:    { postal_code: originCep },
    to:      { postal_code: cep },
    package: {
      height: pacote.heightCm,
      width:  pacote.widthCm,
      length: pacote.lengthCm,
      weight: pacote.weightKg,
    },
    options:  { receipt: false, own_hand: false },
    services: "1,2",
  }

  // Timeout defensivo: sem isto, uma resposta pendurada do Melhor Envio travaria
  // a função serverless. No abort, o fetch rejeita e cai no catch existente (500).
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)

  try {
    const res = await fetch(MELHOR_ENVIO_URL, {
      method: "POST",
      headers: {
        Authorization:  `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept:         "application/json",
        "User-Agent":   "Metalab Store (mlmetalab@gmail.com)",
      },
      body: JSON.stringify(body),
      next: { revalidate: 0 },
      signal: controller.signal,
    })

    if (!res.ok) {
      const txt = await res.text()
      logger.error("Melhor Envio: erro upstream", {
        status: res.status,
        body: txt.slice(0, 200),
        cepMasked: maskCep(cep),
      })
      return { ok: false, status: 502, erro: "Erro ao calcular frete" }
    }

    const data: unknown[] = await res.json()

    const opcoes: FreteOpcao[] = (data as Array<{
      id: number
      price?: string
      error?: string | null
      delivery_range?: { min: number; max: number }
      delivery_time?: number
    }>)
      .filter((s) => !s.error && s.price && SERVICE_MAP[s.id])
      .map((s) => {
        const meta = SERVICE_MAP[s.id]
        const min = s.delivery_range?.min ?? s.delivery_time ?? 0
        const max = s.delivery_range?.max ?? s.delivery_time ?? 0
        return {
          id:          meta.id,
          label:       meta.label,
          description: meta.description,
          price:       parseFloat(s.price ?? "0") || 0,
          estimate:    `${min} a ${max} dias úteis`,
          _semDimensoes: semDimensoes.length > 0 ? semDimensoes : undefined,
        }
      })
      .sort((a, b) => a.price - b.price)

    if (opcoes.length === 0) {
      return { ok: false, status: 422, erro: "Nenhuma opção de frete disponível para este CEP" }
    }

    return { ok: true, opcoes }
  } catch (err) {
    logger.error("Falha calculando frete", err)
    return { ok: false, status: 500, erro: "Erro interno ao calcular frete" }
  } finally {
    clearTimeout(timeout)
  }
}

/** Seleciona a opção de frete pelo id de serviço ('standard' | 'express'). */
export function selecionarOpcaoFrete(opcoes: FreteOpcao[], servicoId: string): FreteOpcao | null {
  return opcoes.find((o) => o.id === servicoId) ?? null
}
