import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { pedidoId } = await request.json()

    const pedido = await prisma.pedido.findUnique({
      where: { id: pedidoId },
      include: { itens: true },
    })

    if (!pedido) {
      return NextResponse.json({ erro: "Pedido não encontrado" }, { status: 404 })
    }

    if (pedido.pago) {
      return NextResponse.json({ erro: "Pedido já pago" }, { status: 400 })
    }

    // Importar SDK do Mercado Pago dinamicamente
    const { MercadoPagoConfig, Payment } = await import("mercadopago")

    const client = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
    })

    const payment = new Payment(client)

    if (pedido.metodoPagamento === "PIX") {
      const result = await payment.create({
        body: {
          transaction_amount: Number(pedido.total),
          payment_method_id: "pix",
          payer: {
            email: pedido.compradorEmail,
            first_name: pedido.compradorNome.split(" ")[0],
            last_name: pedido.compradorNome.split(" ").slice(1).join(" ") || ".",
            identification: {
              type: "CPF",
              number: pedido.compradorCpf,
            },
          },
          external_reference: pedido.id,
          notification_url: `${process.env.NEXT_PUBLIC_URL}/api/pagamento/webhook`,
          description: `Pedido ${pedido.numero} - Metalab`,
          date_of_expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30min
        },
      })

      // Salvar dados do PIX no pedido
      await prisma.pedido.update({
        where: { id: pedido.id },
        data: {
          pagamentoId: String(result.id),
          pixQrCode: result.point_of_interaction?.transaction_data?.qr_code,
          pixQrCodeBase64: result.point_of_interaction?.transaction_data?.qr_code_base64,
        },
      })

      return NextResponse.json({
        tipo: "PIX",
        pagamentoId: result.id,
        qrCode: result.point_of_interaction?.transaction_data?.qr_code,
        qrCodeBase64: result.point_of_interaction?.transaction_data?.qr_code_base64,
        expiracao: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      })
    }

    return NextResponse.json({ erro: "Método de pagamento não suportado" }, { status: 400 })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error("[POST /api/pagamento/criar]", msg)
    return NextResponse.json({ erro: "Erro ao criar pagamento" }, { status: 500 })
  }
}
