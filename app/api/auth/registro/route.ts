import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { registroSchema } from "@/lib/validations"
import { z } from "zod"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = registroSchema.parse(body)

    // Verificar se email já existe
    const existe = await prisma.usuario.findUnique({
      where: { email: data.email },
    })

    if (existe) {
      return NextResponse.json({ erro: "Email já cadastrado" }, { status: 409 })
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
    console.error("[POST /api/auth/registro]", error)
    return NextResponse.json({ erro: "Erro interno" }, { status: 500 })
  }
}
