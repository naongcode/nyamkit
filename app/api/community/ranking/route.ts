import { NextResponse } from 'next/server'
import { readPosts } from '../route'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const period = searchParams.get('period') === 'month' ? 'month' : 'week'

  const now = Date.now()
  const cutoff = period === 'week' ? now - 7 * 24 * 60 * 60 * 1000 : now - 30 * 24 * 60 * 60 * 1000

  const posts = await readPosts()
  const ranked = posts
    .filter((p) => new Date(p.created_at).getTime() >= cutoff && p.recommendations > 0)
    .sort((a, b) => b.recommendations - a.recommendations)
    .slice(0, 5)
    .map(({ id, snack_name, nickname, recommendations, image_url }) => ({
      id, snack_name, nickname, recommendations, image_url,
    }))

  return NextResponse.json(ranked)
}
