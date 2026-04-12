import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { id, voter_id } = await req.json()
  if (!id || !voter_id) return NextResponse.json({ error: '필수 항목이 없습니다.' }, { status: 400 })

  const { data: combo, error: fetchError } = await supabase
    .from('honey_combos')
    .select('likes, voter_ids')
    .eq('id', id)
    .single()

  if (fetchError || !combo) return NextResponse.json({ error: '조합을 찾을 수 없습니다.' }, { status: 404 })

  const voters: string[] = combo.voter_ids || []
  const alreadyLiked = voters.includes(voter_id)

  const newVoters = alreadyLiked ? voters.filter((v) => v !== voter_id) : [...voters, voter_id]
  const newLikes = alreadyLiked ? combo.likes - 1 : combo.likes + 1

  const { error: updateError } = await supabase
    .from('honey_combos')
    .update({ likes: newLikes, voter_ids: newVoters })
    .eq('id', id)

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })
  return NextResponse.json({ likes: newLikes, liked: !alreadyLiked })
}
