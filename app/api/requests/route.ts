import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase-server'
import { supabase } from '@/lib/supabase'

// 사용자: 요청 제출
export async function POST(req: NextRequest) {
  const supabaseServer = await createSupabaseServer()
  const { data: { user } } = await supabaseServer.auth.getUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })

  const { product_name, memo } = await req.json()
  if (!product_name?.trim()) return NextResponse.json({ error: '상품명을 입력해주세요.' }, { status: 400 })

  const { data, error } = await supabaseServer
    .from('snack_requests')
    .insert({ user_id: user.id, product_name: product_name.trim(), memo: memo?.trim() || null })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// 어드민: 전체 요청 조회
export async function GET(req: NextRequest) {
  const supabaseServer = await createSupabaseServer()
  const { data: { user } } = await supabaseServer.auth.getUser()
  const hasAdminCookie = req.cookies.get('nyamkit_admin')?.value === process.env.ADMIN_SECRET
  const isAdmin = hasAdminCookie || user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL
  if (!isAdmin) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
  }

  const { data } = await supabase
    .from('snack_requests')
    .select('*')
    .order('created_at', { ascending: false })

  return NextResponse.json(data ?? [])
}
