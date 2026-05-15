import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const pathname = req.nextUrl.pathname
  const isLoginPage = pathname === "/admin/login"

  if (!isLoginPage) {
    const role = (req.auth?.user as { role?: string } | undefined)?.role
    if (!role || !["ADMIN", "SUPER_ADMIN"].includes(role)) {
      const loginUrl = new URL("/admin/login", req.url)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }
  }
})

export const config = {
  // Protege /admin/* exceto /admin/login e assets estáticos
  matcher: ["/admin/((?!login$|_next).*)"],
}
