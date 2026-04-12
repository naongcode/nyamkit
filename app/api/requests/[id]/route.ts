import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createSupabaseServer } from '@/lib/supabase-server'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabaseServer = await createSupabaseServer()
  const { data: { user } } = await supabaseServer.auth.getUser()
  const hasAdminCookie = req.cookies.get('nyamkit_admin')?.value === process.env.ADMIN_SECRET
  const isAdmin = hasAdminCookie || user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL
  if (!isAdmin) return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })

  const { id } = await params
  const { status, snack_id } = await req.json()
  if (!['pending', 'done', 'rejected'].includes(status)) {
    return NextResponse.json({ error: '올바르지 않은 상태값입니다.' }, { status: 400 })
  }

  const { error } = await supabase.from('snack_requests').update({ status }).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // 완료 처리 + snack_id 있으면 요청자의 찜 목록에 자동 추가
  if (status === 'done' && snack_id) {
    const { data: request } = await supabase
      .from('snack_requests')
      .select('user_id')
      .eq('id', id)
      .single()

    const { data: snack } = await supabase
      .from('snacks')
      .select('id, name, image_url, price_approx, purchase_url')
      .eq('id', snack_id)
      .single()

    if (request?.user_id && snack) {
      await supabase.from('cart_items').upsert({
        user_id: request.user_id,
        snack_id: snack.id,
        name: snack.name,
        image_url: snack.image_url,
        price_approx: snack.price_approx,
        purchase_url: snack.purchase_url,
        quantity: 1,
      }, { onConflict: 'user_id,snack_id' })
    }
  }

  return NextResponse.json({ ok: true })
}
