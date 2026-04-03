import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { Snack } from '@/types/snack'

export const dynamic = 'force-dynamic'

export async function GET() {
  const { data, error } = await supabase
    .from('snacks')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const newSnack: Snack = {
    ...body,
    id: `snack_${Date.now()}`,
    created_at: new Date().toISOString().split('T')[0],
  }
  const { data, error } = await supabase.from('snacks').insert(newSnack).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

export async function PUT(req: NextRequest) {
  const body = await req.json()
  const { id, ...updates } = body
  const { data, error } = await supabase.from('snacks').update(updates).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'not found' }, { status: 404 })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  const { error } = await supabase.from('snacks').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
