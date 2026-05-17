import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { enqueueOrderEmail } from "@/lib/qstash"
import { logger } from "@/lib/logger"
import crypto from "crypto"

type VerifyResult =
  | { valid: true }
  | { valid: false; reason: string; httpStatus: 401 | 503 }

function verifyMPSignature(req: NextRequest, paymentId: string): VerifyResult {
  const secret = process.env.MP_WEBHOOK_SECRET

  // Fail-closed: sem secret = não confiamos em nada
  if (!secret) {
    const isProd = process.env.NODE_ENV === "production"
    if (isProd) {
      logger.error("CRÍTICO: MP_WEBHOOK_SECRET ausente em produção — webhook rejeitado", {
        route: "webhook",
        paymentId,
      })
      return { valid: false, reason: "Webhook secret não configurado", httpStatus: 503 }
    }
    // Em dev/test, permitir explicitamente com flag para não bloquear desenvolvimento local
    if (process.env.MP_WEBHOOK_SKIP_VERIFY === "1") {
      logger.warn("DEV: assinatura webhook MP pulada via MP_WEBHOOK_SKIP_VERIFY=1", {
        route: "webhook",
        paymentId,
      })
      return { valid: true }
    }
    return { valid: false, reason: "Webhook secret não configurado (dev sem MP_WEBHOOK_SKIP_VERIFY)", httpStatus: 503 }
  }

  const xSignature = req.headers.get("x-signature")
  const xRequestId = req.headers.get("x-request-id")

  if (!xSignature || !xRequestId) {
    return { valid: false, reason: "Headers x-signature/x-request-id ausentes", httpStatus: 401 }
  }

  const parts = Object.fromEntries(
    xSignature.split(",").flatMap((part) => {
      const [k, v] = part.trim().split("=")
      return k && v ? [[k, v]] : []
    })
  )
  const { ts, v1 } = parts
  if (!ts || !v1) {
    return { valid: false, reason: "Formato inválido de x-signature", httpStatus: 401 }
  }

  // Rejeitar timestamps com mais de 5 minutos (anti-replay)
  const tsNum = Number(ts)
  if (!Number.isFinite(tsNum) || Math.abs(Date.now() / 1000 - tsNum) > 300) {
    return { valid: false, reason: "Request expirado ou ts inválido (possível replay attack)", httpStatus: 401 }
  }

  const manifest = `id:${paymentId};request-id:${xRequestId};ts:${ts};`
  const expectedHex = crypto.createHmac("sha256", secret).update(manifest).digest("hex")

  // Buffer length precisa bater antes do timingSafeEqual
  let receivedBuf: Buffer
  let expectedBuf: Buffer
  try {
    receivedBuf = Buffer.from(v1, "hex")
    expectedBuf = Buffer.from(expectedHex, "hex")
  } catch {
    return { valid: false, reason: "Assinatura não-hex", httpStatus: 401 }
  }
  if (receivedBuf.length !== expectedBuf.length || receivedBuf.length === 0) {
    return { valid: false, reason: "Tamanho de assinatura inválido", httpStatus: 401 }
  }

  const valid = crypto.timingSafeEqual(receivedBuf, expectedBuf)
  return valid ? { valid: true } : { valid: false, reason: "Assinatura HMAC não confere", httpStatus: 401 }
}

export async function POST(request: NextRequest) {
  let parsedBody: { type?: string; data?: { id?: unknown } }
  try {
    parsedBody = await request.json()
  } catch {
    logger.warn("Webhook MP: body inválido / não-JSON", { route: "webhook" })
    return NextResponse.json({ erro: "Body inválido" }, { status: 400 })
  }

  // MP envia notificações de vários tipos — só interessa "payment"
  if (parsedBody.type !== "payment") {
    return NextResponse.json({ ok: true })
  }

  const paymentId = String(parsedBody.data?.id ?? "")
  if (!paymentId) {
    return NextResponse.json({ erro: "ID de pagamento ausente" }, { status: 400 })
  }

  const verify = verifyMPSignature(request, paymentId)
  if (!verify.valid) {
    logger.warn("Webhook MP: verificação falhou", { route: "webhook", paymentId, reason: verify.reason })
    return NextResponse.json({ erro: verify.reason }, { status: verify.httpStatus })
  }

  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
  if (!accessToken) {
    logger.error("CRÍTICO: MERCADOPAGO_ACCESS_TOKEN ausente — webhook não pode validar pagamento", {
      route: "webhook",
      paymentId,
    })
    return NextResponse.json({ erro: "Serviço temporariamente indisponível" }, { status: 503 })
  }

  try {
    const { MercadoPagoConfig, Payment } = await import("mercadopago")
    const client = new MercadoPagoConfig({ accessToken })

    const paymentApi = new Payment(client)
    const pagamento = await paymentApi.get({ id: paymentId })

    if (pagamento.status === "approved") {
      // Idempotência atômica via updateMany com guard (pago=false)
      const updated = await prisma.pedido.updateMany({
        where: { pagamentoId: String(pagamento.id), pago: false },
        data: { pago: true, pagoEm: new Date(), status: "PAGAMENTO_APROVADO" },
      })

      // Se updated.count === 0, outro webhook já processou — nada a fazer
      if (updated.count === 0) {
        logger.info("Webhook ignorado (pedido já pago)", { route: "webhook", paymentId })
        return NextResponse.json({ ok: true })
      }

      const pedido = await prisma.pedido.findFirst({
        where: { pagamentoId: String(pagamento.id) },
        include: { itens: true },
      })

      if (pedido) {
        logger.info("Pedido pago com sucesso", { route: "webhook", pedidoNumero: pedido.numero, paymentId })
        void enqueueOrderEmail({
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
    }

    if (pagamento.status === "cancelled" || pagamento.status === "rejected") {
      // Restaurar estoque dos pedidos não-pagos que serão cancelados
      const pedidos = await prisma.pedido.findMany({
        where: { pagamentoId: String(pagamento.id), pago: false, status: { not: "CANCELADO" } },
        include: { itens: true },
      })

      for (const pedido of pedidos) {
        await prisma.$transaction([
          prisma.pedido.update({
            where: { id: pedido.id },
            data: { status: "CANCELADO" },
          }),
          ...pedido.itens.map((item) =>
            prisma.produto.update({
              where: { id: item.produtoId },
              data: { estoque: { increment: item.quantidade } },
            })
          ),
        ])
        logger.info("Pedido cancelado — estoque restaurado", { route: "webhook", pedidoNumero: pedido.numero, paymentId, status: pagamento.status })
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    // Retorna 500 para que MP retente conforme política de retry deles.
    // (Antes retornava 200, o que silenciava falhas reais.)
    logger.error("Erro no handler do webhook MP", { paymentId, error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json({ erro: "Erro interno" }, { status: 500 })
  }
}
