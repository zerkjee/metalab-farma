import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { sendOrderConfirmationEmail } from "@/lib/resend"
import { enderecoSchema } from "@/lib/validations"

const pedidoSchema = z.object({
  itens: z.array(z.object({
    produtoId: z.string().optional(),
    slug: z.string().optional(),
    quantidade: z.number().int().min(1).max(99),
  })).min(1).max(50),
  cliente: z.object({
    nome: z.string().min(2).max(80),
    email: z.string().email(),
    cpf: z.string().regex(/^\d{11}$/, "CPF inválido"),
    telefone: z.string().optional(),
  }),
  endereco: enderecoSchema,
  frete: z.object({ preco: z.number().min(0) }).optional(),
  cupomCodigo: z.string().regex(/^[A-Za-z0-9_-]{3,20}$/).optional(),
  cupomFreteCodigo: z.string().regex(/^[A-Za-z0-9_-]{3,20}$/).optional(),
  metodoPagamento: z.enum(["PIX", "CARTAO_CREDITO", "CARTAO_DEBITO", "BOLETO"]).default("PIX"),
})

type PedidoInput = z.infer<typeof pedidoSchema>

function gerarNumeroPedido() {
  const now = new Date()
  const ano = now.getFullYear()
  const seq = String(Date.now()).slice(-5)
  return `MTL-${ano}-${seq}`
}

// POST /api/pedidos — criar pedido
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    const body = await request.json()

    const parsed = pedidoSchema.safeParse(body)
    if (!parsed.success) {
      console.error("[POST /api/pedidos] Zod issues:", JSON.stringify(parsed.error.issues))
      return NextResponse.json({ erro: "Dados inválidos", detalhes: parsed.error.issues }, { status: 400 })
    }

    const { itens, cliente, endereco, frete, cupomCodigo, cupomFreteCodigo, metodoPagamento }: PedidoInput = parsed.data

    // Buscar produtos por id ou slug
    const ids = itens.map((i) => i.produtoId).filter(Boolean) as string[]
    const slugs = itens.map((i) => i.slug).filter(Boolean) as string[]
    const produtos = await prisma.produto.findMany({
      where: {
        ativo: true,
        OR: [
          ...(ids.length ? [{ id: { in: ids } }] : []),
          ...(slugs.length ? [{ slug: { in: slugs } }] : []),
        ],
      },
    })

    for (const item of itens) {
      const prod = produtos.find(
        (p) => p.id === item.produtoId || p.slug === item.slug
      )
      if (!prod) {
        return NextResponse.json(
          { erro: `Produto ${item.produtoId} não encontrado` },
          { status: 400 }
        )
      }
      if (prod.estoque < item.quantidade) {
        return NextResponse.json(
          { erro: `${prod.nome}: estoque insuficiente` },
          { status: 400 }
        )
      }
    }

    // Calcular subtotal
    const subtotal = itens.reduce((acc: number, item) => {
      const prod = produtos.find((p) => p.id === item.produtoId || p.slug === item.slug)!
      return acc + Number(prod.preco) * item.quantidade
    }, 0)

    // Validar cupons
    let descontoTotal = 0
    let freteGratis = false
    let cupomId: string | undefined

    if (cupomCodigo) {
      const cupom = await prisma.cupom.findUnique({ where: { codigo: cupomCodigo.toUpperCase() } })
      if (cupom && cupom.ativo) {
        cupomId = cupom.id
        if (cupom.tipo === "PERCENTUAL") {
          descontoTotal = (subtotal * Number(cupom.valor)) / 100
        } else if (cupom.tipo === "VALOR_FIXO") {
          descontoTotal = Math.min(Number(cupom.valor), subtotal)
        } else if (cupom.tipo === "FRETE_GRATIS") {
          freteGratis = true
        }
      }
    }

    if (cupomFreteCodigo && !freteGratis) {
      const cupomFrete = await prisma.cupom.findUnique({ where: { codigo: cupomFreteCodigo.toUpperCase() } })
      if (cupomFrete && cupomFrete.ativo && cupomFrete.tipo === "FRETE_GRATIS") {
        freteGratis = true
        if (!cupomId) cupomId = cupomFrete.id
      }
    }

    const valorFrete = freteGratis ? 0 : Number(frete?.preco ?? 0)
    const total = subtotal - descontoTotal + valorFrete

    // Criar pedido no banco
    const pedido = await prisma.pedido.create({
      data: {
        numero: gerarNumeroPedido(),
        status: "AGUARDANDO_PAGAMENTO",
        subtotal,
        desconto: descontoTotal,
        frete: valorFrete,
        total,
        metodoPagamento: (metodoPagamento ?? "PIX") as "PIX" | "CARTAO_CREDITO" | "CARTAO_DEBITO" | "BOLETO",
        compradorNome: cliente.nome,
        compradorEmail: cliente.email,
        compradorCpf: cliente.cpf.replace(/\D/g, ""),
        compradorTelefone: cliente.telefone,
        enderecoSnap: JSON.stringify(endereco),
        usuarioId: session?.user?.id ?? null,
        cupomId: cupomId ?? null,
        itens: {
          create: itens.map((item) => {
            const prod = produtos.find((p) => p.id === item.produtoId || p.slug === item.slug)!
            return {
              produtoId: prod.id,
              quantidade: item.quantidade,
              precoUnit: Number(prod.preco),
              subtotal: Number(prod.preco) * item.quantidade,
              produtoNome: prod.nome,
              produtoSku: prod.sku,
              produtoImagem: prod.imagemUrl,
            }
          }),
        },
      },
      include: { itens: true },
    })

    // Incrementar uso dos cupons
    const cupomIdsParaIncrementar = new Set<string>()
    if (cupomId) cupomIdsParaIncrementar.add(cupomId)
    if (cupomFreteCodigo && freteGratis) {
      const cf = await prisma.cupom.findUnique({ where: { codigo: cupomFreteCodigo.toUpperCase() }, select: { id: true } })
      if (cf) cupomIdsParaIncrementar.add(cf.id)
    }
    for (const id of cupomIdsParaIncrementar) {
      await prisma.cupom.update({ where: { id }, data: { usoAtual: { increment: 1 } } })
    }

    // Enviar email de confirmação (não bloqueia resposta)
    void sendOrderConfirmationEmail({
      numero: pedido.numero,
      compradorNome: pedido.compradorNome,
      compradorEmail: pedido.compradorEmail,
      total: Number(pedido.total),
      metodoPagamento: pedido.metodoPagamento ?? "PIX",
      itens: pedido.itens.map((item) => ({
        nome: item.produtoNome,
        quantidade: item.quantidade,
        precoUnit: Number(item.precoUnit),
      })),
    })

    return NextResponse.json(
      {
        pedidoId: pedido.id,
        pedidoNumero: pedido.numero,
        total: pedido.total,
        metodoPagamento: pedido.metodoPagamento,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("[POST /api/pedidos]", error)
    return NextResponse.json({ erro: "Erro ao criar pedido" }, { status: 500 })
  }
}

// GET /api/pedidos — listar pedidos do usuário logado ou todos (admin)
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 })
    }

    const isAdmin = session.user.role?.includes("ADMIN")

    const pedidos = await prisma.pedido.findMany({
      where: isAdmin ? {} : { usuarioId: session.user.id },
      include: {
        itens: { include: { produto: { select: { nome: true, imagemUrl: true } } } },
        cupom: { select: { codigo: true } },
      },
      orderBy: { criadoEm: "desc" },
      ...(isAdmin ? {} : { take: 20 }),
    })

    return NextResponse.json(pedidos)
  } catch (error) {
    return NextResponse.json({ erro: "Erro interno" }, { status: 500 })
  }
}
