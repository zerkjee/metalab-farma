import { NextRequest, NextResponse } from "next/server"
import { handlers } from "@/lib/auth"
import { loginRatelimit } from "@/lib/rateLimit"

export const GET = handlers.GET

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous"
  const { success } = await loginRatelimit.limit(ip)
  if (!success) {
    return NextResponse.json(
      { error: "Muitas tentativas de login. Aguarde 15 minutos." },
      { status: 429 }
    )
  }
  return handlers.POST(request)
}
