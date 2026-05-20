import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { freteRatelimit, getIp } from "@/lib/rateLimit"
import { logger } from "@/lib/logger"
import { maskCep } from "@/lib/mask"
import { prisma } from "@/lib/prisma"
import { calcularPacote } from "@/lib/freteUtils"

const itemSchema = z.object({
  produtoId: z.string().min(1),
  quantidade: z.number().int().positive(),
})

const bodySchema = z.object({
  cep:   z.string().regex(/^\d{8}$/, "CEP deve ter 8 dígitos"),
  itens: z.array(itemSchema).min(1).max(50),
})

const MELHOR_ENVIO_URL = "https://melhorenvio.com.br/api/v2/me/shipment/calculate"

// PAC = 1, SEDEX = 2
const SERVICE_MAP: Record<number, { id: string; label: string; description: string }> = {
  1: { id: "standard", label: "PAC / Correios",   description: "Envio econômico com rastreio via Correios." },
  2: { id: "express",  label: "SEDEX / Correios", description: "Entrega expressa com rastreio via Correios." },
}

export async function POST(req: NextRequest) {
  const { success } = await freteRatelimit.limit(getIp(req))
  if (!success) {
    return NextResponse.json({ erro: "Muitas consultas. Aguarde alguns minutos." }, { status: 429 })
  }

  const raw = await req.json().catch(() => null)
  const parsed = bodySchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ erro: "Dados inválidos", detalhes: parsed.error.issues }, { status: 400 })
  }

  const { cep, itens } = parsed.data

  const token = process.env.MELHOR_ENVIO_TOKEN
  const originCep = process.env.MELHOR_ENVIO_ORIGIN_CEP
  if (!token || !originCep) {
    return NextResponse.json({ erro: "Serviço de frete não configurado" }, { status: 503 })
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
    })

    if (!res.ok) {
      const txt = await res.text()
      logger.error("Melhor Envio: erro upstream", {
        status: res.status,
        body: txt.slice(0, 200),
        cepMasked: maskCep(cep),
      })
      return NextResponse.json({ erro: "Erro ao calcular frete" }, { status: 502 })
    }

    const data: unknown[] = await res.json()

    const opcoes = (data as Array<{
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
      return NextResponse.json({ erro: "Nenhuma opção de frete disponível para este CEP" }, { status: 422 })
    }

    return NextResponse.json(opcoes)
  } catch (err) {
    logger.error("Falha calculando frete", err)
    return NextResponse.json({ erro: "Erro interno ao calcular frete" }, { status: 500 })
  }
}
