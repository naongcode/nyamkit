import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data, error } = await supabase
    .from('snack_comments')
    .select('id, nickname, text, created_at')
    .eq('snack_id', id)
    .order('created_at', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { nickname, password, text } = await req.json()
  if (!nickname?.trim() || !password?.trim() || !text?.trim()) {
    return NextResponse.json({ error: '닉네임, 비밀번호, 내용은 필수예요.' }, { status: 400 })
  }
  const { data, error } = await supabase
    .from('snack_comments')
    .insert({ id: Date.now().toString(), snack_id: id, nickname: nickname.trim(), password: password.trim(), text: text.trim() })
    .select('id, nickname, text, created_at')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { comment_id, password } = await req.json()
  const { data: comment } = await supabase.from('snack_comments').select('password').eq('id', comment_id).eq('snack_id', id).single()
  if (!comment) return NextResponse.json({ error: '없는 댓글이에요.' }, { status: 404 })
  if (comment.password !== password.trim()) return NextResponse.json({ error: '비밀번호가 틀렸어요.' }, { status: 403 })
  await supabase.from('snack_comments').delete().eq('id', comment_id)
  return NextResponse.json({ ok: true })
}
