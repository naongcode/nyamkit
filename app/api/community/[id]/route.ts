import { NextResponse } from 'next/server'
import { readPosts, writePosts } from '../route'

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { password } = await req.json()

  const posts = await readPosts()
  const post = posts.find((p) => p.id === id)
  if (!post) return NextResponse.json({ error: '없는 글이에요.' }, { status: 404 })
  if (post.password !== password.trim()) return NextResponse.json({ error: '비밀번호가 틀렸어요.' }, { status: 403 })

  await writePosts(posts.filter((p) => p.id !== id))
  return NextResponse.json({ ok: true })
}
