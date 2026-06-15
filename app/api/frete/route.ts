import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { freteRatelimit, getIp } from "@/lib/rateLimit"
import { cotarFrete } from "@/lib/frete"

const itemSchema = z.object({
  produtoId: z.string().min(1),
  quantidade: z.number().int().positive(),
})

const bodySchema = z.object({
  cep:   z.string().regex(/^\d{8}$/, "CEP deve ter 8 dígitos"),
  itens: z.array(itemSchema).min(1).max(50),
})

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

  const resultado = await cotarFrete(parsed.data)
  if (!resultado.ok) {
    return NextResponse.json({ erro: resultado.erro }, { status: resultado.status })
  }

  return NextResponse.json(resultado.opcoes)
}
