import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { voter_id } = await req.json()
  if (!voter_id) return NextResponse.json({ error: 'voter_id required' }, { status: 400 })

  const { data: post } = await supabase
    .from('community_posts')
    .select('voter_ids, recommendations')
    .eq('id', id)
    .single()

  if (!post) return NextResponse.json({ error: '없는 글이에요.' }, { status: 404 })

  const voterIds: string[] = post.voter_ids || []
  if (voterIds.includes(voter_id)) {
    return NextResponse.json({ error: '이미 추천했어요.' }, { status: 409 })
  }

  const newCount = (post.recommendations || 0) + 1
  await supabase
    .from('community_posts')
    .update({ voter_ids: [...voterIds, voter_id], recommendations: newCount })
    .eq('id', id)

  return NextResponse.json({ recommendations: newCount })
}
