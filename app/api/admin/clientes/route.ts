import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.role?.includes("ADMIN")) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const busca = searchParams.get("busca") ?? ""
    const pagina = Math.max(1, parseInt(searchParams.get("pagina") ?? "1"))
    const porPagina = parseInt(searchParams.get("por_pagina") ?? "20")

    const where = busca
      ? {
          papel: "CLIENTE" as const,
          OR: [
            { nome: { contains: busca, mode: "insensitive" as const } },
            { email: { contains: busca, mode: "insensitive" as const } },
          ],
        }
      : { papel: "CLIENTE" as const }

    const [total, clientes] = await Promise.all([
      prisma.usuario.count({ where }),
      prisma.usuario.findMany({
        where,
        orderBy: { criadoEm: "desc" },
        skip: (pagina - 1) * porPagina,
        take: porPagina,
        select: {
          id: true,
          nome: true,
          email: true,
          telefone: true,
          cpf: true,
          ativo: true,
          criadoEm: true,
          _count: { select: { pedidos: true } },
        },
      }),
    ])

    return NextResponse.json({
      clientes,
      total,
      pagina,
      totalPaginas: Math.ceil(total / porPagina),
    })
  } catch (error) {
    console.error("[GET /api/admin/clientes]", error)
    return NextResponse.json({ erro: "Erro interno" }, { status: 500 })
  }
}
