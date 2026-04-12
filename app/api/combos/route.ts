import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { nanoid } from 'nanoid'

export async function GET() {
  const { data, error } = await supabase
    .from('honey_combos')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { user_id, nickname, title, description, image_url, items } = body

  if (!user_id || !nickname || !title) {
    return NextResponse.json({ error: '필수 항목이 없습니다.' }, { status: 400 })
  }

  const newCombo = {
    id: nanoid(),
    user_id,
    nickname,
    title,
    description: description || null,
    image_url: image_url || null,
    items: items || [],
    likes: 0,
    voter_ids: [],
  }

  const { data, error } = await supabase.from('honey_combos').insert(newCombo).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

export async function PUT(req: NextRequest) {
  const body = await req.json()
  const { id, user_id, nickname, title, description, image_url, items } = body

  if (!id || !user_id) return NextResponse.json({ error: '필수 항목이 없습니다.' }, { status: 400 })

  const { data, error } = await supabase
    .from('honey_combos')
    .update({ nickname, title, description, image_url, items })
    .eq('id', id)
    .eq('user_id', user_id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest) {
  const { id, user_id } = await req.json()
  if (!id || !user_id) return NextResponse.json({ error: '필수 항목이 없습니다.' }, { status: 400 })

  const { error } = await supabase
    .from('honey_combos')
    .delete()
    .eq('id', id)
    .eq('user_id', user_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
