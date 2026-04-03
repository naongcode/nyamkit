import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { voter_id } = await req.json()

  const { data: snack } = await supabase.from('snacks').select('likes, voter_ids').eq('id', id).single()
  if (!snack) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const voters: string[] = snack.voter_ids ?? []
  if (voters.includes(voter_id)) {
    return NextResponse.json({ likes: snack.likes, voted: true })
  }

  const { data, error } = await supabase
    .from('snacks')
    .update({ likes: snack.likes + 1, voter_ids: [...voters, voter_id] })
    .eq('id', id)
    .select('likes')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ likes: data.likes, voted: true })
}
