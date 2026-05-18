import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const secureCookie = request.nextUrl.protocol === 'https:'

  // /admin/login: redirect logged-in admins to dashboard, allow others through
  if (pathname === '/admin/login') {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET, secureCookie })
    const isAdmin = token?.role === 'ADMIN' || token?.role === 'SUPER_ADMIN'
    if (token && isAdmin) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    return NextResponse.next()
  }

  // All other /admin/* routes require ADMIN or SUPER_ADMIN
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET, secureCookie })

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
