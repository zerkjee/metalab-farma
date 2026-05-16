import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/cupons/disponiveis — lista cupons válidos para exibição no checkout
// Público: só retorna campos seguros (sem contadores internos)
export async function GET() {
  try {
    const now = new Date()

    const cupons = await prisma.cupom.findMany({
      where: {
        ativo: true,
        OR: [{ validade: null }, { validade: { gt: now } }],
      },
      select: {
        codigo: true,
        tipo: true,
        valor: true,
        usoMaximo: true,
        usoAtual: true,
      },
      orderBy: { codigo: "asc" },
    })

    // Filtra esgotados e formata para o cliente
    const disponiveis = cupons
      .filter((c) => c.usoMaximo === null || c.usoAtual < c.usoMaximo)
      .map((c) => ({
        codigo: c.codigo,
        tipo: c.tipo,
        valor: Number(c.valor),
      }))

    return NextResponse.json(disponiveis)
  } catch (error) {
    console.error("[GET /api/cupons/disponiveis]", error)
    return NextResponse.json({ erro: "Erro interno" }, { status: 500 })
  }
}
