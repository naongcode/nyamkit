import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const period = searchParams.get('period') === 'month' ? 'month' : 'week'

  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - (period === 'week' ? 7 : 30))

  const { data, error } = await supabase
    .from('community_posts')
    .select('id, snack_name, nickname, recommendations, image_url')
    .gte('created_at', cutoff.toISOString())
    .gt('recommendations', 0)
    .order('recommendations', { ascending: false })
    .limit(5)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data || [])
}
