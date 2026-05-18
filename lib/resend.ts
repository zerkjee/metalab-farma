export interface OrderEmailData {
  numero: string
  compradorNome: string
  compradorEmail: string
  total: number
  metodoPagamento: string
  itens: { nome: string; quantidade: number; precoUnit: number }[]
  pixQrCode?: string
}

const _fmt = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })
function fmtCurrency(v: number) { return _fmt.format(v) }

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

// ─── PIX EXPIRADO ────────────────────────────────────────────────────────────

export interface PixExpiryData {
  numero: string
  compradorNome: string
  compradorEmail: string
  total: number
  pedidoId: string
}

export async function sendPixExpiryEmail(data: PixExpiryData) {
  if (!process.env.RESEND_API_KEY) return
  const BASE = process.env.NEXT_PUBLIC_URL ?? 'https://metalab-farma.vercel.app'
  const from = process.env.EMAIL_FROM ?? 'Metalab Store <onboarding@resend.dev>'

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"></head>
<body style="font-family:-apple-system,sans-serif;background:#f9fafb;margin:0;padding:24px">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 8px rgba(0,0,0,0.08)">
    <div style="background:linear-gradient(135deg,#6b21a8,#7c3aed);padding:28px 32px">
      <p style="color:#e9d5ff;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 6px">Metalab Store</p>
      <h1 style="color:#fff;font-size:20px;font-weight:900;margin:0">Seu PIX expirou ⏱</h1>
    </div>
    <div style="padding:28px 32px">
      <p style="color:#374151;font-size:14px;margin:0 0 16px">Olá, ${data.compradorNome.split(' ')[0]}! Seu pedido <strong>${data.numero}</strong> (${fmtCurrency(data.total)}) ainda está reservado, mas o código PIX expirou.</p>
      <p style="color:#374151;font-size:14px;margin:0 0 24px">Clique abaixo para gerar um novo código e finalizar sua compra:</p>
      <div style="text-align:center;margin:24px 0">
        <a href="${BASE}/pedidos" style="display:inline-block;background:linear-gradient(135deg,#6b21a8,#7c3aed);color:#fff;font-weight:900;font-size:14px;padding:14px 32px;border-radius:12px;text-decoration:none">Finalizar pagamento →</a>
      </div>
      <p style="color:#9ca3af;font-size:12px;text-align:center;margin:0">Seu carrinho continua salvo. Dúvidas? Fale conosco.</p>
    </div>
  </div>
</body>
</html>`

  try {
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from,
      to: data.compradorEmail,
      subject: `PIX expirado — Pedido ${data.numero} aguarda seu pagamento`,
      html,
    })
  } catch { /* falha silenciosa — não crítico */ }
}

// ─── CARRINHO ABANDONADO ──────────────────────────────────────────────────────

export interface AbandonedCartData {
  email: string
  nome?: string
  items: { nome: string; quantidade: number; precoUnit: number }[]
  total: number
  cupomCodigo?: string
  cupomDesconto?: string
}

export async function sendAbandonedCartEmail(data: AbandonedCartData) {
  if (!process.env.RESEND_API_KEY) return
  const BASE = process.env.NEXT_PUBLIC_URL ?? 'https://metalab-farma.vercel.app'
  const from = process.env.EMAIL_FROM ?? 'Metalab Store <onboarding@resend.dev>'
  const firstName = data.nome?.split(' ')[0] ?? 'Cliente'

  const itensHtml = data.items
    .map((i) => `<tr><td style="padding:6px 0;color:#374151;font-size:13px">${i.nome}</td><td style="padding:6px 0;color:#6b7280;font-size:13px;text-align:right">${i.quantidade}× ${fmtCurrency(i.precoUnit)}</td></tr>`)
    .join('')

  const cupomHtml = data.cupomCodigo
    ? `<div style="margin:20px 0;padding:16px;background:#f5f3ff;border-radius:12px;text-align:center">
         <p style="color:#7c3aed;font-weight:700;font-size:13px;margin:0 0 6px">Cupom especial para você:</p>
         <p style="color:#6b21a8;font-size:22px;font-weight:900;font-family:monospace;margin:0">${data.cupomCodigo}</p>
         <p style="color:#6b7280;font-size:12px;margin:6px 0 0">${data.cupomDesconto} de desconto • Válido por 48h</p>
       </div>`
    : ''

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"></head>
<body style="font-family:-apple-system,sans-serif;background:#f9fafb;margin:0;padding:24px">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 8px rgba(0,0,0,0.08)">
    <div style="background:linear-gradient(135deg,#6b21a8,#7c3aed);padding:28px 32px">
      <p style="color:#e9d5ff;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 6px">Metalab Store</p>
      <h1 style="color:#fff;font-size:20px;font-weight:900;margin:0">Esqueceu algo? 🛒</h1>
    </div>
    <div style="padding:28px 32px">
      <p style="color:#374151;font-size:14px;margin:0 0 16px">Olá, ${firstName}! Você deixou alguns itens no carrinho:</p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:16px">${itensHtml}</table>
      <p style="color:#374151;font-size:15px;font-weight:700;text-align:right;margin:0 0 20px">Total: ${fmtCurrency(data.total)}</p>
      ${cupomHtml}
      <div style="text-align:center;margin:20px 0">
        <a href="${BASE}" style="display:inline-block;background:linear-gradient(135deg,#6b21a8,#7c3aed);color:#fff;font-weight:900;font-size:14px;padding:14px 32px;border-radius:12px;text-decoration:none">Finalizar compra →</a>
      </div>
      <p style="color:#9ca3af;font-size:11px;text-align:center;margin:0">Suplementos alimentares. Este produto não é medicamento.</p>
    </div>
  </div>
</body>
</html>`

  try {
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from,
      to: data.email,
      subject: data.cupomCodigo
        ? `${firstName}, seu cupom especial expira em 48h — Metalab Store`
        : `${firstName}, seu carrinho ainda está aqui — Metalab Store`,
      html,
    })
  } catch { /* falha silenciosa */ }
}

// ─── CONFIRMAÇÃO DE PEDIDO ───────────────────────────────────────────────────

export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  const { logger } = await import("@/lib/logger")
  const { maskEmail } = await import("@/lib/mask")

  if (!process.env.RESEND_API_KEY) {
    logger.warn("RESEND_API_KEY não configurada — email não enviado", { pedidoNumero: data.numero })
    return
  }

  const from = process.env.EMAIL_FROM ?? "Metalab Store <onboarding@resend.dev>"

  try {
    const { Resend } = await import("resend")
    const resend = new Resend(process.env.RESEND_API_KEY)
    const result = await resend.emails.send({
      from,
      to: data.compradorEmail,
      subject: `Pedido ${data.numero} recebido — Metalab Store`,
      html: buildOrderEmailHtml(data),
    })
    const emailId = (result as { data?: { id?: string }; id?: string })?.data?.id ?? (result as { id?: string })?.id ?? "?"
    logger.info("Email de confirmação enviado", {
      pedidoNumero: data.numero,
      emailIdResend: emailId,
      destinatarioMasked: maskEmail(data.compradorEmail),
    })
  } catch (error) {
    logger.error("Falha enviando email de confirmação", error)
  }
}
