import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendOrderConfirmationEmail } from "@/lib/resend"

// O Mercado Pago chama esta URL quando o status do pagamento muda
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // MP envia notificações de vários tipos — só interessa "payment"
    if (body.type !== "payment") {
      return NextResponse.json({ ok: true })
    }

    const { MercadoPagoConfig, Payment } = await import("mercadopago")
    const client = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
    })

    const paymentApi = new Payment(client)
    const pagamento = await paymentApi.get({ id: body.data.id })

    if (pagamento.status === "approved") {
      const pedido = await prisma.pedido.findFirst({
        where: { pagamentoId: String(pagamento.id) },
        include: { itens: true },
      })

      if (!pedido || pedido.pago) {
        return NextResponse.json({ ok: true })
      }

      // Marcar como pago e baixar estoque numa transação atômica
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

      console.log(`[WEBHOOK] Pedido ${pedido.numero} pago com sucesso`)
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
    console.error("[WEBHOOK /api/pagamento/webhook]", error)
    // Sempre retorna 200 para o MP não retentar infinitamente
    return NextResponse.json({ ok: true })
  }
}
