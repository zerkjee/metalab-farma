import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { registroSchema } from "@/lib/validations"
import { registroRatelimit } from "@/lib/rateLimit"
import { logger } from "@/lib/logger"
import { maskEmail } from "@/lib/mask"
import { z } from "zod"
import { Prisma } from "@prisma/client"

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous"
    const { success } = await registroRatelimit.limit(ip)
    if (!success) {
      return NextResponse.json({ erro: "Muitas tentativas. Tente novamente em 1 hora." }, { status: 429 })
    }

    const body = await request.json().catch(() => null)
    const raw = registroSchema.parse(body)
    const data = { ...raw, email: raw.email.toLowerCase().trim() }

    const existe = await prisma.usuario.findFirst({
      where: { OR: [{ email: data.email }, { cpf: data.cpf }] },
      select: { email: true, cpf: true },
    })

    if (existe?.email === data.email) {
      return NextResponse.json({ erro: "Email já cadastrado" }, { status: 409 })
    }
    if (existe?.cpf === data.cpf) {
      return NextResponse.json({ erro: "CPF já cadastrado" }, { status: 409 })
    }

    const senhaHash = await bcrypt.hash(data.senha, 12)

    const usuario = await prisma.usuario.create({
      data: {
        nome: data.nome,
        email: data.email,
        senha: senhaHash,
        cpf: data.cpf,
        telefone: data.telefone,
        papel: "CLIENTE",
        enderecos: {
          create: {
            cep: data.endereco.cep,
            logradouro: data.endereco.logradouro,
            numero: data.endereco.numero,
            complemento: data.endereco.complemento,
            bairro: data.endereco.bairro,
            cidade: data.endereco.cidade,
            estado: data.endereco.estado,
            principal: true,
          },
        },
      },
      select: { id: true, email: true, nome: true },
    })

    logger.info("Novo usuário cadastrado", { userId: usuario.id, emailMasked: maskEmail(usuario.email) })
    return NextResponse.json(usuario, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ erro: "Dados inválidos", detalhes: error.issues }, { status: 400 })
    }
    // Race condition: two requests with same email/CPF at the exact same time
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const field = (error.meta?.target as string[] | undefined)?.[0]
      const msg = field === "cpf" ? "CPF já cadastrado" : field === "email" ? "Email já cadastrado" : "Dados já cadastrados"
      return NextResponse.json({ erro: msg }, { status: 409 })
    }
    logger.error("Erro no registro de usuário", error)
    return NextResponse.json({ erro: "Erro interno" }, { status: 500 })
  }
}
