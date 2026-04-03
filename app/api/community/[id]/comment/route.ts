import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { CommunityComment } from '@/types/community'

export const dynamic = 'force-dynamic'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { nickname, password, text } = await req.json()

  if (!text?.trim() || !nickname?.trim() || !password?.trim()) {
    return NextResponse.json({ error: '닉네임, 비밀번호, 내용은 필수예요.' }, { status: 400 })
  }

  const { data: post } = await supabase.from('community_posts').select('comments').eq('id', id).single()
  if (!post) return NextResponse.json({ error: '없는 글이에요.' }, { status: 404 })

  const comment: CommunityComment = {
    id: Date.now().toString(),
    nickname: nickname.trim(),
    password: password.trim(),
    text: text.trim(),
    created_at: new Date().toISOString(),
  }

  await supabase
    .from('community_posts')
    .update({ comments: [...(post.comments || []), comment] })
    .eq('id', id)

  const { password: _pw, ...publicComment } = comment
  return NextResponse.json(publicComment, { status: 201 })
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { comment_id, password } = await req.json()

  const { data: post } = await supabase.from('community_posts').select('comments').eq('id', id).single()
  if (!post) return NextResponse.json({ error: '없는 글이에요.' }, { status: 404 })

  const comments: CommunityComment[] = post.comments || []
  const comment = comments.find((c) => c.id === comment_id)
  if (!comment) return NextResponse.json({ error: '없는 댓글이에요.' }, { status: 404 })
  if (comment.password !== password.trim()) return NextResponse.json({ error: '비밀번호가 틀렸어요.' }, { status: 403 })

  await supabase
    .from('community_posts')
    .update({ comments: comments.filter((c) => c.id !== comment_id) })
    .eq('id', id)

  return NextResponse.json({ ok: true })
}
