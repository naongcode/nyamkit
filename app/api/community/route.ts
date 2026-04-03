import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { CommunityPost, PublicPost } from '@/types/community'

const FILE = path.join(process.cwd(), 'data', 'community.json')

export async function readPosts(): Promise<CommunityPost[]> {
  const raw = await fs.readFile(FILE, 'utf-8')
  return JSON.parse(raw)
}

export async function writePosts(posts: CommunityPost[]): Promise<void> {
  await fs.writeFile(FILE, JSON.stringify(posts, null, 2))
}

function toPublic(post: CommunityPost): PublicPost {
  const { password: _pw, voter_ids: _v, comments, ...rest } = post
  return {
    ...rest,
    comments: comments.map(({ password: _cp, ...c }) => c),
  }
}

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const offset = Number(searchParams.get('offset') ?? 0)
  const limit = Number(searchParams.get('limit') ?? 10)

  const posts = await readPosts()
  const reversed = posts.slice().reverse()
  const slice = reversed.slice(offset, offset + limit)

  return NextResponse.json({
    posts: slice.map(toPublic),
    hasMore: offset + limit < posts.length,
  })
}

export async function POST(req: Request) {
  const { nickname, password, snack_name, short_desc, price_approx, purchase_url, image_url } = await req.json()

  if (!snack_name?.trim() || !nickname?.trim() || !password?.trim()) {
    return NextResponse.json({ error: '닉네임, 비밀번호, 간식 이름은 필수예요.' }, { status: 400 })
  }

  const posts = await readPosts()
  const newPost: CommunityPost = {
    id: Date.now().toString(),
    nickname: nickname.trim(),
    password: password.trim(),
    snack_name: snack_name.trim(),
    short_desc: short_desc?.trim() ?? '',
    price_approx: price_approx?.trim() || undefined,
    purchase_url: purchase_url?.trim() || undefined,
    image_url: image_url?.trim() || undefined,
    recommendations: 0,
    voter_ids: [],
    comments: [],
    created_at: new Date().toISOString(),
  }
  posts.push(newPost)
  await writePosts(posts)

  return NextResponse.json(toPublic(newPost), { status: 201 })
}
