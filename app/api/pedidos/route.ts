import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import crypto from "crypto"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { enqueueOrderEmail } from "@/lib/qstash"
import { logger } from "@/lib/logger"
import { enderecoSchema } from "@/lib/validations"
import { pedidoRatelimit, getIp } from "@/lib/rateLimit"
import type { Cupom } from "@prisma/client"

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
  const ano = new Date().getFullYear()
  // 6 chars de random base36 (~2 bilhões de combinações) — colisão desprezível
  const seq = crypto.randomBytes(4).readUInt32BE(0).toString(36).toUpperCase().slice(0, 6).padEnd(6, '0')
  return `MTL-${ano}-${seq}`
}

function cupomValido(cupom: Cupom | null): cupom is Cupom {
  if (!cupom || !cupom.ativo) return false
  if (cupom.validade && new Date(cupom.validade) < new Date()) return false
  if (cupom.usoMaximo !== null && cupom.usoAtual >= cupom.usoMaximo) return false
  return true
}

// POST /api/pedidos — criar pedido
export async function POST(request: NextRequest) {
  try {
    const { success } = await pedidoRatelimit.limit(getIp(request))
    if (!success) {
      return NextResponse.json({ erro: "Muitas tentativas. Aguarde alguns minutos." }, { status: 429 })
    }

    const session = await auth()
    const body = await request.json().catch(() => null)

    const parsed = pedidoSchema.safeParse(body)
    if (!parsed.success) {
      logger.warn("Dados inválidos ao criar pedido", { route: "POST /api/pedidos", issues: parsed.error.issues })
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

    // Resolver cupons com revalidação completa (ativo, validade, usoMaximo)
    let descontoTotal = 0
    let freteGratis = false
    const cupomIds = new Set<string>()

    if (cupomCodigo) {
      const cupom = await prisma.cupom.findUnique({ where: { codigo: cupomCodigo.toUpperCase() } })
      if (!cupomValido(cupom)) {
        return NextResponse.json({ erro: "Cupom inválido ou expirado" }, { status: 400 })
      }
      cupomIds.add(cupom.id)
      if (cupom.tipo === "PERCENTUAL") {
        descontoTotal = (subtotal * Number(cupom.valor)) / 100
      } else if (cupom.tipo === "VALOR_FIXO") {
        descontoTotal = Math.min(Number(cupom.valor), subtotal)
      } else if (cupom.tipo === "FRETE_GRATIS") {
        freteGratis = true
      }
    }

    if (cupomFreteCodigo) {
      const cupomFrete = await prisma.cupom.findUnique({ where: { codigo: cupomFreteCodigo.toUpperCase() } })
      if (!cupomValido(cupomFrete) || cupomFrete.tipo !== "FRETE_GRATIS") {
        return NextResponse.json({ erro: "Cupom de frete inválido ou expirado" }, { status: 400 })
      }
      freteGratis = true
      cupomIds.add(cupomFrete.id)
    }

    const valorFrete = freteGratis ? 0 : Number(frete?.preco ?? 0)
    const total = subtotal - descontoTotal + valorFrete

    // Transação atômica: criar pedido + decrementar estoque (com guard) + incrementar uso de cupons
    // Retry até 3x em colisão de numero (P2002 em Pedido.numero @unique)
    const cupomIdPrincipal = cupomIds.values().next().value
    let pedido: Awaited<ReturnType<typeof prisma.pedido.create>> & { itens: { produtoNome: string; quantidade: number; precoUnit: unknown }[] }
    let tentativa = 0
    while (true) {
      tentativa++
      try {
        pedido = await prisma.$transaction(async (tx) => {
          // Decrementa estoque com guard atômico (rejeita se faltar)
          for (const item of itens) {
            const prod = produtos.find((p) => p.id === item.produtoId || p.slug === item.slug)!
            const result = await tx.produto.updateMany({
              where: { id: prod.id, estoque: { gte: item.quantidade } },
              data: { estoque: { decrement: item.quantidade } },
            })
            if (result.count === 0) {
              throw new Error(`OUT_OF_STOCK:${prod.nome}`)
            }
          }

          // Incrementa uso dos cupons (revalida usoMaximo aqui dentro da transação)
          for (const id of cupomIds) {
            const cupom = await tx.cupom.findUnique({ where: { id } })
            if (!cupomValido(cupom)) {
              throw new Error("COUPON_INVALID")
            }
            await tx.cupom.update({ where: { id }, data: { usoAtual: { increment: 1 } } })
          }

          // Cria pedido
          return tx.pedido.create({
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
              cupomId: cupomIdPrincipal ?? null,
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
        })
        break
      } catch (e) {
        const msg = e instanceof Error ? e.message : ''
        if (msg.startsWith('OUT_OF_STOCK:')) {
          return NextResponse.json({ erro: `${msg.slice('OUT_OF_STOCK:'.length)}: estoque insuficiente` }, { status: 400 })
        }
        if (msg === 'COUPON_INVALID') {
          return NextResponse.json({ erro: "Cupom esgotou enquanto processava o pedido" }, { status: 400 })
        }
        // P2002 = unique constraint violation (provavelmente no numero) → retry
        const isUniqueViolation = (e as { code?: string })?.code === 'P2002'
        if (isUniqueViolation && tentativa < 3) {
          logger.warn("Colisão de numero pedido — retry", { tentativa })
          continue
        }
        throw e
      }
    }

    // Marcar CartSession como convertido (fire-and-forget)
    void prisma.cartSession.updateMany({
      where: { email: cliente.email, convertido: false },
      data: { convertido: true },
    })

    void enqueueOrderEmail({
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

    logger.info("Pedido criado", { route: "POST /api/pedidos", pedidoNumero: pedido.numero, total: Number(pedido.total) })

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
    logger.error("Erro ao criar pedido", error)
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
    logger.error("Erro listando pedidos", error)
    return NextResponse.json({ erro: "Erro interno" }, { status: 500 })
  }
}
