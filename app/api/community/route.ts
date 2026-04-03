import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { CommunityPost, PublicPost } from '@/types/community'

export const dynamic = 'force-dynamic'

function toPublic(post: CommunityPost): PublicPost {
  const { password: _pw, voter_ids: _v, comments, ...rest } = post
  return {
    ...rest,
    comments: (comments || []).map(({ password: _cp, ...c }) => c),
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const offset = Number(searchParams.get('offset') ?? 0)
  const limit = Number(searchParams.get('limit') ?? 10)

  const { data, error, count } = await supabase
    .from('community_posts')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({
    posts: (data || []).map(toPublic),
    hasMore: (count ?? 0) > offset + limit,
  })
}

export async function POST(req: Request) {
  const { nickname, password, snack_name, short_desc, items } = await req.json()

  if (!snack_name?.trim() || !nickname?.trim() || !password?.trim()) {
    return NextResponse.json({ error: '닉네임, 비밀번호, 글 제목은 필수예요.' }, { status: 400 })
  }

  const newPost = {
    id: Date.now().toString(),
    nickname: nickname.trim(),
    password: password.trim(),
    snack_name: snack_name.trim(),
    short_desc: short_desc?.trim() ?? '',
    items: items ?? [],
    recommendations: 0,
    voter_ids: [],
    comments: [],
    created_at: new Date().toISOString(),
  }

  const { data, error } = await supabase.from('community_posts').insert(newPost).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(toPublic(data), { status: 201 })
}
