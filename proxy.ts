import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const secureCookie = request.nextUrl.protocol === 'https:'
  // NextAuth v5 renomeou o cookie de "next-auth.session-token" para "authjs.session-token"
  const cookieName = secureCookie ? '__Secure-authjs.session-token' : 'authjs.session-token'
  const opts = {
    req: request,
    secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
    secureCookie,
    cookieName,
  }

  // /admin/login: redirect logged-in admins to dashboard, allow others through
  if (pathname === '/admin/login') {
    try {
      const token = await getToken(opts)
      const isAdmin = token?.role === 'ADMIN' || token?.role === 'SUPER_ADMIN'
      if (token && isAdmin) {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
    } catch {
      // JWT decode error — treat as unauthenticated, show login page
    }
    return NextResponse.next()
  }

  // Rotas /api/admin/* já checam requireAdmin() individualmente (defesa primária).
  // Isto aqui é uma segunda camada: se alguma rota nova esquecer a checagem,
  // o middleware ainda barra antes de chegar no handler.
  const isApiRoute = pathname.startsWith('/api/admin')
  const deny = (status: 401 | 403, erro: string) =>
    isApiRoute
      ? NextResponse.json({ erro }, { status })
      : NextResponse.redirect(new URL(status === 401 ? '/admin/login' : '/', request.url))

  // All other /admin/* and /api/admin/* routes require ADMIN or SUPER_ADMIN
  let token
  try {
    token = await getToken(opts)
  } catch {
    return deny(401, 'Não autorizado')
  }

  if (!token) {
    return deny(401, 'Não autorizado')
  }

  const role = token.role as string | undefined
  if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
    return deny(403, 'Acesso negado')
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
