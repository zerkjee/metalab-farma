import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendOrderConfirmationEmail } from "@/lib/resend"
import { logger } from "@/lib/logger"
import crypto from "crypto"

function verifyMPSignature(
  req: NextRequest,
  paymentId: string
): { valid: boolean; reason?: string } {
  const secret = process.env.MP_WEBHOOK_SECRET
  if (!secret) {
    logger.warn("MP_WEBHOOK_SECRET não configurado — verificação pulada", { route: "webhook" })
    return { valid: true }
  }

  const xSignature = req.headers.get("x-signature")
  const xRequestId = req.headers.get("x-request-id")

  if (!xSignature || !xRequestId) {
    return { valid: false, reason: "Headers x-signature/x-request-id ausentes" }
  }

  const parts = Object.fromEntries(
    xSignature.split(",").flatMap((part) => {
      const [k, v] = part.trim().split("=")
      return k && v ? [[k, v]] : []
    })
  )
  const { ts, v1 } = parts
  if (!ts || !v1) {
    return { valid: false, reason: "Formato inválido de x-signature" }
  }

  // Rejeitar timestamps com mais de 5 minutos (anti-replay)
  if (Math.abs(Date.now() / 1000 - Number(ts)) > 300) {
    return { valid: false, reason: "Request expirado (possível replay attack)" }
  }

  const manifest = `id:${paymentId};request-id:${xRequestId};ts:${ts};`
  const expected = crypto.createHmac("sha256", secret).update(manifest).digest("hex")

  try {
    const valid = crypto.timingSafeEqual(Buffer.from(v1, "hex"), Buffer.from(expected, "hex"))
    return { valid }
  } catch {
    return { valid: false, reason: "Assinatura malformada" }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // MP envia notificações de vários tipos — só interessa "payment"
    if (body.type !== "payment") {
      return NextResponse.json({ ok: true })
    }

    const paymentId = String(body?.data?.id ?? "")
    if (!paymentId) {
      return NextResponse.json({ erro: "ID de pagamento ausente" }, { status: 400 })
    }

    const { valid, reason } = verifyMPSignature(request, paymentId)
    if (!valid) {
      logger.warn("Assinatura inválida no webhook MP", { route: "webhook", paymentId, reason })
      return NextResponse.json({ erro: "Assinatura inválida" }, { status: 401 })
    }

    const { MercadoPagoConfig, Payment } = await import("mercadopago")
    const client = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
    })

    const paymentApi = new Payment(client)
    const pagamento = await paymentApi.get({ id: paymentId })

    if (pagamento.status === "approved") {
      const pedido = await prisma.pedido.findFirst({
        where: { pagamentoId: String(pagamento.id) },
        include: { itens: true },
      })

      if (!pedido || pedido.pago) {
        return NextResponse.json({ ok: true })
      }

      await prisma.$transaction([
        prisma.pedido.update({
          where: { id: pedido.id },
          data: {
            pago: true,
            pagoEm: new Date(),
            status: "PAGAMENTO_APROVADO",
          },
        }),
        ...pedido.itens.map((item: { produtoId: string; quantidade: number }) =>
          prisma.produto.update({
            where: { id: item.produtoId },
            data: { estoque: { decrement: item.quantidade } },
          })
        ),
      ])

      logger.info("Pedido pago com sucesso", { route: "webhook", pedidoNumero: pedido.numero, paymentId })
      void sendOrderConfirmationEmail({
        numero: pedido.numero,
        compradorNome: pedido.compradorNome,
        compradorEmail: pedido.compradorEmail,
        total: Number(pedido.total),
        metodoPagamento: "PIX",
        itens: pedido.itens.map((item: { produtoNome: string; quantidade: number; precoUnit: unknown }) => ({
          nome: item.produtoNome,
          quantidade: item.quantidade,
          precoUnit: Number(item.precoUnit),
        })),
      })
    }

    if (pagamento.status === "cancelled" || pagamento.status === "rejected") {
      await prisma.pedido.updateMany({
        where: { pagamentoId: String(pagamento.id), pago: false },
        data: { status: "CANCELADO" },
      })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    logger.error("Erro no handler do webhook MP", error)
    return NextResponse.json({ ok: true })
  }
}
