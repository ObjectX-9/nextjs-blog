import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
  const isLoginPage = request.nextUrl.pathname === '/login'
  const token = request.cookies.get('admin_token')?.value

  // If trying to access admin routes without token, redirect to login
  if (isAdminRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If already logged in and trying to access login page, redirect to admin
  if (isLoginPage && token) {
    return NextResponse.redirect(new URL('/admin/bookmarks', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/login']
}
