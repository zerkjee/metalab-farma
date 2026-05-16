import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

// GET /api/user/perfil — dados do usuário logado + endereço principal
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ erro: "Não autenticado" }, { status: 401 })
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        nome: true,
        email: true,
        cpf: true,
        telefone: true,
        enderecos: {
          where: { principal: true },
          take: 1,
        },
      },
    })

    if (!usuario) {
      return NextResponse.json({ erro: "Usuário não encontrado" }, { status: 404 })
    }

    return NextResponse.json({
      nome: usuario.nome,
      email: usuario.email,
      cpf: usuario.cpf ?? null,
      telefone: usuario.telefone ?? null,
      enderecoPrincipal: usuario.enderecos[0] ?? null,
    })
  } catch (error) {
    console.error("[GET /api/user/perfil]", error)
    return NextResponse.json({ erro: "Erro interno" }, { status: 500 })
  }
}
