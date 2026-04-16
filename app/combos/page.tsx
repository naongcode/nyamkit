import { HoneyCombo, SnackSummary } from '@/types/snack'
import { supabase } from '@/lib/supabase'
import { createSupabaseServer } from '@/lib/supabase-server'
import Link from 'next/link'
import CombosFeed from './CombosFeed'

export const dynamic = 'force-dynamic'

async function getCombos(): Promise<HoneyCombo[]> {
  const { data, error } = await supabase
    .from('honey_combos')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) console.error('[getCombos error]', error)
  return (data || []) as HoneyCombo[]
}

async function getSnacks(): Promise<SnackSummary[]> {
  const { data } = await supabase.from('snacks').select('id, name, image_url, price_approx, purchase_url, volume, pkg_count')
  return (data || []) as SnackSummary[]
}

export default async function CombosPage() {
  const supabaseServer = await createSupabaseServer()
  const { data: { user } } = await supabaseServer.auth.getUser()
  const [combos, snacks] = await Promise.all([getCombos(), getSnacks()])

  return (
    <main className="max-w-2xl mx-auto px-4 pb-24">
      <header className="py-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold tracking-widest text-orange-400 uppercase mb-0.5">냠냠이의 먹킷리스트</p>
          <h1 className="text-2xl font-bold">🍯 꿀조합</h1>
        </div>
        <Link href="/combos/new" className="bg-orange-500 text-white text-sm font-medium px-4 py-2 rounded-full">
          + 올리기
        </Link>
      </header>

      {combos.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-3 text-center">
          <span className="text-5xl">🍯</span>
          <p className="text-base font-medium text-gray-600">아직 꿀조합이 없어요</p>
          <p className="text-sm text-gray-400">첫 번째 꿀조합을 올려보세요!</p>
          <Link href="/combos/new" className="mt-2 bg-orange-500 text-white text-sm font-medium px-6 py-2.5 rounded-full">
            꿀조합 올리기
          </Link>
        </div>
      ) : (
        <CombosFeed combos={combos} snacks={snacks} userId={user?.id ?? null} />
      )}
    </main>
  )
}
