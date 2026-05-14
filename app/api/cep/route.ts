import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const cep = new URL(request.url).searchParams.get("cep")?.replace(/\D/g, "")

  if (!cep || cep.length !== 8) {
    return NextResponse.json({ erro: "CEP inválido" }, { status: 400 })
  }

  try {
    const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
      next: { revalidate: 86400 }, // cache 24h — CEPs raramente mudam
    })

    const data = await res.json()

    if (data.erro) {
      return NextResponse.json({ erro: "CEP não encontrado" }, { status: 404 })
    }

    return NextResponse.json({
      cep: data.cep?.replace("-", ""),
      logradouro: data.logradouro,
      bairro: data.bairro,
      cidade: data.localidade,
      estado: data.uf,
    })
  } catch {
    return NextResponse.json({ erro: "Erro ao buscar CEP" }, { status: 500 })
  }
}
