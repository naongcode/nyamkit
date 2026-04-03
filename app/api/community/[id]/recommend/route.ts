import { NextResponse } from 'next/server'
import { readPosts, writePosts } from '../../route'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { voter_id } = await req.json()
  if (!voter_id) return NextResponse.json({ error: 'voter_id required' }, { status: 400 })

  const posts = await readPosts()
  const post = posts.find((p) => p.id === id)
  if (!post) return NextResponse.json({ error: '없는 글이에요.' }, { status: 404 })
  if (post.voter_ids.includes(voter_id)) {
    return NextResponse.json({ error: '이미 추천했어요.' }, { status: 409 })
  }

  post.voter_ids.push(voter_id)
  post.recommendations++
  await writePosts(posts)

  return NextResponse.json({ recommendations: post.recommendations })
}
