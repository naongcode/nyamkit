import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // /admin 경로 보호 (로그인 페이지 제외)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const session = req.cookies.get('nyamkit_admin')?.value
    if (session !== process.env.ADMIN_SECRET) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
  }

  // /api/snacks 변경 API 보호 (POST·PUT·DELETE)
  if (pathname.startsWith('/api/snacks') && req.method !== 'GET') {
    const session = req.cookies.get('nyamkit_admin')?.value
    if (session !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/snacks/:path*'],
}
