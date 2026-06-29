import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Only accessible by SUPER_ADMIN — never exposes secrets
export async function GET() {
  const session = await auth().catch(() => null)

  if (session?.user?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 })
  }

  // Check DB connectivity without exposing credentials
  let dbOk = false
  let adminCount = 0
  try {
    const result = await prisma.usuario.count({
      where: { papel: { in: ["ADMIN", "SUPER_ADMIN"] }, ativo: true },
    })
    dbOk = true
    adminCount = result
  } catch {
    dbOk = false
  }

  const nextauthUrl = process.env.NEXTAUTH_URL ?? ""
  const nextPublicUrl = process.env.NEXT_PUBLIC_URL ?? ""
  const hasSecret = !!(process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET)
  const vercelUrl = process.env.VERCEL_URL ?? ""

  return NextResponse.json({
    auth: {
      sessionExists: !!session,
      userId: session?.user?.id ?? null,
      email: session?.user?.email
        ? session.user.email.replace(/(?<=.{3}).(?=.*@)/g, "*")
        : null,
      role: session?.user?.role ?? null,
    },
    env: {
      NODE_ENV: process.env.NODE_ENV,
      NEXTAUTH_URL: nextauthUrl || "(vazio)",
      NEXTAUTH_URL_ok: nextauthUrl.startsWith("https://"),
      NEXT_PUBLIC_URL: nextPublicUrl || "(vazio)",
      VERCEL_URL: vercelUrl ? `${vercelUrl.substring(0, 20)}...` : "(não definido)",
      NEXTAUTH_SECRET_set: hasSecret,
    },
    db: {
      connected: dbOk,
      adminCount,
    },
    timestamp: new Date().toISOString(),
  })
}
