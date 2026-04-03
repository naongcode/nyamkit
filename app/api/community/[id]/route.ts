import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { password, snack_name, short_desc, items } = await req.json()

  const { data: post } = await supabase.from('community_posts').select('password').eq('id', id).single()
  if (!post) return NextResponse.json({ error: '없는 글이에요.' }, { status: 404 })
  if (post.password !== password.trim()) return NextResponse.json({ error: '비밀번호가 틀렸어요.' }, { status: 403 })

  const { data, error } = await supabase
    .from('community_posts')
    .update({ snack_name, short_desc, items: items ?? [] })
    .eq('id', id)
    .select('id, nickname, snack_name, short_desc, items, recommendations, comments, created_at')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { password } = await req.json()

  const { data: post } = await supabase.from('community_posts').select('password').eq('id', id).single()
  if (!post) return NextResponse.json({ error: '없는 글이에요.' }, { status: 404 })
  if (post.password !== password.trim()) return NextResponse.json({ error: '비밀번호가 틀렸어요.' }, { status: 403 })

  await supabase.from('community_posts').delete().eq('id', id)
  return NextResponse.json({ ok: true })
}
