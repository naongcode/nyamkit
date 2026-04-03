import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { password } = await req.json()

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: '비밀번호가 틀렸어요.' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set('nyamkit_admin', process.env.ADMIN_SECRET!, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7일
    sameSite: 'lax',
  })
  return res
}
