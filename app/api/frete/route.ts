import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { freteRatelimit, getIp } from "@/lib/rateLimit"
import { logger } from "@/lib/logger"
import { maskCep } from "@/lib/mask"

const querySchema = z.object({
  cep: z.string().regex(/^\d{8}$/),
})

const MELHOR_ENVIO_URL = "https://melhorenvio.com.br/api/v2/me/shipment/calculate"

// PAC = 1, SEDEX = 2
const SERVICE_MAP: Record<number, { id: string; label: string; description: string }> = {
  1: { id: "standard", label: "PAC / Correios",    description: "Envio econômico com rastreio via Correios." },
  2: { id: "express",  label: "SEDEX / Correios",  description: "Entrega expressa com rastreio via Correios." },
}

export async function GET(req: NextRequest) {
  const { success } = await freteRatelimit.limit(getIp(req))
  if (!success) {
    return NextResponse.json({ erro: "Muitas consultas. Aguarde alguns minutos." }, { status: 429 })
  }

  const { searchParams } = new URL(req.url)
  const parsed = querySchema.safeParse({ cep: searchParams.get("cep") })

  if (!parsed.success) {
    return NextResponse.json({ erro: "CEP inválido" }, { status: 400 })
  }

  const token = process.env.MELHOR_ENVIO_TOKEN
  const originCep = process.env.MELHOR_ENVIO_ORIGIN_CEP

  if (!token || !originCep) {
    return NextResponse.json({ erro: "Serviço de frete não configurado" }, { status: 503 })
  }

  const { cep } = parsed.data

  const body = {
    from: { postal_code: originCep },
    to:   { postal_code: cep },
    package: {
      height: Number(process.env.FRETE_ALTURA_CM  ?? 10),
      width:  Number(process.env.FRETE_LARGURA_CM ?? 12),
      length: Number(process.env.FRETE_COMPRIMENTO_CM ?? 15),
      weight: Number(process.env.FRETE_PESO_KG    ?? 0.5),
    },
    options: { receipt: false, own_hand: false },
    services: "1,2",
  }

  try {
    const res = await fetch(MELHOR_ENVIO_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "Metalab Store (mlmetalab@gmail.com)",
      },
      body: JSON.stringify(body),
      next: { revalidate: 0 },
    })

    if (!res.ok) {
      const txt = await res.text()
      logger.error("Melhor Envio: erro upstream", { status: res.status, body: txt.slice(0, 200), cepMasked: maskCep(parsed.data.cep) })
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
          id: meta.id,
          label: meta.label,
          description: meta.description,
          price: parseFloat(s.price!),
          estimate: `${min} a ${max} dias úteis`,
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
