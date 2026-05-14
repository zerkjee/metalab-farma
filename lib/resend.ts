export interface OrderEmailData {
  numero: string
  compradorNome: string
  compradorEmail: string
  total: number
  metodoPagamento: string
  itens: { nome: string; quantidade: number; precoUnit: number }[]
  pixQrCode?: string
}

function fmtCurrency(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v)
}

function buildOrderEmailHtml(data: OrderEmailData) {
  const isPix = data.metodoPagamento === "PIX"
  const itensHtml = data.itens
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;color:#374151;font-size:14px">${item.nome}</td>
        <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;color:#6b7280;font-size:14px;text-align:center">${item.quantidade}x</td>
        <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;color:#111827;font-size:14px;text-align:right;font-weight:600">${fmtCurrency(item.precoUnit * item.quantidade)}</td>
      </tr>`,
    )
    .join("")

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f9fafb;margin:0;padding:24px">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 8px rgba(0,0,0,0.08)">
    <div style="background:linear-gradient(135deg,#6b21a8,#7c3aed);padding:32px 32px 24px">
      <p style="color:#e9d5ff;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 8px">Metalab Store</p>
      <h1 style="color:#fff;font-size:22px;font-weight:900;margin:0">Pedido recebido! ✦</h1>
      <p style="color:#ddd6fe;font-size:13px;margin:8px 0 0">Olá, ${data.compradorNome}. Confirmamos seu pedido.</p>
    </div>
    <div style="padding:28px 32px">
      <div style="background:#f5f3ff;border-radius:12px;padding:16px 20px;margin-bottom:24px">
        <p style="color:#7c3aed;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 4px">Número do pedido</p>
        <p style="color:#111827;font-size:20px;font-weight:900;margin:0">${data.numero}</p>
      </div>
      <h2 style="color:#111827;font-size:14px;font-weight:700;margin:0 0 12px">Itens do pedido</h2>
      <table style="width:100%;border-collapse:collapse">
        ${itensHtml}
        <tr>
          <td colspan="2" style="padding:14px 0 0;color:#374151;font-size:14px;font-weight:700">Total</td>
          <td style="padding:14px 0 0;text-align:right;color:#7c3aed;font-size:18px;font-weight:900">${fmtCurrency(data.total)}</td>
        </tr>
      </table>
      ${isPix && data.pixQrCode ? `
      <div style="margin-top:24px;padding:20px;border:2px dashed #7c3aed;border-radius:12px;text-align:center">
        <p style="color:#374151;font-size:13px;font-weight:700;margin:0 0 8px">Pagar com PIX</p>
        <p style="color:#6b7280;font-size:12px;margin:0 0 12px">Copie o código abaixo e pague pelo app do seu banco</p>
        <div style="background:#f5f3ff;border-radius:8px;padding:12px;word-break:break-all">
          <p style="color:#7c3aed;font-size:11px;font-family:monospace;margin:0">${data.pixQrCode}</p>
        </div>
        <p style="color:#9ca3af;font-size:11px;margin:12px 0 0">⚡ PIX expira em 30 minutos</p>
      </div>
      ` : `
      <div style="margin-top:20px;padding:16px;background:#f0fdf4;border-radius:10px">
        <p style="color:#166534;font-size:13px;font-weight:600;margin:0">✓ Pagamento registrado — ${data.metodoPagamento}</p>
      </div>
      `}
      <div style="margin-top:28px;padding-top:20px;border-top:1px solid #f0f0f0;text-align:center">
        <p style="color:#6b7280;font-size:12px;margin:0">Dúvidas? <a href="mailto:contato@metalab.com.br" style="color:#7c3aed">contato@metalab.com.br</a></p>
        <p style="color:#9ca3af;font-size:11px;margin:8px 0 0">© Metalab Store • Suplementos de qualidade</p>
      </div>
    </div>
  </div>
</body>
</html>`
}

export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  if (!process.env.RESEND_API_KEY) return

  try {
    const { Resend } = await import("resend")
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: "Metalab Store <pedidos@metalab.com.br>",
      to: data.compradorEmail,
      subject: `Pedido ${data.numero} recebido — Metalab Store`,
      html: buildOrderEmailHtml(data),
    })
  } catch (error) {
    console.error("[Resend] Erro ao enviar email de confirmação:", error)
  }
}
