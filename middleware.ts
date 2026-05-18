import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const secureCookie = request.nextUrl.protocol === 'https:'
  const opts = { req: request, secret: process.env.NEXTAUTH_SECRET, secureCookie }

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

  // All other /admin/* routes require ADMIN or SUPER_ADMIN
  let token
  try {
    token = await getToken(opts)
  } catch {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  if (!token) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  const role = token.role as string | undefined
  if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
