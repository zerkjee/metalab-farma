import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default auth((req) => {
  const { nextUrl, auth: session } = req as any
  const isLoggedIn = !!session?.user
  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN"

  // Rotas do admin — exige autenticação de admin
  if (nextUrl.pathname.startsWith("/admin")) {
    // Página de login do admin pode acessar sem autenticar
    if (nextUrl.pathname === "/admin/login") {
      // Se já está logado como admin, redireciona para dashboard
      if (isLoggedIn && isAdmin) {
        return NextResponse.redirect(new URL("/admin", nextUrl))
      }
      return NextResponse.next()
    }

    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/admin/login", nextUrl))
    }

    if (!isAdmin) {
      return NextResponse.redirect(new URL("/", nextUrl))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
  ],
}
