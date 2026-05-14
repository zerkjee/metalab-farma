import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

interface ItemPedidoInput {
  produtoId?: string
  slug?: string
  quantidade: number
}

interface ClienteInput {
  nome: string
  email: string
  cpf: string
  telefone?: string
}

interface EnderecoInput {
  cep: string
  logradouro: string
  numero: string
  complemento?: string
  bairro: string
  cidade: string
  estado: string
}

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

    const {
      itens,
      cliente,
      endereco,
      frete,
      cupomCodigo,
      metodoPagamento,
    }: {
      itens: ItemPedidoInput[]
      cliente: ClienteInput
      endereco: EnderecoInput
      frete?: { preco: number }
      cupomCodigo?: string
      metodoPagamento?: string
    } = body

    if (!itens?.length) {
      return NextResponse.json({ erro: "Carrinho vazio" }, { status: 400 })
    }

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

    // Validar cupom se informado
    let descontoTotal = 0
    let freteGratis = false
    let cupomId: string | undefined

    if (cupomCodigo) {
      const cupom = await prisma.cupom.findUnique({
        where: { codigo: cupomCodigo.toUpperCase() },
      })

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

    // Incrementar uso do cupom
    if (cupomId) {
      await prisma.cupom.update({
        where: { id: cupomId },
        data: { usoAtual: { increment: 1 } },
      })
    }

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
      },
      orderBy: { criadoEm: "desc" },
      take: isAdmin ? 100 : 20,
    })

    return NextResponse.json(pedidos)
  } catch (error) {
    return NextResponse.json({ erro: "Erro interno" }, { status: 500 })
  }
}
