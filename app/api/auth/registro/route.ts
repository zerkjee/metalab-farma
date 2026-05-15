import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { registroSchema } from "@/lib/validations"
import { z } from "zod"
import { Prisma } from "@prisma/client"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = registroSchema.parse(body)

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
      },
      select: { id: true, email: true, nome: true },
    })

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
    console.error("[POST /api/auth/registro]", error)
    return NextResponse.json({ erro: "Erro interno" }, { status: 500 })
  }
}
