import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  let res = NextResponse.next({ request: req })

  // Supabase 세션 쿠키 갱신
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value))
          res = NextResponse.next({ request: req })
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          )
        },
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  const isAdminEmail = user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL
  const hasAdminCookie = req.cookies.get('nyamkit_admin')?.value === process.env.ADMIN_SECRET
  const isAdmin = isAdminEmail || hasAdminCookie

  // /admin 경로 보호
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
  }

  // /api/snacks 변경 API 보호
  if (pathname.startsWith('/api/snacks') && req.method !== 'GET') {
    if (!isAdmin) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }
  }

  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
